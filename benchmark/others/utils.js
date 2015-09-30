module.exports = {
    run: function (span, fn) {
        var count, start;
        span = span * 1000;
        start = Date.now();
        count = 0;
        while (Date.now() - start < span) {
            fn();
            count++;
        }
        return count;
    }
};
