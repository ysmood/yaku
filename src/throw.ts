export default err => {
    setTimeout(() => {
        throw err;
    });
};
