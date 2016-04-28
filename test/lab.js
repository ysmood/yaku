/*eslint-disable */

var Promise = Yaku = require("../src/yaku");
var utils = require("../src/utils")


        var fn = utils.retry(2, 10, function (v) {
            return v;
        });

        fn(1)
        fn(2)
        fn(3)
