const { MongoClient } = require("mongodb");
const log             = require('loglevel')

const dbUrl = process.env.DATABASE_URL;

class Database {
    client; 

    /**
     * Connect
     */
    async connect() {
        this.client = new MongoClient(dbUrl)
        await this.client.connect();

        log.info('Successfully connected to MongoDB')
    }

    /**
     * Use db
     * @param {*} dbName 
     */
    async useDb(dbName) {
        this.db = this.client.db(dbName);

        await this.db.command({ping: 1})
        log.info('Successfully connected to database ' + dbName)

        return this.db;
    }

    /**
     * Find One
     * @param {string} table 
     * @param {object} match 
     * @param {object} options 
     * @returns object
     */
    async findOne(table, match = {}, options = {}) {
        return this.db.collection(table).findOne(match, options)
    }

    /**
     * Find Many
     * @param {string} table 
     * @param {object} match 
     * @param {object} options 
     * @returns 
     */
    async findMany(table, match = {}, options = {}) {
        return this.db.collection(table).find(match, options)
    }

    /**
     * Insert
     * @param {string} table 
     * @param {object} doc 
     * @returns 
     */
    async insertOne(table, doc) {
        return this.insert(table,doc)
    }

    /**
     * Update
     * @param {string} table 
     * @param {object} match 
     * @param {object} set 
     * @returns 
     */
     async updateOne(table, match, set) {
        return this.db.collection(table).updateOne(match, {$set: set})
    }
}

module.exports = Database;