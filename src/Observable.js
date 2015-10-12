var _ = require("./_");

var Observable = module.exports = function Observable (executor) {
    var self = this
    , emit = genEmit(self);

    self.children = [];

    executor && executor(emit);
};

_.extendPrototype(Observable, {
    parent: null,

    subscribe: function (onEmit, onError) {
        var self = this, child = new Observable();
        child._onEmit = onEmit;
        child._onError = onError;
        child._nextErr = genNextErr(child.emit);

        child.parent = self;
        self.children.push(child);

        return child;
    },

    unsubscribe: function () {
        var parent = this.parent;
        parent && parent.children.splice(parent.children.indexOf(this), 1);
    }

});

function genEmit (self) {
    return self.emit = function (val) {
        var i = 0, len = self.children.length, child;
        while (i < len) {
            child = self.children[i++];
            _.Promise.resolve(val).then(
                child._onEmit,
                child._onError
            ).then(
                child.emit,
                child._nextErr
            );
        }
    };
}

function genNextErr (emit) {
    return function (reason) {
        emit(_.Promise.reject(reason));
    };
}
