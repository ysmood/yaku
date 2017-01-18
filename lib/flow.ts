import _ from "./_";
import genIterator from "./genIterator";
import isPromise from "./isPromise";
import Promise from './yaku'

export default iterable => {
    var iter = genIterator(iterable);

    return val => {
        function run (pre) {
            return pre.then(val => {
                var task = iter.next(val);

                if (task.done) {
                    return val;
                }
                var curr = task.value as Function;
                return run(
                    isPromise(curr) ? curr :
                        _.isFunction(curr) ? Promise.resolve(curr(val)) :
                            Promise.resolve(curr)
                );
            });
        }

        return run(Promise.resolve(val));
    };
};
