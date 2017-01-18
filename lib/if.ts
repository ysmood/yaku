import _ from "./_";
import Promise from './yaku'

export default (cond: boolean, trueFn: Function, falseFn: Function) =>
    Promise.resolve(cond).then(val => val ?
        trueFn() :
        (_.isFunction(falseFn) && falseFn()));
