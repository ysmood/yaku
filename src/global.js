var Yaku = require('./yaku');

var root = (typeof global === 'undefined') ? window : global;

try {
    root.Promise = Yaku;

    Object.defineProperty(root, 'Promise', {
        value: Yaku,
        enumerable: false
    });

    Object.defineProperty(Promise, 'name', {
        value: 'Promise',
        enumerable: false
    });
} catch (err) {
    null;
}
