var env = process.env;

module.exports = {
    env: env.NODE_ENV,

    server: {
        port: env.PORT || 3000,
        host: env.HOST || '0.0.0.0'
    },

    mongoose: require('./mongoose'),

    session: {
        secret: 'secretsauce',
        name: 'sid',
        cookie: {
            path: '/',
            httpOnly: true,
            maxAge: null
        },
        resave: false,
        saveUninitialized: false
    }
};