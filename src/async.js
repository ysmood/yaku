var _ = require("./_");

var tryErr = {};

function tryCatch (gen, key, val) {
    try {
        return gen[key](val);
    } catch (err) {
        tryErr.err = err;
        return tryErr;
    }
}

module.exports = function (generator) {
    return function () {
        var gen = generator.apply(this, arguments);

        return new _.Promise(function (resolve, reject) {
            function genNext (val) {
                return step("next", val);
            }

            function genThrow (val) {
                return step("throw", val);
            }

            function step (key, val) {
                var info = tryCatch(gen, key, val);

                if (info === tryErr)
                    return reject(info.err);

                if (info.done) {
                    resolve(info.value);
                } else {
                    return _.Promise.resolve(info.value).then(genNext, genThrow);
                }
            }

            return step("next");
        });
    };
};
