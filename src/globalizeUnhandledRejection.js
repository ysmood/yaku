var Yaku = require("./yaku");

module.exports = function () {
    var root = typeof global === "object" ? global : window;
    var _onUnhandledRejection = Yaku.onUnhandledRejection;
    Yaku.onUnhandledRejection = function (value, promise) {
        var handler;
        if(root.process) {
            process.emit("unhandledRejection", value, promise);
        } else if(handler = global.onunhandledrejection){
            handler({ promise: promise, reason: value });
        } else {
            _onUnhandledRejection(value, promise);
        }
    };
};
