const express      = require('express');
const bodyParser   = require("body-parser");
const helmet       = require('helmet');
const filter       = require('content-filter');
const cors         = require('cors');
const Routes       = require('../routes')
const Database     = require('../components/database');
const moment       = require('moment-timezone')
const log          = require('loglevel')
const fs           = require('fs');

const HTTP_PORT                  = process.env.HTTP_PORT ?? 3000;
const DATABASE_NAME              = process.env.DATABASE_NAME;
const LOGS_DIR   = __dirname + '/../../logs/'
const getLogFile = (methodName) => LOGS_DIR+methodName+'_'+moment().tz('Europe/London').format('DD-MM-YYYY')+'.log'

var originalFactory = log.methodFactory;
log.methodFactory = function (methodName, logLevel, loggerName) {
    var rawMethod = originalFactory(methodName, logLevel, loggerName);
    return function (message) {
        rawMethod(message);

        if(methodName) {
            if(!fs.existsSync(LOGS_DIR)) {
                fs.mkdirSync(LOGS_DIR)
            }

            const msg = moment().tz('Europe/London').format('DD/MM/YYYY HH:mm') + ': ' + JSON.stringify(message) + "\r\n"

            fs.appendFile(getLogFile(methodName), msg, err => {
                if(err) {
                    console.error(err)
                }
            })
        }
    };
};

log.setLevel('info');

class Server {
    /**
     * @var string
     */
    env;

    /**
     * @param {*} autoBoot 
     */
    constructor(autoBoot = true) {
        if (autoBoot) {
            this.boot()
        }
        this.env = process.env.APP_ENV ?? 'production'
    }

    /**
     * Boot
     */
    async boot() {
        // Connect to database
        await this.bootDatabase()

        // Setup express
        this.bootExpress()
    }

    /**
     * Connect to Database
     */
    async bootDatabase() {
        // Connect to availability DB
        this.db = new Database();
        await this.db.connect()
        await this.db.useDb(DATABASE_NAME)
    }

    /**
     * Setup Express
     */
    bootExpress() {
        this.app = express();
        this.app.use(helmet());
        this.app.use(filter({
            methodList: [
                'GET',
                'PUT',
                'POST',
                'PATCH',
                'DELETE',
            ],
        }));

        // Set needed headers for the application.
        this.app.options('*', cors());
        this.app.use(cors());

        // Set body parser
        this.app.use(bodyParser.urlencoded({ extended: false }));
        this.app.use(bodyParser.json());

        // Setup express routes
        this.routes = new Routes(this);
        
        // Start listening
        this.app.listen(HTTP_PORT)

        log.info('Express listening on port '+HTTP_PORT)
    }
}

module.exports = Server
