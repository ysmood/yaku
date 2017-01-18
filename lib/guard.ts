import Promise from './yaku'

Promise.prototype['guard'] = function (type, onRejected) {
    return this["catch"](reason => {
        if (reason instanceof type && onRejected)
            return onRejected(reason);
        else
            return Promise.reject(reason);
    });
};
