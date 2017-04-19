var Yaku = require("./yaku");

try {
    // TODO: #45 revert it in the future
    (global||{}).Promise = Yaku;
    window.Promise = Yaku;
} catch (err) {
    null;
}