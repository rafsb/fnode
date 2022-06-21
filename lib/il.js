/**************************************************************************
     ___                                             _
    /  _|_ __ __ _ _ __ ___   _____      _____  _ __| | __
    | |_| '__/ _` | '_ ` _ \ / _ \ \ /\ / / _ \| '__| |/ /
    |  _| | | (_| | | | | | |  __/\ V  V / (_) | |  |   <
    |_| |_|  \__,_|_| |_| |_|\___| \_/\_/ \___/|_|  |_|\_\βξπτδ

****************************************************************************/

const
zlib = require('zlib')
, crypto = require('crypto')
;;

global.EArrayOperations = Object.freeze({
    SUM             : 0
    , AVERAGE       : 1
    , HARMONIC      : 2
    , TREND         : 3
    , PROGRESS      : 4
    , INTERPOLATE   : 5
    , MAX           : 6
    , MIN           : 7
    , RELATIFY      : 8
})

global.EArrayCasts = Object.freeze({
    STRING          : 0
    , FLOAT         : 1
    , INT           : 2
})

global.DEBUG             = false
global.SUM               = 0
global.AVERAGE           = 1
global.HARMONIC          = 2
global.TREND             = 3
global.PROGRESS          = 4
global.INTERPOLATE       = 5
global.MAX               = 6
global.MIN               = 7
global.RELATIFY          = 8
global.PASSWD_AUTO_HASH  = 0
global.NUMBER            = 0
global.STRING            = 1
global.GAUGE_LEN         = process.stdout.columns || 64;
global.MONTHS            = [ "janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro", "jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez", "january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december", "jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec" ];

class FDate extends Date {

    plus(n) {
        let
        date = new Date(this.valueOf());
        date.setDate(date.getDate() + n);
        return new FDate(date)
    }

    export(format = "Y-m-d"){
        let
        d = this || FDate.now()
        , arr = FArray.instance(format.split(""))
        ;;
        arr.each(n => {
            switch(n){
                case "Y": format = format.replace(n, d.getFullYear());                                 break;
                case "y": format = format.replace(n, App.fill((d.getYear()-100)    +"", "0", 2, -1)); break;
                case "m": format = format.replace(n, App.fill((d.getMonth()+1)     +"", "0", 2, -1)); break;
                case "d": format = format.replace(n, App.fill(d.getDate()          +"", "0", 2, -1)); break;
                case "D": format = format.replace(n, App.fill(d.getDay()           +"", "0", 2, -1)); break;
                case "h": format = format.replace(n, App.fill(d.getHours()         +"", "0", 2, -1)); break;
                case "i": format = format.replace(n, App.fill(d.getMinutes()       +"", "0", 2, -1)); break;
                case "s": format = format.replace(n, App.fill(d.getSeconds()       +"", "0", 2, -1)); break;
                case "k": format = format.replace(n, App.fill(d.getMilliseconds()  +"", "0", 3, -1)); break;
                case "t": format = format.replace(n, d.getTime());                                     break;
                case "D": format = format.replace(n, d.getDay());                                      break;
            }
        })
        return format
    }

    as(format){
        return this.export(format)
    }

    format(format){
        return this.export(format)
    }

    isValid(date){
        if(date) return (new FDate(date)).isValid();
        else if(this.getTime()) return this
        return null
    }

    now(){
        return new FDate()
    }

    time(){
        return this.getTime()
    }

