import _ from "./_";

export default (cond: boolean, trueFn: Function, falseFn: Function) =>
    _.Promise.resolve(cond).then(val => val ?
        trueFn() :
        (_.isFunction(falseFn) && falseFn()));
