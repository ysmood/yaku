import Promise from './yaku'
import genIterator from "./genIterator";

export default (iterable) => {
    var iter = genIterator(iterable);

    return new Promise((resolve, reject) => {
        var countDown = 0;
        var reasons = [];
        var item;

        function onError (reason) {
            reasons.push(reason);
            if (!--countDown)
                reject(reasons);
        }

        while (!(item = iter.next()).done) {
            countDown++;
            Promise.resolve(item.value).then(resolve, onError);
        }
    });
};
