"use strict";
var yaku_1 = require("./yaku");
try {
    eval('global.Promise = Yaku');
    window['Promise'] = yaku_1["default"];
}
catch (err) {
    null;
}