    static guess(datestr){
        /**
         * possibilities:
         *     - Tue Jun 08 19:34:03 +0000 2021
         */
        if(!datestr) return false;

        var dat ;;

        if(!isNaN(datestr)) {
            if((datestr+'').length == 10) datestr = parseInt(datestr + '000');
            dat = new FDate();
            dat.setTime(datestr);
        } //else dat = new FDate(datestr);

        if(dat&&dat.getTime()) return dat;
        datestr = (datestr).toLowerCase();

        let
        datefound = null
        , i = 0
        ;;

        MONTHS.map((m, i) => datestr = datestr.replace(m, App.fill(((i++%12)+1)+"", "0", 2, -1)));
        datestr = datestr.replace(/[^a-z0-9:]|(rd|th|nd|de)/gi, ' ').replace(/\s+/gi, ' ').trim();

        [
            /[0-9]{2}([\-/\s+])[0-9]{2}[\-/\s+][0-9]{4}/gi
            , /[0-9]{4}([\-/\s+])[0-9]{2}[\-/\s+][0-9]{2}/gi
        ].forEach(rx => {
            if(datefound) return;
            const dt = datestr.match(rx);
            if(dt&&dt.length) datefound = dt[0].replace(/\s+/gi, '-');
        })

        if(datefound) {
            const dat = datefound.match(/[0-9]{2}\-[0-9]{2}\-[0-9]{4}/gi);
            if(dat&&dat.length) datefound = datefound.split('-').reverse().join('-')
        }

        datefound = datefound ? new FDate(datefound) : false;

        return datefound && datefound.as('Y')*1 > 1900 ? datefound : false
    }

    static now(){
        return new FDate()
    }

    static plus(n=1){
        return FDate.now().plus(n)
    }

    static time(){
        return Date.now()
    }

    static at(n){
        return FDate.now().plus(n)
    }

    static as(format="Y-m-d h:i:s"){
        return FDate.now().export(format)
    }

    static format(format){
        return FDate.now().export(format)
    }

    static cast(date){
        return new FDate(date || new Date)
    }

    static yday(){
        return parseInt(FDate.plus(-1).getTime()/1000)*1000
    }

    static tday(){
        return parseInt(FDate.time()/1000)*1000
    }
}

class FObject extends Object {

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

    array(){
        return new FArray(...Object.values(this))
    }

    extract(fn=null){
        let
        final = new FArray();
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
        return FArray.cast(Object.keys(this))
    }

    attributes(){
        let me = this ;;
        return this.keys().map(attr => typeof me[attr] != 'function' ? attr : null).filter(i => i)
    }

    isNull() {
        return this.keys().length ? false : true
    }

    static from_str(s){
        return FObject.instance(JSON.parse(s))
    }

    /**
     * @deprecated
     * @param {*} o
     * @returns
     */
    static instance(o){
        return FObject.cast(o)
    }

    static cast(o){
        const f = new FObject();
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

    constructor(o){
        super()
        const me = this ;;
        Object.keys(o||{}).forEach(k => me[k] = o[k]);
        const attrs = me.attributes() ;;
        attrs.map(attr => {
            if(attr == 'id_') return;
            const l = attr.length ;;
            if(attr[l-1] == '_') me[attr.slice(0, l-1)] = function(x){
                if(undefined!==x && null!==x) me[attr]=x;
                return me[attr] !== "" && !isNaN(me[attr]) ? me[attr]*1 : me[attr]
            }
        })
    }

}

class FArray extends Array {
    /**
     * @deprecated, use FArray.cast(arr) instead
     * @param {*} arr as []
     * @returns new FArray
     */
    static instance(arr){
        return FArray.cast(arr||[])
    }

    static cast(arr){
        return new FArray(...(arr || arguments))
    }

    tiny(n=10){
        if(this.length <= n) return this;
        let
        narr=[ this.first() ]
        , x = Math.floor(this.length / (n-1))
        , i = x
        ;
        while(i<this.length-1){
            narr.push(this[i]||null);
            i+=x;
        }
        narr.push(this.last())
        return narr.clear()
    }

    json(){ return JSON.stringify(this); }

    clone() { return this.slice(0) }

    each(fn) { if(fn) { for(let i=0;i++<this.length;) fn.bind(this[i-1])(this[i-1], i-1); } return this }

    static foreach(arr, callback){
        arr.map(callback)
        return arr
    }

