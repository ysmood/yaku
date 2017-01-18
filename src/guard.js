import _ from "./_";

_.Promise.prototype.guard = function (type, onRejected) {
    return this["catch"](reason => {
        if (reason instanceof type && onRejected)
            return onRejected(reason);
        else
            return _.Promise.reject(reason);
    });
};
