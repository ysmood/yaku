module.exports = function (err) {
    setTimeout(function () {
        if (err instanceof Error)
            throw err;
        else
            throw JSON.stringify(err, null, 4);
    });
};
