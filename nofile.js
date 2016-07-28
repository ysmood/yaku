var kit = require("nokit");
var _ = kit._;
var Promise = kit.Promise;
kit.require("drives");

module.exports = function (task, option) {
    option("-g, --grep <pattern>", "run test that match the pattern", ".");
    option("--noAplus", "don't run the promises-aplus-tests");
    option("-w, --watch", "webpack watch");
    option("-s, --shim <name>", "the promise shim to require, check the test/getPromise.js file for details", "yaku");

    task("default build", ["doc", "code", "browser"], true);

    task("doc", ["code"], "build doc", function () {
        var size;
        size = kit.statSync("dist/yaku.min.js").size / 1024;
        return kit.warp("src/*.js")
        .load(kit.drives.comment2md({
            tpl: "docs/readme.jst.md",
            doc: {
                size: size.toFixed(1)
            }
        })).run();
    });

    function addLicense (str) {
        var version;
        version = kit.require("./package", __dirname).version;
        return ("/*\n Yaku v" + version +
            "\n (c) 2015 Yad Smood. http://ysmood.org\n License MIT\n*/\n")
            + str;
    }

    task("code", ["lint"], "build source code", function () {
        return kit.warp(["src/**", "src/*.d.ts"]).load(function (f) {
            if (f.dest.name === "yaku") {
                return f.set(addLicense(f.contents));
            }
        }).run("lib").then(function () {
            kit.mkdirsSync("dist");
            return Promise.all([
                kit.spawn("uglifyjs", ["-mc", "-o", "dist/yaku.min.js", "lib/yaku.js"]),
                kit.spawn("uglifyjs", ["-mc", "-o", "dist/yaku.core.min.js", "lib/yaku.core.js"])
            ]);
        });
    });

    task("lint", "lint js files", function () {
        return kit.spawn("eslint", ["src/*.js", "test/*.js"]);
    });

    task("all", ["lint"], "bundle all", function () {
        process.env.NODE_ENV = "production";
        return kit.spawn("webpack");
    });

    task("lab l", "run and monitor \"test/lab.js\"", function () {
        var args;
        args = ["test/lab.js"];
        return kit.monitorApp({
            args: args,
            watchList: ["src/*.js", "test/**"]
        });
    });

    task("test", "run all tests", [
        "test-basic", "test-yaku", "test-browser",
        "test-forge-browser",
        "test-aplus", "test-es6",
        "coverage"
    ], true);

    task("test-core", "run tests for yaku.core", true, function () {
        return kit.spawn("no", [
            "--shim", "yaku.core",
            "test-basic", "test-aplus", "test-es6"
        ]);
    });

    task("test-yaku", "test yaku specs", function (opts) {
        var junitOpts = ["cover", "junit",
            "--print", "none",
            "--dir", "coverage/yaku", "--", "-g", opts.grep];

        return kit.spawn("istanbul", junitOpts.concat([
            "test/utils.js",
            "test/unhandledRejection.js"])
        );
    });

    task("test-basic", "test basic specs tests", function (opts) {
        var junitOpts = ["cover", "junit",
            "--print", "none",
            "--dir", "coverage/basic", "--", "-g", opts.grep, "-b", "off"];

        process.env.shim = opts.shim;

        return kit.spawn("istanbul", junitOpts.concat(["test/basic.js"]));
    });

    task("test-forge-browser", "forge browser env and test", function (opts) {
        var junitOpts = ["cover", "junit",
            "--print", "none",
            "--dir", "coverage/forge-browser", "--", "-g", opts.grep, "-b", "off"];

        return kit.spawn("istanbul", junitOpts.concat(["test/forge-browser.js"]));
    });

    task("test-aplus", "test aplus tests", function (opts) {
        return kit.spawn("istanbul", [
            "cover",
            "--print", "none",
            "test/promises-aplus-tests.js",
            "--dir", "coverage/aplus",
            "--",
            JSON.stringify(opts)
        ]);
    });

    task("test-es6", "test es6 tests", function (opts) {
        return kit.spawn("istanbul", [
            "cover",
            "--print", "none",
            "test/promises-es6-tests.js",
            "--dir", "coverage/aplus",
            "--",
            JSON.stringify(opts)
        ]);
    });

    task("test-browser", ["browser"], "use phantomjs to test", function () {
        return kit.spawn("phantomjs", ["test/phantom.js"]);
    });

    task("coverage", "combine the coverage reports", function () {
        return kit.spawn("istanbul", [
            "report", "--include",
            "coverage/*/coverage.json"
        ]);
    });

    task("benchmark", "compare performance between different libraries", function () {
        process.env.NODE_ENV = "production";

        var os = require("os");
        global.console.log("Date: " + (new Date)
            + "\nNode " + process.version // eslint-disable-line
            + "\nOS   " + (os.platform())
            + "\nArch " + (os.arch())
            + "\nCPU  " + (os.cpus()[0].model) + "\n\n"
            + "| name | unit tests | coverage | 1ms async task | optional helpers | helpers | min js |\n"
            + "| ---- | ---------- | -------- | -------------- | ---------------- | ------- | ------ |"
        );

        var names = _.keys(require("./test/getPromise").map);

        return kit.all(1, { next: function () {
            var name = names.shift();
            return {
                done: !name,
                value: name && kit.spawn("node", ["benchmark/index.js", name])
            };
        } });
    });

    task("benchmark-asyncWrapper", function () {
        process.env.NODE_ENV = "production";

        var names = _.keys(require("./benchmark/asyncWrapper/getWrapper").map);

        return kit.all(1, { next: function () {
            var name = names.shift();
            return {
                done: !name,
                value: name && kit.spawn("node", ["benchmark/asyncWrapper/index.js", name])
            };
        } });
    });

    task("clean", "Clean temp files", function () {
        return kit.remove("lib");
    });

    task("browser", "Unit test on browser", function (opts) {
        return kit.spawn("webpack", ["--progress",  opts.watch ? "--watch" : ""]);
    });
};
