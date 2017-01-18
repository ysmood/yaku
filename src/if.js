import _ from "./_";

export default (cond, trueFn, falseFn) => _.Promise.resolve(cond).then(val => val ?
    trueFn() :
    (_.isFunction(falseFn) && falseFn()));
