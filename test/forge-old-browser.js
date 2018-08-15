/**
 * Test if Yaku works as expected on browser env.
 */

var k;
global.window = {};
global.self = window;
for (k in global) {
    window[k] = global[k];
}

window.process = null;
window.Symbol = null;
var Yaku = require('../src/yaku');
var testSuit = require('./testSuit');

module.exports = testSuit('long stack trace', function (it) {

    Yaku.enableLongStackTrace();

    return it('basic', 'ok', function () {
        return Yaku.resolve().then(function () {
            return 'ok';
        });
    });

});
