var kit = require("nokit");
var _ = kit._;

module.exports = function (p) {
    return kit.readFile(p, "utf8").then(function (str) {
        var dict = {};

        var safeChars = _.pull(_.range(1, 32), 10, 13);

        var keyWords = _.chain(str.match(/\w{2,}/g))
            .tail()
            .countBy()
            .pairs()
            .sortBy(_.last)
            .map(_.first)

            // The first 30 chars are the safe ascii chars to use,
            // to support old IE, we cannot use utf8.
            .takeRight(safeChars.length)

            .value();

        str = _.reduce(keyWords, function (str, kw) {
            var holder = String.fromCharCode(safeChars.pop());
            dict[holder] = kw;
            return str.replace(
                new RegExp("([^\\w])" + kw + "([^\\w])", "g"),
                "$1" + holder + "$2"
            );
        }, str.replace(/\\/g, "\\\\"));

        var res = "for(var keys='" + _.keys(dict).join("|")
            + "',values='" + _.values(dict).join("|")
            + "',dict={},ks=keys.split('|'),vs=values.split('|'),i=ks.length;i--;)dict[ks[i]]=vs[i];eval('" + str
            + "'.replace(new RegExp(keys,'g'),function(e){return dict[e]}));";

        return kit.outputFile(p, res);
    });
};
