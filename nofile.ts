/// <reference path="./typings/node.d.ts" />

let kit = require("nokit");
let _ = kit._;
kit.require("drives");

declare let __dirname;

export default function (task, option) {
    option("--debug", "run with remote debug server");
    option("--port <8219>", "remote debug server port", 8219);
    option("-g, --grep <pattern>", "run test that match the pattern", ".");
    option("--noAplus", "don't run the promises-aplus-tests");
    option("--browserPort <8227>", "browser test port", 8227);
    option("-w, --watch", "webpack watch");
    option("-s, --shim <name>", "the promise shim to require, check the test/getPromise.js file for details", "yaku");

    task("default build", ["doc", "code", "browser"]);

    task("doc", ["code"], "build doc", function () {
        let size;
        size = kit.statSync("dist/yaku.min.js").size / 1024;
        return kit.warp("src/*.ts")
        .load(kit.drives.comment2md({
            tpl: "docs/readme.jst.md",
            doc: {
                size: size.toFixed(1)
            }
        })).run();
    });

    function addLicense (str) {
        let version;
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
        return kit.spawn("tslint", ["src/*.ts", "test/*.ts"]);
    });

    task("all", ["lint"], "bundle all", function () {
        process.env.NODE_ENV = "production";
        return kit.spawn("webpack");
    });

    task("lab l", "run and monitor \"test/lab.js\"", function (opts) {
        let args;
        args = ["test/lab.ts"];
        if (opts.debug) {
            kit.log(opts.debug);
            args.splice(0, 0, "--nodejs", "--debug-brk=" + opts.port);
        }
        return kit.monitorApp({
            args: args,
            watchList: ["src/*.ts", "test/**"]
        });
    });

    task("test", "run Promises/A+ tests", ["test-basic", "test-yaku", "test-aplus", "test-es6"], true);

    task("test-yaku", "test yaku specs", function (opts) {
        let junitOpts = ["-g", opts.grep, "-r", "ts-node/register"];

        return kit.spawn("junit", junitOpts.concat([
            "test/utils.ts",
            "test/unhandledRejection.ts"])
        );
    });

    task("test-basic", "test basic specs tests", function (opts) {
        let junitOpts = ["-g", opts.grep, "-r", "ts-node/register"];

        process.env.shim = opts.shim;

        return kit.spawn("junit", junitOpts.concat(["test/basic.ts"]));
    });

    task("test-aplus", "test aplus tests", require("./test/promises-aplus-tests.ts"));

    task("test-es6", "test es6 tests", require("./test/promises-es6-tests.ts"));

    task("benchmark", "compare performance between different libraries", function () {
        process.env.NODE_ENV = "production";

        let os = require("os");
        console.log("Node " + process.version // eslint-disable-line
            + "\nOS   " + (os.platform())
            + "\nArch " + (os.arch())
            + "\nCPU  " + (os.cpus()[0].model) + "\n\n"
            + "| name | unit tests | 1ms async task | optional helpers | helpers | min js |\n"
            + "| ---- | ---------- | -------------- | ---------------- | ------- | ------ |"

        );

        let names = _.keys(require("./test/getPromise").map);

        return kit.async(1, { next: function () {
            let name = names.shift();
            return {
                done: !name,
                value: name && kit.spawn("node", ["benchmark/index.js", name])
            };
        } });
    });

    task("clean", "Clean temp files", function () {
        return kit.remove("{.nokit,lib,.nobone}");
    });

    task("browser", "Unit test on browser", function (opts) {
        return kit.spawn("webpack", ["--progress",  opts.watch ? "--watch" : ""]);
    });
};