    extract(fn=null){
        if(!fn||!this.length) return this;
        let
        narr = [];
        this.each((o,i) => {
            let
            x = fn.bind(o)(o,i);
            if(x!=null && x!=undefined && x!=false) narr.push(x)
        })
        return new FArray(...narr)
    }
    fill(n=1, v=null){
        let x = this;
        App.iterate(0, Math.max(1,n), i => x[i] = x[i] || v.prepare({i:i}));
        return x
    }
    mutate(fn){
        if(!fn) return this;
        return this.extract((x, i) => { return fn(x,i) })
    }
    cast(filter=STRING){
        return this.extract(x => { return filter==STRING ? x + "" : (filter==FLOAT ? x * 1.0 : x*1) })
    }
    fit(n=10){
        let
        narr=[ this.first() ]
        , x = this.length / (n-1)
        , i = x
        ;
        while(i<this.length){
            narr.push(this.calc(TREND, i));
            i+=x;
        }
        narr.push(this.last())
        return narr
    }
    calc(type=SUM, helper=null){
        let
        res = 0;
        switch (type){
            case (SUM): this.each(x=>res+=x); break
            case (AVERAGE): this.each(x=>res+=x); res=res/this.length; break
            case (HARMONIC): this.each(x=>res+=1/x); res=this.length/res; break
            case (TREND): {
                let
                m, b, x, y, x2, xy, z, np = this.length;
                m = b = x = y = x2 = xy = z = 0;
                if(!helper) helper = np;
                this.each((n, i) => {
                    x = x + i;
                    y = y + n;
                    xy = xy + i * n;
                    x2 = x2 + i * i;
                });
                z = np*x2 - x*x
                if(z){
                    m = (np*xy - x*y)/z;
                    b = (y*x2 - x*xy)/z;
                }
                res = m * helper + b
            } break

            /* TODO POLINOMIAL FORMULA */
            case (INTERPOLATE): {
                if(helper==null||helper==undefined) return app.error("Ops! a 'x' value is needed for array basic interpolation...")
                let
                x = helper
                , yi = this.extract(_y => Array.isArray(_y) ? _y[1] : _y*1)
                , xi = yi.extract((_x, i) => Array.isArray(_x) ? _x[0] : i*1)
                , N  = xi.length
                , sum = 0
                ;;

                xi.each((k, ki) => {
                     let
                     product = 1;
                    xi.each(j => {
                         if(k!=j) product = product * (x-j) / (k-j);
                    })
                     sum += yi[ki] * product;
                })

                res = sum;
            } break;

            case (PROGRESS): {
                let
                me = this;
                res = this.extract((x,i)=>{ return i ? me[i]/me[i-1] : 1 }).calc(AVERAGE)
            }break;
            case (MAX): {
                res = Number.MIN_SAFE_INTEGER;
                this.each(x=>res=Math.max(res,x))
            }break;
            case (MIN): {
                res = Number.MAX_SAFE_INTEGER;
                this.each(x=>res=Math.min(res,x))
            }break;
            case (RELATIFY): {
                res = this.calc(MAX);
                res = this.extract(x=>x/res)
            }break;
        }
        return res;
    }
    fillNulls(){
        let
        final
        , nulls = []
        , narr = this.extract((el,i) => {
            let
            y = Array.isArray(el) || el instanceof FArray ? el[1] : el
            , x = Array.isArray(el) || el instanceof FArray ? el[0] : i
            ;;
            if(y==null || y==undefined) nulls.push(x);
            else return [ x, y ];
        })
        nulls.each(n => narr.push([ n, narr.calc(INTERPOLATE, n)]));
        narr.sort(function(a,b){ return a[0] - b[0] })
        return narr;
    }
    last(n=null) {
        if (!this.length) return null;
        if (n === null) return this[this.length - 1];
        return this.slice(Math.max(this.length - n, 0));
    }
    first(n=null) {
        if (!this.length) return null;
        if (n === null) return this[0];
        return this.slice(0, n);
    }
    at(n=0) {
        if(n>=0) return this.length>=n ? this[n] : null;
        return this.length > n*-1 ? this[this.length+n] : null
    }
    rand(){
        return this[Math.floor(Math.random()*this.length)]
    }
    not(el) {
        let
        arr = this;
        while(arr.indexOf(el)+1) arr.splice(arr.indexOf(el),1);
        return arr;
    }
    empty(){
        for(var i=this.length;i--;) this[i] = null;
        return this
    }
    clear(){
        return this.extract(n => {
            return n!=null && n!=undefined && n!=NaN ? (n instanceof String ? n+"" : (n instanceof Number ? n*1 : n)) : null
         })
    }
    array(){
        return [...this]
    }

}

//       _
//   ___| | __ _ ___ ___  ___  ___
//  / __| |/ _` / __/ __|/ _ \/ __|
// | (__| | (_| \__ \__ \  __/\__ \
//  \___|_|\__,_|___/___/\___||___/
//
class FPool {
    add(x=null,v=null) {
        if(x) {
            if(Array.isArray(x)) x.map(_x => this.add(_x));
            else{
                if(typeof x === 'function') this.execution.push(x);
                else this.conf(x,v)
            }
        }
        return this;
    }
    push(x) {
        this.add(x);
        return this
    }
    conf(k=null,v=null) {
        if(k!==null) this.setup[k]=v;
        return this
    }
    fire(x=null) {
        if(typeof x == "function"){
            this.add(x);
            x=null
        }
        for(let i in this.execution){
            if(this.execution[i]) {
                this.timeserie[i] = this.execution[i](App.blend(this.setup, x));
                if(x.sync && this.timeserie[i] instanceof Promise)(async _ => await this.timeserie[i])();
            }
        }
        return this
    }
    constructor(x) {
        this.timeserie = new FArray();
        this.execution = new FArray();
        this.setup = new FObject();
        return this.add(x)
    }
}

class FBulkPool extends FObject {

