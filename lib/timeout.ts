import _ from "./_";

let { Promise } = _

export default <T>(promise: Promise<T>, time: number, error?) => {
    if (error === void 0)
        error = new Error("time out");

    return new _.Promise((resolve, reject) => {
        setTimeout(reject, time, error);
        _.Promise.resolve(promise).then(resolve, reject);
    });
};
