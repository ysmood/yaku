var test, test2;

test = function () {
    var count, foo, start;
    count = 0;
    foo = function () {
        return count++;
    };
    start = Date.now();
    while (Date.now() - start < 1000 * 2) {
        foo();
    }
    return console.log(count);
};

test2 = function () {
    var count, foo, start;
    try {
        count = 0;
        foo = function () {
            return count++;
        };
        start = Date.now();
        while (Date.now() - start < 1000 * 2) {
            foo();
        }
        return console.log(count);
    } catch (undefined) { null; }
};

test();

try {
    test();
} catch (undefined) { null; }

test2();
