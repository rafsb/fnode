/*---------------------------------------------------------------------------------------------
 * SQLServer
 *--------------------------------------------------------------------------------------------*/

const
mssql       = require("mssql")
, fobject   = require('../utils/object')
, farray    = require('../utils/array')
, fdate     = require('../utils/date')
, ftext     = require('../utils/text')
, { info, error } = require('../entities/log')

// MACROS
, connect = async conf => {

    conf = fobject.blend({
        server                  : conf?.server   || DB_ENDPOINT
        , user                  : conf?.user     || DB_USER
        , password              : conf?.password || DB_PASSWORD
        , database              : conf?.database || DB_NAME
        , port                  : DB_PORT
        // , waitForConnections    : true
        // , connectionLimit       : 10
        // , queueLimit            : 0
        // , enableKeepAlive       : true
        // , keepAliveInitialDelay : 0
        , options: { encrypt: false } // Use this if you're on Windows Azure
    }, conf)

    if(conf.port) conf.port = parseInt(conf.port)

    const pool = await mssql.connect(conf) ;;
    // if(VERBOSE) info(`MSSQL`,`connect`, 'connection attempted')
    return pool
}

;;

mssql.on('end', _ => {
    if(VERBOSE) info(`MSSQL`,`end`, 'connection close')
    mssql.close()
})

module.exports = class MSSQL_Traits extends fobject {

    async client(conf) {
        return await connect(conf || this._Conf)
    }

    close() {
        mssql.close()
    }

    async load(conf) {
        this._Conf = conf
        return this
    }

    async item(item_id, conf) {
        let res = [] ;;
        try {
            if(!item_id) error('mssql', 'item', 'item_id is required');
            else {
                const
                conn = await connect(conf || this._Conf)
                , [ rows ] = await conn.request().query(`SELECT * FROM ${this._Conf.container} WHERE id="${item_id}"`)
                ;;
                conn.close()
                if(rows.length) res = rows
            }
        } catch(e) { error('mssql', 'item', e.toString()) }
        return res[0] || null
    }

    async count(conf){
        const
        query_string = `SELECT COUNT(*) AS n FROM ${this._Conf.container}`
        , conn = await connect(conf || this._Conf)
        , found = await conn.request().query(query_string)
        ;;
        conn.close()
        return found?.recordset[0]?.n || 0
    }

    async query(q, conf) {
        const res = { status: 0, items: [] } ;;
        try {
            // console.log(q)
            const
            conn = await connect(conf || this._Conf)
            , {recordset, rowsAffected} = await conn.request().query(q)
            ;;

            res.status = Boolean(rowsAffected)
            if(res.status) res.items = recordset
        } catch(e) {
            res.error = e.code || e.toString()
            error(`mssql`, `query`, q + ` - ` + res.error)
            if(VERBOSE > 2) console.trace(e)
        }
        return res
    }

    async save(item, conf) {
        const db = await connect(conf || this._Conf)
        let operation = `i` ;;
        if(item.id == -1) delete item.id
        if(item.id) {
            const res = await db.request().query(`SELECT id FROM ${this._Conf.pk ? `[${this._Conf.pk}].` : ``}${this._Conf.container} WHERE id='${item.id}'`)
            if(res.recordset?.length) operation = `u`
        }
        const 
        query_string = operation == `u` 
            ? `UPDATE ${this._Conf.pk ? `[${this._Conf.pk}].` : ``}[${this._Conf.container}]
               SET ${Object.keys(item).map(k => `[${k}]='${item[k]}'`).join(',')}
               WHERE id='${item.id}'`
            : `INSERT INTO ${this._Conf.pk ? `[${this._Conf.pk}].` : ``}[${this._Conf.container}]([${Object.keys(item).join('],[')}])
               VALUES(${Object.values(item).map(v => `'${v}'`).join(',')})`
        ;;
        // console.log(query_string)
        const { rowsAffected: res } = await db.request().query(query_string) ;;
        db.close()
        return { status: Boolean(res[0]) }
    }

    async drop(id, conf) {
        const
        query_string = `DELETE FROM [${DB_NAME}].${DB_PK?`[${DB_PK}].`:``}[${this._Conf.container}] WHERE [id]='${id}'`
        , conn = await connect(conf || this._Conf)
        , res = await conn.request().query(query_string)
        ;;
        conn.close()
        res.q = query_string
        res.status = Boolean(res.rowsAffected[0])
        return res
    }

    async bulk(items, counter=-1){

    }

    async list_conteiners() {

    }

    async * iterator(query, conn) {
        if(!query) return null
        if(!conn) conn = this._Conf || { }
        if(conn.nextToken) conn = JSON.parse(ftext.decrypt(Buffer.from(conn.nextToken, 'base64').toString('utf8')))
        else conn.query = query
        let has ;;
        do {
            const
            db = await connect(conf || this._Conf)
            , [rows] = await db.request().query(`${conn.query} LIMIT 50 OFFSET ${conn.offset || 0}`)
            ;;
            conn.offset = (conn.offset || 0) + rows.length
            has = rows.length && true
            db.close()
            yield {
                items: rows.map(item => cls.cast(item)) || []
                , nextToken: Buffer.from(ftext.encrypt(JSON.stringify(conn)), 'utf8').toString('base64')
            }
        } while(has)
    }

    static cast(obj){
        return new MSSQL_Traits(obj)
    }

    static async load(conf){
        return await (new MSSQL_Traits()).load(conf)
    }

}