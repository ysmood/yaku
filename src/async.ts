import _ from "./_";
import genIterator from "./genIterator";
import isPromise from "./isPromise";

export interface Progress<T> {
    (val: T): void;
}

export interface Async {
    <T>(iterable: Iterable<T>, saveResults?: boolean, progress?: Progress<T>): Promise<T[]>;

    <T>(limit: number, iterable: Iterable<T>, saveResults?: boolean, progress?: Progress<T>): Promise<T[]>;
}

let async: Async = function (limit, list?, saveResults?, progress?) {
    let resutls, running;
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

    let iter = genIterator(list);

    return new _.Promise(function (resolve, reject) {
        let results, resultIndex = 0;

        function addTask (index) {
            let p, task;

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

        let i = limit;
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

export default async;
