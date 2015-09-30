var bar, foo, obj, utils;

utils = require("./utils");

foo = function () {
    return this.count++;
};

bar = function (self) {
    return self.count++;
};

obj = {
    count: 0
};

utils.run(3, function () {
    return foo.call(obj);
});

console.log(obj.count);

obj = {
    count: 0
};

utils.run(3, function () {
    return bar(obj);
});

console.log(obj.count);
