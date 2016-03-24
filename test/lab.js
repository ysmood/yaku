/*eslint-disable */

var Promise = Yaku = require("../src/yaku");
var utils = require("../src/utils")

        // function * gen () {
        //     yield Promise.reject(10);
        // }

        function gen () {
            return { i: 0, next: function () {
                var done = this.i++ >= 10;
                return {
                    done: done,
                    value: !done && new Yaku(function (r, rr) {
                        return setTimeout((function () {
                            return rr(1);
                        }), 1);
                    })
                };
            }, "throw": function (err) {
                throw err;
            } };
        }

        return utils.async(gen)().catch(function (v) {
            console.log(v)
        });

// function * gen () {
//     try {
//         yield 1;
//     } catch (err) {
//         return 0
//     }
// }

// var g = gen();

// g.next();
// console.log(g.throw(1));
