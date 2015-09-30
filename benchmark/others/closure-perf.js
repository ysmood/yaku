
/*

As a result execute closure at runtime is very expensive.

foo: 269ms
bar: 7ms
 */
var bar, foo, foo_, test;

foo = function () {
    (function () {
        1 + 2;
    })();
};

foo_ = function () {
    var s = function () {
        1 + 2;
    };
    s();
    1 + 2;
};

bar = function () {
    1 + 2;
};

test = function (name, fn) {
    var countDown;
    countDown = Math.pow(10, 6);
    console.time(name);
    while (countDown--) {
        fn();
    }
    return console.timeEnd(name);
};

test("foo", foo);

test("foo_", foo_);

test("bar", bar);
