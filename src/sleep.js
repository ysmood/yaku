import _ from "./_";

export default (time, val) => new _.Promise(r => {
    setTimeout(r, time, val);
});
