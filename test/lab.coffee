Promise = require '../src/yaku'
utils = require '../src/utils'

list = [
    -> utils.sleep 10, 1
    -> throw 10
    -> utils.sleep 10, 3
]

utils.async 2, list
.catch (err) -> err
