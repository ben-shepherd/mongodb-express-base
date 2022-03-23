const express = require('express');

// Routes
const Health = require('./health')

class Routes {
    constructor(server) {
        this.server = server;
        this.urlPrefix = '/api/v1';
        this.load()
    }

    load() {
        this.routes = express.Router({
            caseSensitive: false,
        });

        // Health check
        this.routes.route('/health')
            .get(Health(this.server));

        // Use routes
        this.server.app.use(this.urlPrefix, this.routes)
    }
}  

module.exports = Routes;