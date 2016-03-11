export default function (err?) {
    setTimeout(function () {
        throw err;
    });
};
