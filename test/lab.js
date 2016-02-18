/*eslint-disable */

var Promise = require("../src/yaku");
// Promise.enableLongStackTrace()

process.on('unhandledRejection', (r, p) => {
    setTimeout(function () {
        p.catch(function () { })
    }, 1)
    console.log('##')
});

process.on('rejectionHandled', (p) => {
    console.log('**', p === gp)
});

var gp = Promise.reject(10)

// window.onunhandledrejection = (r, p) => {
//     setTimeout(function () {
//         p.catch(function () { })
//     }, 1000)
//     console.log('##')
// };

// window.onrejectionhandled = (p) => {
//     console.log('**')
// };

// Promise.reject(10)