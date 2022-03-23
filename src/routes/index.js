// Routes
const V1 = require('./v1')

class Routes {
    constructor(server) {
        this.server = server;
        this.load()
    }

    load() {
        // V1 routes
        this.v1 = new V1(this.server)
    }
}  

module.exports = Routes;