    grant(){ this.add() }

    add(art){

        if(!this._ClassType) return Err('FBulkPool', 'add', 'Items classtype not defined!');

        const
        me = this
        , name = me._ClassType.classname().name
        ;;
        if(me._Fn) clearInterval(me._Fn);
        if(art) me._Arr.push(art);
        if(me._Arr.length >= BULK_MAX_COUNT) {
            const tmp_arr = me._Arr.splice(0, BULK_MAX_COUNT) ;;
            me._ClassType.bulk(tmp_arr).then(_ => {
                Info(`FBookPool<${name}>`, `save`, `${tmp_arr.length}x at ${FDate.cast()}`)
                if(me._Arr.length) return me.grant()
            })
        }
        me._Fn = setTimeout(async _ => {
            if(me._Arr.length) {
                const tmp_arr = me._Arr.splice(0, BULK_MAX_COUNT) ;;
                await this._ClassType.bulk(tmp_arr);
                Info(`FBookPool<${name}>`, `save`, `FORCED! ${tmp_arr.length}x at ${FDate.cast()}`)
                if(me._Arr.length) me.grant()
            }
        }, 8000);
    }

    constructor(cls, clr){
        super({
            _ClassType  : cls
            , _Color    : clr||ETerminalColors.BG_BLUE
            , _Arr      : FArray.cast()
            , _Fn       : false
        })
    }

}

class FLoader {
    loadLength(){
        return this.loaders.array().extract(n => n*1 ? true : null).length/this.dependencies.length;
    }
    check(scr){
        return scr ? this.loaders[scr] : this.alreadyLoaded
    }
    ready(scr){
        const
        tmp = this;

        this.dependencies.each(x => tmp.loaders[x] = tmp.loaders[x] ? 1 : 0);
        if(scr||scr===0) this.loaders[scr] = 1;

        let
        perc = this.loadLength();

        if(!this.alreadyLoaded&&perc>=1){
            this.alreadyLoaded=true;
            this.onFinishLoading.fire();
        } else if(!this.alreadyLoaded) this.onReadyStateChange.fire(perc);

        return this.alreadyLoaded || false;
    }
    pass(){
        this.dependencies = [ "pass" ];
        return this.ready("pass");
    }
    constructor(dependencies){
        this.alreadyLoaded      = false;
        this.loadComponents     = new FPool();
        this.onReadyStateChange = new FPool();
        this.onFinishLoading    = new FPool();
        this.dependencies       = FArray.instance(dependencies || [ "pass" ]);
        this.loaders            = new FObject();
    }
}

/*
 * @class
 *
 * handle the minimum amount of time to wait until executions of a given function
 * good to prevent events like scroll and typing to fire some actions multiple
 * times decreasing performance affecting user's experience
 *
 */
class FThrottle {
    /*
     * @constructor
     *
     * f = javascript function to be applied
     * t = time betwin executions of 'f' (250ms is the default)
     * ex.: new __self.Throttle(minha_funcao,400);
     *
     */
    constructor(f, t = ANIMATION_LENGTH/2) {
        this.assign(f,t);
    }
    /*
     * @member function
     *
     * assign values to inner class attributes
     * f = javascript function to be applied
     * t = time betwin executions of 'f' (250ms is the default)
     * ex.: (new __self.Throttle).assign(minha_funcao) // assuming default delay time
     *
     */
    assign(f, t) {
        this.func = f;
        this.delay = t;
        this.timer = (new Date()).getTime();
    }
    /*
     * @member function
     *
     * execute given function assigned on constructor or assign() mmber function
     * ex.: (new __self.Throttle).apply()
     * obs.: the fire() member function will only execute the inner function if the
     * given ammount of time is passed, otherway if won't do anything
     *
     */
    fire(d) {
        if(!this.func) return;
        let
        now = (new Date()).getTime();
        if (now - this.delay > this.timer) {
            eval(this.func)(d);
            this.timer = now;
        }
    }
}

class FCallResponse {
    constructor(url=location.href, args={}, method="POST", header={}, data=null){
        this.url = url;
        this.args=args;
        this.method=method;
        this.headers=header;
        this.data=data;
        this.status = this.data ? true : false;
    }
}

class App {

