/*eslint-disable */


// var observer = require('promise-observer');
// var Promise = require('bluebird');

// var start, values = [];
// var push = values.push.bind(values);

// var src = observer.create(function(emit) { start = emit; })

// var a = src(function(val) { return Promise.delay(1).thenReturn(val + 1); })

// setTimeout(function () {
//     var b = src(function(val) { return a.next().thenReturn(val + 2); });
//     b(push);
// }, 2000)


// a(push);

// setInterval(function () {
//     return start(0).then(function() {
//         console.log(values)
//         values = [];
//     });
// }, 1000);


var Observable = require('../src/Observable');
function delay (t, v) { return new Promise(function (r) { setInterval(r, t, v); }) }

var src = new Observable(function (emit) { setInterval(emit, 1000, 0); });

var a = src.subscribe(function (v) { return delay(20, v + 1); });
var b = src.subscribe(function (v) { return delay(10, v + 2); });
var c = b.subscribe(function (v) { return delay(10, v + 1); });

var out = Observable.leaves(src);

out.subscribe(function (v) { console.log(v); }); // => log [1, 2] every 1 second