var kit = require("nokit");
kit.require("drives");

module.exports = function (task, option) {
    option("--debug", "run with remote debug server");
    option("--port <8219>", "remote debug server port", 8219);
    option("--grep <pattern>", "run test that match the pattern", ".");
    option("--noAplus", "don't run the promises-aplus-tests");
    option("--browserPort <8227>", "browser test port", 8227);

    task("default build", ["doc", "code"]);

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
            return kit.spawn("uglifyjs", ["-mc", "-o", "dist/yaku.min.js", "lib/yaku.js"]);
        });
    });

    task("lint", "lint js files", function () {
        kit.removeSync("{lib,dist}");
        return kit.spawn("eslint", ["src/*.js"]);
    });

    task("all", ["lint"], "bundle all", function () {
        process.env.NODE_ENV = "production";
        return kit.spawn("webpack");
    });

    task("lab l", "run and monitor \"test/lab.js\"", function (opts) {
        var args;
        args = ["test/lab.js"];
        if (opts.debug) {
            kit.log(opts.debug);
            args.splice(0, 0, "--nodejs", "--debug-brk=" + opts.port);
        }
        return kit.monitorApp({
            args: args,
            watchList: ["src/*.js", "test/**"]
        });
    });

    task("test", "run Promises/A+ tests", ["test-yaku", "test-aplus"], true);

    task("test-yaku", "test yaku specs tests", function (opts) {
        var junitOpts = ["-g", opts.grep];

        return kit.spawn("junit", junitOpts.concat([
            "test/basic.js",
            "test/unhandledRejection.js"])
        );
    });

    task("test-aplus", "test aplus tests", require("./test/promises-aplus-tests.js"));

    task("test-es6", "test es6 tests", require("./test/promises-es6-tests.js"));

    task("benchmark", "compare performance between different libraries", function () {
        process.env.NODE_ENV = "production";

        var os = require("os");
        console.log("Node " + process.version // eslint-disable-line
            + "\nOS     " + (os.platform())
            + "\nArch " + (os.arch())
            + "\nCPU    " + (os.cpus()[0].model) + "\n"
            + (kit._.repeat("-", 80)));

        var paths = kit.globSync("benchmark/*.js");

        return kit.async(1, { next: function () {
            var path = paths.pop();
            return {
                done: !path,
                value: path && kit.spawn("node", [path])
            };
        } });
    });

    task("clean", "Clean temp files", function () {
        return kit.remove("{.nokit,lib,.nobone}");
    });

    task("browser", "Unit test on browser", function () {
        kit.spawn("webpack", ["--progress", "--watch"]);
    });
};
