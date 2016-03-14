import _ from "./_";
import genIterator from "./genIterator";
import isPromise from "./isPromise";

export interface Flow {
    (iterable: Iterable<any>): (val) => Promise<any>;
    (...args: Function[]): (val) => Promise<any>;
}

let flow: Flow = function (...args) {
    let iter: Iterator<any>;

    if (args.length === 0)
        iter = genIterator(args[0]);
    else
        iter = genIterator(args);

    return function (val) {
        function run (pre) {
            return pre.then(function (val) {
                let task = iter.next(val);

                if (task.done) {
                    return val;
                }
                let curr = task.value;
                return run(
                    isPromise(curr) ? curr :
                        _.isFunction(curr) ? _.Promise.resolve(curr(val)) :
                            _.Promise.resolve(curr)
                );
            });
        }

        return run(_.Promise.resolve(val));
    };
};

export default flow;
