require('dotenv').config();
const Server = require('./server');

const server = new Server();

module.exports.server = server;