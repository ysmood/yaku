import _ from "./_";

export default () => {
    var defer;
    defer = {};
    defer.promise = new _.Promise((resolve, reject) => {
        defer.resolve = resolve;
        return defer.reject = reject;
    });
    return defer;
};
