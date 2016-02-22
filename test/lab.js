/*eslint-disable */

var Promise = require("../src/yaku");
// var utils = require("../src/utils")

function BadResolverPromise(executor) {
    // var p = new Promise(executor);
    // executor(3, function () {});

    // this.then = p.then;
    this.constructor = BadResolverPromise;
}
BadResolverPromise.prototype = Promise.prototype;
// BadResolverPromise.all = Promise.all;
// BadResolverPromise.race = Promise.race;
// BadResolverPromise.reject = Promise.reject;
// BadResolverPromise.resolve = Promise.resolve;

console.log('####', (new BadResolverPromise)._Yaku)

// BadResolverPromise.race([1, 2])
