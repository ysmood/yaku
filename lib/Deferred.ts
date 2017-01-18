import Promise from './yaku'

export interface Deferred<T> {
    resolve: Function
    reject: Function
    promise: Promise<T>
}

export default <T>() => {
    var defer;
    defer = {};
    defer.promise = new Promise((resolve, reject) => {
        defer.resolve = resolve;
        return defer.reject = reject;
    });
    return defer as Deferred<T>;
};
