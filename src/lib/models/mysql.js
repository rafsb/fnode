/*---------------------------------------------------------------------------------------------
 * MySQL
 *--------------------------------------------------------------------------------------------*/

const
md5        = require('md5')
// , mysql    = require("mysql2/promise")
, mysql    = require("mysql2")
, fw       = require('../fw')
, fobject  = require('../utils/fobject')
, farray   = require('../utils/farray')
, fdate    = require('../utils/fdate')
, ftext    = require('../utils/ftext')

// MACROS
, connect = conf => {
    // const hash = conf ? md5(JSON.stringify(conf)) : null ;;
    // if((!hash || global.dbhash == hash) && global.mysql_connection) return global.mysql_connection.promise()

    // if(global.mysql_connection) await global.mysql_connection.end()

    conf = {
        host                    : conf?.host     || DB_ENDPOINT
        , user                  : conf?.user     || DB_USER
        , password              : conf?.password || DB_PASSWORD
        , port                  : conf?.port     || DB_PORT
        , database              : conf?.database || DB_NAME
        // , waitForConnections    : true
        // , connectionLimit       : 10
        // , queueLimit            : 0
        // , enableKeepAlive       : true
        // , keepAliveInitialDelay : 0
    }

    // const pool =  mysql.createPool(conf)
    const pool = mysql.createConnection(conf) ;;

    // global.mysql_connection = pool
    // global.dbhash = hash

    // return global.mysql_connection.promise()
    return pool.promise()
}

;;

module.exports = class MySQL_Traits extends fobject {

    async client(conf){
        this.client = await connect(conf || this.conf)
        return this.client
    }

    close() {
        this.client?.end()
    }

    async load(conf) {
        this.conf = conf
        return this
    }

    async item(item_id, table_name, conf) {
        let res = [] ;;
        try {
            if(!item_id) console.error(new Date(), 'MySQL', 'item', 'item_id is required');
            else {
                const
                conn = await connect(conf || this.conf)
                , [ rows ] = await conn.query(`SELECT * FROM ${table_name} WHERE id="${item_id}"`)
                ;;
                conn.end()
                if(rows.length) res = rows
            }
        } catch(e) { console.error(new Date(), 'MySQL', 'item', e.toString()) }
        return res[0] || null
    }

    async count(query, conf){
        const
        db = await connect(conf || this.conf)
        , query_string = `SELECT COUNT(*) AS n FROM ${this.conf.container}`
        , [[res]] = await db.query(query_string)
        ;;
        db.end()
        return res.n
    }

    async query(q, type=fobject, conf) {
        const res = { status: 0, items: [] } ;;
        try {
            const
            conn = await connect(conf || this.conf)
            , [rows] = await conn.query(q)
            ;;
            if(rows.length) res.items = rows.map(i => type.cast(i))
            conn.end()
            res.status = true
        } catch(e) {
            res.error = e.code || e
            if(VERBOSE > 1) console.trace(e)
        }
        return res
    }

    async save(item, conf) {
        const
        db = await connect(conf || this.conf)
        , [rows] = await db.query(`SELECT id FROM ${this.conf.container} WHERE id="${item.id}"`)
        , query_string = rows.length
            ? `UPDATE ${this.conf.container} SET ${Object.keys(item).map(k => `${k}=${item[k] == "" || item[k] == null  ? 'NULL' : (isNaN(item[k]) ? '"'+item[k]+'"' : item[k])}`).join(',')} WHERE id="${item.id}"`
            : `INSERT INTO ${this.conf.container}(${Object.keys(item).join(',')}) VALUES(${Object.values(item).map(v => v === null || v === "" ? 'NULL' : (isNaN(v) ? `"${v}"` : v)).join(',')})`
        ;;
        const [res] = await db.query(query_string) ;;
        db.end()
        return { status: Boolean(res.affectedRows), stats: res }
    }

    async drop(id, conf) {
        const
        db = await connect(conf || this.conf)
        , query_string = `DELETE FROM ${this.conf.container} WHERE id="${id}"`
        , [res] = await db.query(query_string)
        ;;
        db.end()
        return res
    }

    async bulk(items, counter=-1){

    }

    async list_conteiners() {

    }

    async * iterator(query, cls=fobject, conn) {
        if(!query) return null
        if(!conn) conn = this.conf || { }
        if(conn.nextToken) conn = JSON.parse(ftext.decrypt(Buffer.from(conn.nextToken, 'base64').toString('utf8')))
        else conn.query = query
        let has ;;
        do {
            const
            db = await connect(conn)
            , [rows] = await db.query(`${conn.query} LIMIT 50 OFFSET ${conn.offset || 0}`)
            ;;
            conn.offset = (conn.offset || 0) + rows.length
            has = rows.length && true
            db.end()
            yield {
                items: rows.map(item => cls.cast(item)) || []
                , nextToken: Buffer.from(ftext.encrypt(JSON.stringify(conn)), 'utf8').toString('base64')
            }
        } while(has)
    }

    static cast(obj){
        return new MySQL_Traits(obj)
    }

    static async load(conf){
        return await (new MySQL_Traits()).load(conf)
    }

}