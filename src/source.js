var _ = require("./_");

function Observer (executor) {
    executor && executor(this.emit);
}

Observer.prototype = {
    parent: null,
    children: [],

    value: _.Promise.resolve(),

    subscribe: function (onEmit, onError) {
        var child = new Observer();
        child._onEmit = onEmit;
        child._onError = onError;

        child.parent = this;
        this.children.push(child);

        return child;
    },

    unsubscribe: function () {
        var parent = this.parent;
        parent.splice(parent.children.indexOf(this), 1);
    },

    emit: function (val) {
        this.value = val = _.Promise.resolve(val);
        var i = 0, len = this.children.length, child;
        while (i < len) {
            child = this.children[i++];
            val.then(
                child._onEmit,
                child._onError
            ).then(
                child.emit,
                child._nextSrcErr
            );
        }
    },

    _nextSrcErr: function (reason) {
        this.emit(_.Promise.reject(reason));
    }
};

module.exports = Observer;
