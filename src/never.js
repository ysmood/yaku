var _ = require('./_');

function noop () {}

module.exports = function () {
    return new _.Promise(noop);
};
