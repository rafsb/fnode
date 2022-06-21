/*---------------------------------------------------------------------------------------------
 * Entity
 *--------------------------------------------------------------------------------------------*/

require('../../etc/database/credentials');

const
VERBOSE  = false
, IO     = require("../io")
, Classname = require(`./classname`)
, { App, FObject, FArray, FDate } = require('../il')
;;

class Entity extends Classname {

    uid(x){ if(x) this.id = x; return this.id }

    p(field, x){ if(x!==null&&x!==undefined) this[field] = x; return this[field] }
    set(field, x){ if(x!==null&&x!==undefined) this[field] = x; return this[field] }

    cast(obj){ return new this.constructor(obj) }
    static cast(obj) { return new this.classname().cls(obj) }

    import(src_name){
        if(IO.exists(src_name)){
            IO.jout(src_name).each(src => this[src.key] = src.value)
            this.id           = this.id ? this.id : App.md5(src_name)
            src_name          = src_name.split('/');
            this.source_name_ = src_name[src_name.length - 1].replace(/(.json\b)|(.js\b)/gi, '')
            this.status_      = this.status_ || EStatus.NOT_SET
            return this
        }
        fail(this.classname().name, 'import', 'path not found: ' + src_name);
        return false
    }
    static import(src_name){
        return this.classname().cls.cast().import(src_name)
    }

    toObject(){ return { ...this } }
    export(path){
        const obj = this.toObject() ;;
        if(path) IO.jin(path, obj);
        return obj
    }

    dbconf(conf){
        if(typeof conf == 'string' && IO.exists(`etc/database/conf/${conf}.json`)) conf = IO.jout(`etc/database/conf/${conf}.json`);
        const
        classname = conf && conf.classname ? { name: conf.classname, cls: eval(conf.classname) } : this.classname()
        ;;
        return App.blend({
            db          : DB_NAME
            , endpoint  : DB_ENDPOINT
            , port      : DB_PORT
            , container : `${classname.name}`
        }, conf)
    }
    static dbconf(conn){
        return this.classname().cls.cast().dbconf(conn)
    }

    /**
     * @override
    */
    validate(){ return true }

    static build_query(opts={}){
        /**
         * DABATASE QUERY LANGUAGE
         */
        return `SELECT * FROM ${this.classname().name} ORDER BY created_ DESC LIMIT 1000`
    }

    async pipe(conn){

        /**
         * DATABASE CONNECTION DRIVER
         */
        return this

    }

    static async pipe(conn) { return this.classname().cls.cast().pipe(conn) }

    async load(id, conn) {

        conn = this.dbconf(conn);
        var item = null;

        if(IO_MODE) {
            const path = `var/db/${conn.db}/${conn.container}/${id}` ;;
            item = IO.exists(path) ? IO.jout(path) : null;
        } else {
            /**
             * DATABSE RULES
             */
        }

        return item ? this.classname().cls.cast(item) : null
    }

    static async load(id, conn){ return this.classname().cls.cast().load(is, conn) }

    async save(args) {
        try {
            const
            classname = args && args.classname ? { name: args.classname, cls: eval(args.classname) } : this.classname()
            , conn = classname.cls.dbconf(args)
            ;;
            var
            o = this.toObject()
            , ret = false
            ;;
            if(o && !o.isNull()) {
                if(this.validate()) {
                    if(IO_MODE) ret = this.export(`var/db/${conn.db}/${conn.container}/${this.uid()}`);
                    else {
                        const
                        pipe = await this.pipe()
                        ;;
                        /**
                         * DATABSE RULES
                         */
                    }
                } else return fail(`${classname.name}`, `save`, `validation requirements not fullfilled`)
            } else return fail(`${classname.name}`, `save`, `could not convert *this into object`)
            return ret ? this.classname().cls.cast(ret) : false
        } catch(e){
            if(VERBOSE) console.trace(e);
            return false
        }
    }

    async drop(conn){

        conn = this.dbconf(conn);
        var item = null;

        if(IO_MODE) {
            const path = `var/db/${conn.db}/${conn.container}/${this.id}` ;;
            item = IO.exists(path) ? IO.rm(path) : null
        } else {
            /**
             * DATABSE RULES
             */
        }
        return item
    }

    static async list(order, dir=`DESC`, conn) {

        conn = this.dbconf(conn);
        const classtype = this.classname() ;;
        var items = [];

        if(IO_MODE) {
            items = IO.files(`var/db/${conn.db}/${conn.container}`).extract(item => IO.jout(`var/db/${conn.db}/${conn.container}/${item}`));
            if(order) items = items.sort((a, b) => dir.toUpperCase() == `DESC` ? a[order] - b[order] : b[order] - a[order]);
        } else {
            /**
             * DATABASE RULES
             */
        }

        return items && items.length ? items.map(item => classtype.cls.cast(item)) : new FArray()
    }

    static async ls(order, dir, conn) { return await this.list(order, dir, conn) }

    static async count(filter, conn) {

        conn = this.dbconf(conn);
        var res = 0 ;;

        if(IO_MODE) res = IO.files(`var/db/${conn.db}/${conn.container}`).length;
        else {
            /**
             * DATABASE RULES
             */
        }
        return res
    }

    static async filter(filter, order, dir, conn) {

        conn = this.dbconf(conn);
        const classtype = this.classname() ;;
        var items = [];

        if(IO_MODE) items = IO.files(`var/db/${conn.db}/${conn.database}/`).extract(item => {
            item = IO.jout(`var/db/${conn.db}/${conn.database}/${item}`);
            if(!item) return null;
            var pass = true;
            FObject.cast(filter).each(f => { if(item[f.key] != f.value) pass = false })
            return pass ? classtype.cls.cast(item) : null
        }); else {
            /**
             * DATABSE RULES
             */
        }

        return items
    }

    static async bulk(items, conn) {

        conn = this.dbconf(conn);
        var classtype = this.classname(), res = null;

        if(IO_MODE) {
            for(let i in items) {
                const it = classtype.cls.cast(items[i]);
                if(it.validate()) {
                    const item_path = `var/db/${conn.db}/${conn.container}/${it.uid()}`;
                    if(IO.exists(item_path)) it = classname.cls.cast(App.blend(IO.jout(item_path)||{}, it));
                    res = IO.jin(item_path, it);
                } else fail(`${conn.db}`, `${conn.container}`,m `${it.id} validation not fullfilled`);
            }
         } else {
            /**
             * DATABSE RULES
             */
        }

        return res
    }

    // @override
    static async sync_items(items, conn) {

        conn = this.dbconf(conn) ;;
        var classtype = this.classname(), res = new FArray();

        if(IO_MODE) {
            items.map(it => {
                const item_path = `var/db/${conn.db}/${conn.container}/${it}`;
                if(IO.exists(item_path)) res.push(classtype.cls.cast(IO.jout(item_path)));
            })
        } else {
            /**
             * DATABSE RULES
             */
        }

        return res
    }

    constructor(obj) {
        const date = FDate.time() ;;
        super(App.blend({
            status_     : EStatus.ACTIVE
            , created_  : date
            , modified_ : date
            , data_     : ''
        }, obj))

    }

}

module.exports = Entity