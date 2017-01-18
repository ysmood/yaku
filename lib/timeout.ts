import Promise from './yaku'

export default <T>(promise: Promise<T>, time: number, error?) => {
    if (error === void 0)
        error = new Error("time out");

    return new Promise((resolve, reject) => {
        setTimeout(reject, time, error);
        Promise.resolve(promise).then(resolve, reject);
    });
};
