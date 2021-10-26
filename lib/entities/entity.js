const
    IO = LIB("io"),
    // DB = LIB('models/gremlin'),
    { faau, FDate, FObject, FArray } = LIB('faau');;

module.exports = class Entity {

    p(key, value) {
        if (key && value !== undefined) this[key] = value;
        return this[key]
    }

    key(x) { this.key_ = (x || this.key_) || faau.nuid(16) + '-' + FDate.as('Ymdhis'); return this.key_ }
    status(x) { return this.p('status_', x) * 1 }
    created(x) { return this.p('created_', x || FDate.time()) }
    modified(x) { return this.p('modified_', x || FDate.time()) }

    imports(src_name) {
        const path = EPaths.CONFIG + src_name.replace(/(.json)|(.js)/gi, '') + '.json';
        if (IO.exists(path)) {
            FObject.instance(IO.jout(path)).each(src => this[src.key] = src.value)
            this.id = this.id || FDate.now();
            this.source((src_name.indexOf('/') + 1 ? src_name.split('/')[1] : src_name).replace('.json', ''))
            this.status(this.status_ || EStatus.ACTIVE)
            return this
        }
        return LOG(this.constructor.name + '::import > path not found ' + path) && false
    }

    exports(path) {
        const obj = {...this };
        if (path && obj) IO.jin(ROOT + path, obj);
        return obj
    }

    mime() {
        return new this.constructor(this.exports(null))
    }

    static cast(obj) {
        return new this.constructor(obj)
    }

    /**
     * 
     * @param {*} classType 
     */
    async _Save(classType) {
        /**
         * DB implemetation dependency
         */
    }

    static async _List(classType) {
        /**
         * DB implemetation dependency
         */
    }

    static async _Filter(filter, classType) {
        /**
         * DB implemetation dependency
         */
    }

    static async _Load(id, classType) {
        /**
         * DB implemetation dependency
         */
    }

    constructor(obj) {
        const date = FDate.time();
        this.id = date
        this.status_ = EStatus.ACTIVE
        this.context_ = NO_SET
        this.origin_ = NO_SET
        this.created_ = date
        this.modified_ = date
        if (obj instanceof Object) FObject.instance(obj).each(o => this[o.key] = o.value);
    }

    // @override
    static validate() { return this.exports(null) }

    // @override
    async save() {
        const cls = new this.constructor(),
            tmp = await this._Save(cls);
        return tmp
    }

    // @override
    static async list() {
        const cls = new this(),
            tmp = await this._List(cls);
        return tmp
    }

    // @override
    static async filter(filter) {
        const cls = new this(),
            tmp = await this._Filter(filter, cls);
        return tmp
    }

    // @override
    static async load(id) {
        const cls = new this(),
            tmp = await this._Load(id, cls);
        return tmp
    }

}