    static blend(e = {}) {
        for (let i = 1; i<arguments.length; i++) {
            const lsk = Object.keys(arguments[i]) ;;
            for (let j=0; j<lsk.length; j++) e[lsk[j]] = arguments[i][lsk[j]];
        }
        return e
    }

    static hash(str) {
        let
        h = 0, c = "", i = 0, j = str.length;
        if (!j) return h;
        while (i++ < j) {
            c = str.charCodeAt(i - 1);
            h = ((h << 5) - h) + c;
            h |= 0;
        }
        return Math.abs(h).toString();
    }

    static compress(input, base='hex'){
        return zlib.deflateSync(Buffer.from(input||'', 'utf-8').toString()).toString(base);
    }

    static decompress(input, base='hex'){
        return zlib.inflateSync(new Buffer.from(input||'', base)).toString('utf-8');
    }

    static encrypt(v) {
        let
        cipher = crypto.createCipheriv('aes-256-cbc', ENC_KEY, IV)
        , encrypted = cipher.update(v, 'utf8', 'base64')
        ;;
        encrypted += cipher.final('base64')
        return encrypted
    }

    static decrypt(v) {
        let
        decipher = crypto.createDecipheriv('aes-256-cbc', ENC_KEY, IV)
        , decrypted = decipher.update(v, 'base64', 'utf8')
        ;;
        return (decrypted + decipher.final('utf8'));
    }

    static md5(string) {
        return md5(string)
    }

    static fill(s='', c=' ', l=12, d=1) {
        c = !c ? " " : c;
        d = d==0||d==null||d==undefined ? -1 : d;
        while((''+s).length < l) s = (d<0?c:"")+s+(d>0?c:"");
        return (s+'').slice(0, l)
    }

