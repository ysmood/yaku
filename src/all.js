var _ = require("./_");
var genIterator = require("./genIterator");
var isPromise = require("./isPromise");

module.exports = function (limit, list, saveResults, progress) {
    var resutls, running;
    resutls = [];
    running = 0;
    if (!_.isNumber(limit)) {
        progress = saveResults;
        saveResults = list;
        list = limit;
        limit = Infinity;
    }
    if (saveResults == null) {
        saveResults = true;
    }

    var iter = genIterator(list);

    return new _.Promise(function (resolve, reject) {
        var results, resultIndex = 0;

        function addTask (index) {
            var p, task;

            task = iter.next();
            if (task.done) {
                if (running === 0) {
                    allDone();
                }
                return false;
            }

            if (isPromise(task.value)) {
                p = task.value;
            } else {
                p = _.Promise.resolve(task.value);
            }

            running++;

            p.then(function (ret) {
                running--;
                if (saveResults) {
                    resutls[index] = ret;
                }
                if (typeof progress === "function") {
                    progress(ret);
                }
                return addTask(resultIndex++);
            })["catch"](function (err) {
                running--;
                return reject(err);
            });

            return true;
        }

        function allDone () {
            if (saveResults) {
                return resolve(resutls);
            } else {
                return resolve();
            }
        }

        var i = limit;
        results = [];
        while (i--) {
            if (!addTask(resultIndex++)) {
                break;
            } else {
                results.push(void 0);
            }
        }

        return results;
    });
};
