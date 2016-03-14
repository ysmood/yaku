import _ from "./_";

export default function (cond: boolean | Promise<boolean>, trueFn?: Function, falseFn?: Function) {
    return _.Promise.resolve(cond).then(function (val) {
        return val ?
            trueFn() :
            (_.isFunction(falseFn) && falseFn());
    });
};
