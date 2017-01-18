import Promise from './yaku'

export default (time: number, val?) => new Promise(r => {
    setTimeout(r, time, val);
});
