/*eslint-disable */

var Promise = Yaku = require("../src/yaku");
var utils = require("../src/utils")

        var gen = utils.async(function gen () {
            return {
                next: function () {
                    return {
                        done: false,
                        value: Yaku.reject("err")
                    };
                },
                "throw": function (err) {
                    return {
                        done: true,
                        value: Yaku.reject(err)
                    };
                }
            };
        })

return gen().catch(function (v) { return console.log(v); });
