import _ from "./_";
import genIterator from "./genIterator";

export default function<T> (iterable: IterableOrArray<T>): Promise<T> {
    let iter = genIterator(iterable);

    return new _.Promise(function (resolve, reject) {
        let countDown = 0
        , reasons = []
        , item;

        function onError (reason) {
            reasons.push(reason);
            if (!--countDown)
                reject(reasons);
        }

        while (!(item = iter.next()).done) {
            countDown++;
            _.Promise.resolve(item.value).then(resolve, onError);
        }
    });
};
