var _ = require('./_');

module.exports = function (dict) {
    var list = [];
    var newDict = {};

    for(var i in dict) {
        list.push([i, dict[i]]);
    }

    return _.Promise.all(list.map(function (tuple) {
        return _.Promise.resolve(tuple[1]).then(function (val) {
            newDict[tuple[0]] = val;
        });
    })).then(function () {
        return newDict;
    });
};
