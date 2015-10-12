var kit;

kit = require("nokit");
var Promise = kit.Promise;

kit.require("drives");

module.exports = function (task, option) {
    option("--debug", "run with remote debug server");
    option("--port <8219>", "remote debug server port", 8219);
    option("--grep <pattern>", "run test that match the pattern", ".");
    option("--noAplus", "don't run the promises-aplus-tests");
    option("--sync", "sync benchmark");
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
        return ("/*\n Yaku v" + version + "\n (c) 2015 Yad Smood. http://ysmood.org\n License MIT\n*/\n") + str;
    }

    task("code", ["lint"], "build source code", function () {
        return kit.warp("src/*.js").load(function (f) {
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
            args: args
        });
    });

    task("test", "run Promises/A+ tests", function (opts) {
        var junitOpts = ["-s", "test/testSuit.js", "-g", opts.grep];

        return Promise.all([
            kit.spawn("junit", junitOpts.concat(["test/basic.js"])),
            kit.spawn("junit", junitOpts.concat(["-l", 1, "test/unhandledRejection.js"]))
        ]).then(function () {
            if (!opts.noAplus)
                return require("./test/compliance.js")({
                    grep: opts.grep
                });
        });
    });
    task("benchmark", "compare performance between different libraries", function (opts) {
        var os, paths, sync;
        process.env.NODE_ENV = "production";
        os = require("os");
        console.log("Node " + process.version + "\nOS     " + (os.platform()) + "\nArch " + (os.arch()) + "\nCPU    " + (os.cpus()[0].model) + "\n" + (kit._.repeat("-", 80)));
        paths = kit.globSync("benchmark/*.js");
        sync = opts.sync ? "sync" : "";
        return kit.async(paths.map(function (path) {
            return function () {
                return kit.spawn("node", [path, sync]);
            };
        }));
    });

    task("clean", "Clean temp files", function () {
        return kit.remove("{.nokit,lib,.nobone}");
    });

    task("browser", "Unit test on browser", function (opts) {
        var app, body, flow, ref, select;
        ref = kit.require("proxy"), flow = ref.flow, select = ref.select, body = ref.body;
        app = flow();
        app.push(body(), select("/log", function ($) {
            kit.logs($.reqBody + "");
            return $.next();
        }), select("/", function ($) {
            return $.body = kit.readFile("dist/test-browser.js").then(function (js) {
                return "<html><body><div id='junit-reporter'></div></body><script>" +
                    js +
                    "</script>\n</html>";
            });
        }));
        kit.spawn("webpack", ["--progress", "--watch"]);
        return kit.sleep(2000).then(function () {
            return app.listen(opts.browserPort);
        }).then(function () {
            kit.log("Listen " + opts.browserPort);
            return kit.xopen("http://127.0.0.1:" + opts.browserPort);
        });
    });
};
