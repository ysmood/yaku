/**
 * It's a webpack loader for correctly compile the `getPromise.js` when run unit test
 * in phantomjs
 */

module.exports = function () {
    return "module.exports = function () { return require('../src/yaku'); };";
};