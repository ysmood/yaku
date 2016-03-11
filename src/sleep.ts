import _ from "./_";

export default function (time?: number, val?) {
    return new _.Promise(function (r) {
        return setTimeout((function () {
            return r(val);
        }), time);
    });
};
