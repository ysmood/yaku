import _ from "./_";

export default (promise, time, error) => {
    if (error === void 0)
        error = new Error("time out");

    return new _.Promise((resolve, reject) => {
        setTimeout(reject, time, error);
        _.Promise.resolve(promise).then(resolve, reject);
    });
};
