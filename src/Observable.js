var _ = require("./_");

function Observable (executor) {
    var self = this;
    self.emit = genEmit(self);
    executor && executor(self.emit);
}

function genEmit (self) {
    return function emit (val) {
        var i = 0, len = self.children.length, child;
        var nextErr = genNextErr(emit);
        while (i < len) {
            child = self.children[i++];
            Promise.resolve(val).then(
                child._onEmit,
                child._onError
            ).then(
                child.emit,
                nextErr
            );
        }
    };
}

function genNextErr (emit) {
    return function (reason) {
        emit(_.Promise.reject(reason));
    };
}

Observable.prototype = {
    parent: null,
    children: [],

    subscribe: function (onEmit, onError) {
        var child = new Observable();
        child._onEmit = onEmit;
        child._onError = onError;

        child.parent = this;
        this.children.push(child);

        return child;
    },

    unsubscribe: function () {
        var parent = this.parent;
        parent.splice(parent.children.indexOf(this), 1);
    }

};

module.exports = Observable;