    static nerdify(n){
        n *= 1
        return n > 1000000000000 ? ((n / 1000000000000).toFixed(1))+"tri" : (
            n > 1000000000 ? ((n / 1000000000).toFixed(1))+"bi" : (
                n > 1000000 ? ((n / 1000000).toFixed(1))+"mi" : (
                    n > 1000 ? ((n / 1000).toFixed(1))+"k" : Math.ceil(n)
                )
            )
        )
    }

    static desnerdify(x){
        let
        n = Number(x.replace(/[^0-9\.]/g,'').replace(',','.'))
        , s = x.replace(/[^a-zA-Z]/g,'');
        switch(s){
            case "tri": n *= 1000000000000; break;
            case "bi" : n *= 1000000000; break;
            case "mi" : n *= 1000000; break;
            case "k"  : n *= 1000; break;
            default   : n *= 1; break;
        }
        return n
    }

    static json(o) {
        let result = null;
        if(typeof o == `string`) try { result = JSON.parse(o) } catch(e) {}
        else try { result = JSON.stringify(o) } catch(e) {}
        return result
    }

    static prepare(str, obj=null){
        if(!obj) return str;
        Object.keys(obj).map(x => {
            let
            rgx = new RegExp(`@${x}`,"gu");
            str = str.replace(rgx, obj[x]);
        })
        return str;
    }

    static nuid(n = 64, prefix = "IL") {
        let a = prefix;
        n -= a.length;
        while(n-- > 0) { a += "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789".split('')[parseInt(Math.random() * 36)] }
        return a
    }

    static toURI(str){
        return encodeURIComponent(str).replace(/!/g, '%21').replace(/'/g, '%27').replace(/\(/g, '%28').replace(/\)/g, '%29').replace(/\*/g, '%2A').replace(/%20/g, '+')
    }

    static compare(w1, w2) {

        return (new RegExp(
            w1
                .trim()
                .replace(/\s+/giu, ' ')
                .replace(/(a|á|à|ã)/giu, "(a|á|à|ã)")
                .replace(/(e|é|ê)/giu,   "(e|é|ê)")
                .replace(/(i|í)/giu,     "(i|í)")
                .replace(/(o|ó|ô|õ)/giu, "(o|ó|ô|õ)")
                .replace(/(u|ú)/giu,     "(u|ú)")
                .replace(/(c|ç)/giu,     "(c|ç)")
            , 'giu')).test(w2.trim().replace(/\s+/gi, ' ')) ? true : false
    }

    static async sleep(time=1000) {
        return new Promise(function(ok){
            setTimeout(function(){ return ok() }, time)
        })
    }

    static iterate(s, e, fn, step=1) {
        const x = [];
        if(!fn) fn = i => i;
        s = s || 0;
        e = e || s+1;
        for(let i = s; i != e; i += step) x.push(fn(i));
        return x;
    }

    static gauge(x, pre = '', ch = '=') {
        x = x ? Math.max(0, x*1) : .001;
        pre = pre ? `${pre} `: '';
        const
        gaugelen = Math.ceil((GAUGE_LEN - pre.length - 8)*x)
        , filllen = App.fill(App.iterate(0, gaugelen, _ => ch+'').join(''), ' ', GAUGE_LEN - pre.length - 8)
        ;;
        process.stdout.write(`\r${pre}[${filllen}]${App.fill(Math.ceil(x*100), ' ', 5, -1)}%`)
    }

    static rgb2hex(color) {
        let
        hex = "#";
        if(!Array.isArray(color)) color = color.split(/[\s+,.-]/g);
        color.each(clr => {
            let
            tmp = (clr*1).toString(16);
            hex += tmp.length == 1 ? "0" + tmp : tmp;
        })
        return hex.substring(0,9)
    }

    static hex2rgb(color) {
        let
        rgb = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})|([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(color);
        return  rgb ? [ parseInt(rgb[1] || 255, 16), parseInt(rgb[2] || 255, 16), parseInt(rgb[3] || 255, 16), parseInt(rgb[3] || 255, 16) ] : null;
    }

}

module.exports = { FDate, FObject, FArray, FPool, FBulkPool, FThrottle, FLoader, App }