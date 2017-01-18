import _ from "./_";

export default (time: number, val?) => new _.Promise(r => {
    setTimeout(r, time, val);
});
