var _ = require("./_");

module.exports = function source (executor) {
    function src (onEmit, onError) {
        var nextSrc = source();
        nextSrc.onEmit = onEmit;
        nextSrc.onError = onError;
        nextSrc.nextSrcErr = function (reason) {
            nextSrc.emit(_.Promise.reject(reason));
        };

        src.children.push(nextSrc);

        return nextSrc;
    }

    src.emit = function (val) {
        src.value = val = _.Promise.resolve(val);
        var i = 0, len = src.children.length, child;
        while (i < len) {
            child = src.children[i++];
            val.then(
                child.onEmit,
                child.onError
            ).then(
                child.emit,
                child.nextSrcErr
            );
        }
    };

    src.children = [];
    src.value = _.Promise.resolve();

    executor && executor(src.emit);

    return src;
};
