var spawnSync = require("child_process").spawnSync;

module.exports = function (name) {
    var out = ["test-basic", "test-es6", "test-aplus"].reduce(function (s, test) {
        var args = [test];

        args.push("-s", name);

        s += spawnSync("no", args).stdout.toString();

        return s;
    }, "");

    // remove terminal color codes
    out = out.replace(/\x1B\[([0-9]{1,2}(;[0-9]{1,2})?)?[m|K]/g, "");

    // search the stdout "failing 11", "failed 23"
    var count = [/^junit cli > failed (\d+)$/mg, /^\s*(\d+) failing$/mg]
        .reduce(function (s, reg) {
            var ms = out.match(reg);
            if (ms) s += ms.reduce(function (s, m) {
                s += +m.match(/\d+/);
                return s;
            }, 0);
            return s;
        }, 0);

    if (count === 0)
        return "✓";
    else
        return "x (" + count + " failing)";
};
