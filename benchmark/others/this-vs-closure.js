var A, a, utils;

utils = require("./utils");

A = (function () {
    var bar1;

    function A () {
        this.count1 = 0;
        this.count2 = 0;
    }

    bar1 = function (self) {
        return self.count1++;
    };

    A.prototype.foo1 = function () {
        var self;
        self = this;
        return (function () {
            return (function () {
                return bar1(self);
            })();
        })();
    };

    A.prototype.foo2 = function () {
        var self;
        self = this;
        return (function () {
            return (function () {
                return self.bar2();
            })();
        })();
    };

    A.prototype.bar2 = function () {
        return this.count2++;
    };

    return A;

})();

a = new A;

utils.run(2, function () {
    return a.foo1();
});

console.log(a.count1);

utils.run(2, function () {
    return a.foo2();
});

console.log(a.count2);

utils.run(2, function () {
    return a.foo1();
});

console.log(a.count1);

utils.run(2, function () {
    return a.foo2();
});

console.log(a.count2);
