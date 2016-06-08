var _ = require("./_");
var Promise = _.Promise;
var genIterator = require("./genIterator");

var tryErr = {};

function tryCatch (step, key) {
    try {
        return step(key);
    } catch (err) {
        tryErr.err = err;
        return tryErr;
    }
}

module.exports = function (limit, list) {
    if (!_.isNumber(limit)) {
        list = limit;
        limit = Infinity;
    }

    return new Promise(function (resolve, reject) {
        var running = 0;
        var gen = genIterator(list);
        var done = false;

        function genNext (val) {
            running--;
            return step("next", val);
        }

        function genThrow (val) {
            running--;
            return step("throw", val);
        }

        function step (key, val) {
            if (done) {
                if (running === 0)
                    resolve();
                return;
            }

            while (running < limit) {
                var info = gen[key](val);

                if (info.done) {
                    return done = true;
                } else {
                    running++;
                    Promise.resolve(info.value).then(genNext, genThrow);
                }
            }
        }

        var ret = tryCatch(step, "next");

        if (ret === tryErr)
            reject(ret.err);
    });
};
