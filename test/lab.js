/*eslint-disable */

// require('core-js')

// var Promise = require("../src/yaku");
var Promise = require("my-promise").Promise;
var setPrototypeOf = require("setprototypeof");

var Symbol = global.Symbol || {};

if (!Symbol.species)
    Symbol.species = 'Symbol(species)';

function sleep (time) {
    return new Promise(function (resolve) {
        setTimeout(resolve, time);
    });
}

        // function BadResolverPromise(executor) {
        //     var p = new Promise(executor);
        //     executor(3, function () {});

        //     this.then = p.then;
        //     this.constructor = BadResolverPromise;
        // }
        // BadResolverPromise.prototype = Promise.prototype;
        // BadResolverPromise.all = Promise.all;
        // BadResolverPromise.race = Promise.race;
        // BadResolverPromise.reject = Promise.reject;
        // BadResolverPromise.resolve = Promise.resolve;

        // new BadResolverPromise(function () {}).then(function () {});





        // var promise = new Promise(function (it){ it(42); });

        // promise.constructor = function () { };

        // return promise.then(function () {
        //     console.log("ok");
        // });






        // var promise, FakePromise1, FakePromise2;
        // promise = new Promise(function (it){ it(42); });

        // promise.constructor = FakePromise1 = function a (it){
        //     it(function () {}, function () {});
        // };

        // FakePromise1[Symbol.species] = FakePromise2 = function b (it){
        //     it(function () {}, function () {});
        // };
        // setPrototypeOf(FakePromise2, Promise);
        // return console.log(
        //     promise.then(function () {}) instanceof FakePromise2
        // );







        function SubPromise (it) {
            var self;
            self = new Promise(it);
            setPrototypeOf(self, SubPromise.prototype);
            self.mine = "subclass";
            return self;
        }

        var result = [];

        setPrototypeOf(SubPromise, Promise);
        SubPromise.prototype = Object.create(Promise.prototype);
        SubPromise.prototype.constructor = SubPromise;

        var p1 = SubPromise.resolve(5);
        result.push(p1.mine);
        p1 = p1.then(function (it) {
            return result.push(it);
        });
        result.push(p1.mine);

        var p2 = new SubPromise(function (it) {
            return it(6);
        });
        result.push(p2.mine);
        p2 = p2.then(function (it) {
            return result.push(it);
        });
        result.push(p2.mine);

        var p3 = SubPromise.all([p1, p2]);
        result.push(p3.mine);
        result.push(p3 instanceof Promise);
        result.push(p3 instanceof SubPromise);

        return p3.then(sleep(50), function (it) {
            return result.push(it);
        }).then(function () {
            return console.log(result);
        });
