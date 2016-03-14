import _ from "./_";
let $retryError = {};

export interface Retry {
    (errs: any[]): boolean | Promise<boolean>;
}

export interface Attempt {
    (...args: any[]): Promise<any>;
}

export default function (retries: number | Retry, fn: Function, self?) {
    let errs = [], args;
    let attempt: Attempt;

    let countdown = _.isFunction(retries) ?
        <Retry>retries : function () { return Boolean(retries = <number>retries - 1); };

    function tryFn (isContinue) {
        return isContinue ? fn.apply(self, args) : _.Promise.reject($retryError);
    }

    function onError (err) {
        if (err === $retryError) return _.Promise.reject(errs);

        errs.push(err);
        return attempt();
    }

    attempt = function () {
        if (args === void 0) args = arguments;
        return _.Promise.resolve(countdown(errs)).then(tryFn).catch(onError);
    }

    return attempt;
};
