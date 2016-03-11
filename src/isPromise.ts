import _ from "./_";

export default function (obj): boolean {
    return obj && _.isFunction(obj.then);
};
