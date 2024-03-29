/**************************************************************************
 * fobject
 ***************************************************************************/
module.exports = class fobject extends Object {

    spy(p, fn) {
        let
        o = this[p]
        , set = function(v) { return fn(v, p, this) }
        ;;
        if(delete this[p]) {
            Object.defineProperty(this, p, { set: set })
        }
    }

    unspy(p) {
        let
        val = this[p];
        delete this[p];
        this[p] = val;
    }

    json(){ return JSON.stringify(this, null, 4) }

    each(fn=null){
        let
        me = this
        , arr = Object.keys(me)
        , final = [];
        if(fn && arr.length){
            arr.forEach(x => final.push({ key: x, value: me[x] }));
            final.forEach(fn)
        }
        return this
    }

    static each(o, fn){
        return fobject.cast(o).each(fn)

    }

    array(){
        return new Array(...Object.values(this))
    }

    extract(fn=null){
        let
        final = new Array();
        if(fn){
            this.each((x,i) => {
                let
                y = fn(x, i);
                if(y!=null && y!=undefined && y!=false) final.push(y)
            })
        }
        return final
    }

    keys(){
        return Object.keys(this)
    }

    attributes(){
        let me = this ;;
        return this.keys().map(attr => typeof me[attr] != 'function' ? attr : null).filter(i => i)
    }

    isNull() {
        return this.keys().length ? false : true
    }

    compose(is, value) {
        return fobject.compose(this, is, value)
    }

    static from_str(s){
        return fobject.instance(JSON.parse(s))
    }

    /**
     * @deprecated
     * @param {*} o
     * @returns
     */
    static instance(o){
        return fobject.cast(o)
    }

    static cast(o){
        const f = new fobject();
        Object.keys(o||{}).forEach(k => f[k] = o[k]);
        return f
    }

    static isEmpty(o=null){
        return o ? !Object.keys(o).length && true : null
    }

    static foreach(obj, callback){
        Object.keys(obj||{}).forEach(k => callback({ key: k, value: obj[k] }));
        return obj
    }

    static blend(e={}) {
        for (let i = 1; i<arguments.length; i++) {
            const lsk = arguments[i] ? Object.keys(arguments[i]) : [] ;;
            for (let j=0; j<lsk.length; j++) e[lsk[j]] = arguments[i][lsk[j]];
        }
        return e
    }

    static compose(obj, is, value) {
        if (typeof is == 'string') return fobject.compose(obj, is.split('.'), value)
        else if (is.length==1 && value!==undefined) return obj[is[0]] = value
        else if (is.length==0) return obj
        else {
            if(!obj[is[0]]) obj[is[0]] = {}
            return fobject.compose(obj[is[0]],is.slice(1), value);
        }
    }

    constructor(o){
        super()
        const me = this ;;
        Object.keys(o||{}).forEach(k => me[k] = o[k]);
        const attrs = me.attributes() ;;
        attrs.map(attr => {
            const l = attr.length ;;
            if(attr == 'id_') return;
            if(attr[l-1] == '_') me[attr.slice(0, l-1)] = function(x){
                if(undefined!==x && null!==x) me[attr]=x;
                return me[attr] !== "" && !isNaN(me[attr]) ? me[attr]*1 : me[attr]
            }
        })
    }

}
