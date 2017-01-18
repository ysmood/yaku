import _ from "./_";
import genIterator from "./genIterator";
import isPromise from "./isPromise";

export default iterable => {
    var iter = genIterator(iterable);

    return val => {
        function run (pre) {
            return pre.then(val => {
                var task = iter.next(val);

                if (task.done) {
                    return val;
                }
                var curr = task.value;
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
