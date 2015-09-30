
/*

closure: 46ms
nonClosure: 21ms
 */
var closure;

closure = function () {
    var async, countDown, foo, i, len, list, results;
    countDown = Math.pow(10, 5);
    list = [];
    len = 0;
    async = function (fn) {
        return list[len++] = fn;
    };
    process.on("exit", function () {
        return console.timeEnd("closure");
    });
    foo = function () {
        var a, b;
        a = 1;
        b = 2;
        async(function () {
            a + b;
        });
    };
    process.nextTick(function () {
        var fn, j, len1, results;
        results = [];
        for (j = 0, len1 = list.length; j < len1; j++) {
            fn = list[j];
            results.push(fn());
        }
        return results;
    });
    console.time("closure");
    i = countDown;
    results = [];
    while (i--) {
        results.push(foo());
    }
    return results;
};

// nonClosure = function () {
//     var async, bar, c, countDown, foo, len, list, results;
//     countDown = Math.pow(10, 5);
//     list = [];
//     len = 0;
//     async = function (fn, a, b) {
//         list[len++] = fn;
//         list[len++] = a;
//         return list[len++] = b;
//     };
//     process.on("exit", function () {
//         return console.timeEnd("nonClosure");
//     });
//     bar = function (a, b) {
//         a + b;
//     };
//     foo = function () {
//         var a, b;
//         a = 1;
//         b = 2;
//         async(bar, a, b);
//     };
//     process.nextTick(function () {
//         var i, results;
//         i = 0;
//         results = [];
//         while (i < len) {
//             results.push(list[i++](list[i++], list[i++]));
//         }
//         return results;
//     });
//     console.time("nonClosure");
//     c = countDown;
//     results = [];
//     while (c--) {
//         results.push(foo());
//     }
//     return results;
// };

closure();
