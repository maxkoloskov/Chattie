module.exports = {
    uri: 'mongodb://localhost/' + (process.env.NODE_ENV == 'test' ? 'chattie_test' : 'chattie'),
    options: {
        user: "",
        pass: "",
        server: {
            socketOptions: {
                keepAlive: 1
            }
        }
    }
};