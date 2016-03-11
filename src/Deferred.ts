import _ from "./_";

interface Deferred<T> {
    promise: Promise<T>;
    resolve: (val?) => void;
    reject: (reason?) => void;
}

export default function<T> (): Deferred<T> {
    let defer: Deferred<T> = <Deferred<T>>{};

    defer.promise = new _.Promise(function (resolve, reject) {
        defer.resolve = resolve;
        return defer.reject = reject;
    });

    return defer;
};
