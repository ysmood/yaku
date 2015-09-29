var Promise = require('./yaku');
var end = require('./end');
var _ = require('./_');
var isPromise = require('./isPromise');

module.exports = function (limit, list, saveResults, progress) {
    var isIterDone, iter, iterIndex, resutls, running;
    resutls = [];
    running = 0;
    isIterDone = false;
    iterIndex = 0;
    if (!_.isNumber(limit)) {
        progress = saveResults;
        saveResults = list;
        list = limit;
        limit = Infinity;
    }
    if (saveResults == null) {
        saveResults = true;
    }
    if (_.isArray(list)) {
        iter = function () {
            var el;
            el = list[iterIndex];
            if (el === void 0) {
                return end;
            } else if (_.isFunction(el)) {
                return el();
            } else {
                return el;
            }
        };
    } else if (_.isFunction(list)) {
        iter = list;
    } else {
        throw new TypeError('wrong argument type: ' + list);
    }
    return new Promise(function (resolve, reject) {
        var addTask, allDone, i, results;
        addTask = function () {
            var index, p, task;
            task = iter();
            index = iterIndex++;
            if (isIterDone || task === end) {
                isIterDone = true;
                if (running === 0) {
                    allDone();
                }
                return false;
            }
            if (isPromise(task)) {
                p = task;
            } else {
                p = Promise.resolve(task);
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
                return addTask();
            })["catch"](function (err) {
                running--;
                return reject(err);
            });
            return true;
        };
        allDone = function () {
            if (saveResults) {
                return resolve(resutls);
            } else {
                return resolve();
            }
        };
        i = limit;
        results = [];
        while (i--) {
            if (!addTask()) {
                break;
            } else {
                results.push(void 0);
            }
        }
        return results;
    });
};
