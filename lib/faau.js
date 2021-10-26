/**************************************************************************
     ___                                             _
    /  _|_ __ __ _ _ __ ___   _____      _____  _ __| | __
    | |_| '__/ _` | '_ ` _ \ / _ \ \ /\ / / _ \| '__| |/ /
    |  _| | | (_| | | | | | |  __/\ V  V / (_) | |  |   <
    |_| |_|  \__,_|_| |_| |_|\___| \_/\_/ \___/|_|  |_|\_\

****************************************************************************/
global.EArrayOperations = Object.freeze({
    SUM: 0,
    AVERAGE: 1,
    HARMONIC: 2,
    TREND: 3,
    PROGRESS: 4,
    INTERPOLATE: 5,
    MAX: 6,
    MIN: 7,
    RELATIFY: 8
})

global.EArrayCasts = Object.freeze({
    STRING: 0,
    FLOAT: 1,
    INT: 2
})

const
    DEBUG = false,
    SUM = 0,
    AVERAGE = 1,
    HARMONIC = 2,
    TREND = 3,
    PROGRESS = 4,
    INTERPOLATE = 5,
    MAX = 6,
    MIN = 7,
    RELATIFY = 8,
    PASSWD_AUTO_HASH = 0,
    NUMBER = 0,
    STRING = 1,
    MONTHS = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro", "jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez", "january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december", "jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];

class FDate extends Date {

    static guess(datestr) {
        /**
         * possibilities:
         *     - Tue Jun 08 19:34:03 +0000 2021
         */
        const
            dat = new FDate(datestr);;

        if (dat.getTime()) return dat;

        datestr = datestr.toLowerCase();

        let
            datefound = null,
            i = 0;;

        datestr = datestr.replace(/[^a-z0-9]|(rd|th|nd)/gi, " ").trim() //.replace(/\b(\d{1}\b)/gi, "0$1").trim()

        MONTHS.forEach(m => datestr = datestr.replace(m, faau.fill(((i++ % 12) + 1) + "", "0", 2)));

        [
            [/.*(\d{4}).*(\d{2}).*(\d{2}).*/gi, "$1-$2-$3"],
            [/.*(\d{2}).*(\d{2}).*(\d{4}).*/gi, "$3-$2-$1"]
        ].forEach(rx => {
            if (rx[0].exec(datestr)) datefound = datestr.replace(rx[0], rx[1])
        })

        return datefound ? new FDate(datefound) : false
    }

    plus(n) {
        let
            date = new Date(this.valueOf());
        date.setDate(date.getDate() + n);
        return new FDate(date)
    }

    export (format = "Y-m-d") {
        let
            d = this || FDate.now(),
            arr = FArray.instance(format.split(""));;
        arr.each(n => {
            switch (n) {
                case "Y":
                    format = format.replace(n, d.getFullYear());
                    break;
                case "y":
                    format = format.replace(n, faau.fill((d.getYear() - 100) + "", "0", 2));
                    break;
                case "m":
                    format = format.replace(n, faau.fill((d.getMonth() + 1) + "", "0", 2));
                    break;
                case "d":
                    format = format.replace(n, faau.fill(d.getDate() + "", "0", 2));
                    break;
                case "D":
                    format = format.replace(n, faau.fill(d.getDay() + "", "0", 2));
                    break;
                case "h":
                    format = format.replace(n, faau.fill(d.getHours() + "", "0", 2));
                    break;
                case "i":
                    format = format.replace(n, faau.fill(d.getMinutes() + "", "0", 2));
                    break;
                case "s":
                    format = format.replace(n, faau.fill(d.getSeconds() + "", "0", 2));
                    break;
                case "k":
                    format = format.replace(n, faau.fill(d.getMilliseconds() + "", "0", 3));
                    break;
                case "t":
                    format = format.replace(n, d.getTime());
                    break;
                case "D":
                    format = format.replace(n, d.getDay());
                    break;
            }
        })
        return format
    }

    isValid(date) {
        if (date) return (new FDate(date)).isValid();
        else if (this.getTime()) return this
        return null
    }

    static now() {
        return new FDate()
    }

    static time() {
        return Date.now()
    }

    static at(n) {
        return FDate.now().plus(n)
    }

    static as(format = "Y-m-d h:i:s") {
        return FDate.now().export(format)
    }
}

class FObject extends Object {
    spy(p, fn) {
        let
            o = this[p],
            set = function(v) { return fn(v, p, this) };
        if (delete this[p]) {
            Object.defineProperty(this, p, { set: set })
        }
    }
    unspy(p) {
        let
            val = this[p];
        delete this[p];
        this[p] = val;
    }
    json() { return JSON.stringify(this) }
    each(fn = null) {
        let
            me = this,
            arr = Object.keys(me),
            final = [];
        if (fn && arr.length) {
            arr.forEach(x => final.push({ key: x, value: me[x] }));
            final.forEach(fn)
        }
        return this
    }
    array() {
        return new FArray(...Object.values(this))
    }
    extract(fn = null) {
        let
            final = new FArray();
        if (fn) {
            this.each((x, i) => {
                let
                    y = fn(x, i);
                if (y != null && y != undefined && y != false) final.push(y)
            })
        }
        return final
    }
    keys() {
        return new FArray(Object.keys(this));
    }

    static from_str(s) {
        return FObject.instance(JSON.parse(s))
    }

    static instance(o) {
        const f = new FObject();
        Object.keys(o).forEach(k => f[k] = o[k])
        return f
    }

    static isEmpty(o = null) {
        return o ? !Object.keys(o).length && true : null
    }
}

class FArray extends Array {
    /**
     * @deprecated, use FArray.cast(arr) instead
     * @param {*} arr as []
     * @returns new FArray
     */
    static instance(arr) {
        return FArray.cast(arr || [])
    }

    static cast(arr) {
        return new FArray(...(arr || arguments))
    }

    tiny(n = 10) {
        if (this.length <= n) return this;
        let
            narr = [this.first()],
            x = Math.floor(this.length / (n - 1)),
            i = x;
        while (i < this.length - 1) {
            narr.push(this[i] || null);
            i += x;
        }
        narr.push(this.last())
        return narr.clear()
    }

    json() { return JSON.stringify(this); }

    clone() { return this.slice(0) }

    each(fn) { if (fn) { for (let i = 0; i++ < this.length;) fn.bind(this[i - 1])(this[i - 1], i - 1); } return this }

    static foreach(arr, callback) {
        arr.map(callback)
        return arr
    }

    extract(fn = null) {
        if (!fn || !this.length) return this;
        let
            narr = [];
        this.each((o, i) => {
            let
                x = fn.bind(o)(o, i);
            if (x != null && x != undefined && x != false) narr.push(x)
        })
        return new FArray(...narr)
    }
    fill(n = 1, v = null) {
        let x = this;
        faau.iterate(0, Math.max(1, n), i => x[i] = x[i] || v.prepare({ i: i }));
        return x
    }
    mutate(fn) {
        if (!fn) return this;
        return this.extract((x, i) => { return fn(x, i) })
    }
    cast(filter = STRING) {
        return this.extract(x => { return filter == STRING ? x + "" : (filter == FLOAT ? x * 1.0 : x * 1) })
    }
    fit(n = 10) {
        let
            narr = [this.first()],
            x = this.length / (n - 1),
            i = x;
        while (i < this.length) {
            narr.push(this.calc(TREND, i));
            i += x;
        }
        narr.push(this.last())
        return narr
    }
    calc(type = SUM, helper = null) {
        let
            res = 0;
        switch (type) {
            case (SUM):
                this.each(x => res += x);
                break
            case (AVERAGE):
                this.each(x => res += x);
                res = res / this.length;
                break
            case (HARMONIC):
                this.each(x => res += 1 / x);
                res = this.length / res;
                break
            case (TREND):
                {
                    let
                        m, b, x, y, x2, xy, z, np = this.length;
                    m = b = x = y = x2 = xy = z = 0;
                    if (!helper) helper = np;
                    this.each((n, i) => {
                        x = x + i;
                        y = y + n;
                        xy = xy + i * n;
                        x2 = x2 + i * i;
                    });
                    z = np * x2 - x * x
                    if (z) {
                        m = (np * xy - x * y) / z;
                        b = (y * x2 - x * xy) / z;
                    }
                    res = m * helper + b
                }
                break

                /* TODO POLINOMIAL FORMULA */
            case (INTERPOLATE):
                {
                    if (helper == null || helper == undefined) return app.error("Ops! a 'x' value is needed for array basic interpolation...")
                    let
                        x = helper,
                        yi = this.extract(_y => Array.isArray(_y) ? _y[1] : _y * 1),
                        xi = yi.extract((_x, i) => Array.isArray(_x) ? _x[0] : i * 1),
                        N = xi.length,
                        sum = 0;;

                    xi.each((k, ki) => {
                        let
                            product = 1;
                        xi.each(j => {
                            if (k != j) product = product * (x - j) / (k - j);
                        })
                        sum += yi[ki] * product;
                    })

                    res = sum;
                }
                break;

            case (PROGRESS):
                {
                    let
                        me = this;
                    res = this.extract((x, i) => { return i ? me[i] / me[i - 1] : 1 }).calc(AVERAGE)
                }
                break;
            case (MAX):
                {
                    res = Number.MIN_SAFE_INTEGER;
                    this.each(x => res = Math.max(res, x))
                }
                break;
            case (MIN):
                {
                    res = Number.MAX_SAFE_INTEGER;
                    this.each(x => res = Math.min(res, x))
                }
                break;
            case (RELATIFY):
                {
                    res = this.calc(MAX);
                    res = this.extract(x => x / res)
                }
                break;
        }
        return res;
    }
    fillNulls() {
        let
            final, nulls = [],
            narr = this.extract((el, i) => {
                let
                    y = Array.isArray(el) || el instanceof FArray ? el[1] : el,
                    x = Array.isArray(el) || el instanceof FArray ? el[0] : i;;
                if (y == null || y == undefined) nulls.push(x);
                else return [x, y];
            })
        nulls.each(n => narr.push([n, narr.calc(INTERPOLATE, n)]));
        narr.sort(function(a, b) { return a[0] - b[0] })
        return narr;
    }
    last(n = null) {
        if (!this.length) return null;
        if (n === null) return this[this.length - 1];
        return this.slice(Math.max(this.length - n, 0));
    }
    first(n = null) {
        if (!this.length) return null;
        if (n === null) return this[0];
        return this.slice(0, n);
    }
    at(n = 0) {
        if (n >= 0) return this.length >= n ? this[n] : null;
        return this.length > n * -1 ? this[this.length + n] : null
    }
    rand() {
        return this[Math.floor(Math.random() * this.length)]
    }
    not(el) {
        let
            arr = this;
        while (arr.indexOf(el) + 1) arr.splice(arr.indexOf(el), 1);
        return arr;
    }
    empty() {
        for (var i = this.length; i--;) this[i] = null;
        return this
    }
    clear() {
        return this.extract(n => {
            return n != null && n != undefined && n != NaN ? (n instanceof String ? n + "" : (n instanceof Number ? n * 1 : n)) : null
        })
    }
    array() {
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
    add(x = null, v = null) {
        if (x) {
            if (Array.isArray(x)) this.sort(x);
            if (typeof x === 'function') {
                this.execution.push(x);
                if (this.execution.length > this.timeline.length) this.at(v)
            } else this.conf(x, v)
        }
        return this;
    }
    push(x) {
        this.add(x);
        return this
    }
    sort(x) {
        let
            pool = this;
        if (Array.isArray(x)) {
            FArray.instance(x).each(z => pool.add(z))
        }
        return this;
    }
    conf(k = null, v = null) {
        if (k !== null) {
            if (v !== null) this.setup[k] = v;
        }
        return this
    }
    at(t = null) {
        this.moment = this.timeline.last() + (t && parseInt(t) ? t : 1);
        this.timeline.push(this.moment);
        return this
    }
    plus(t = 0) { return this.at(this.moment + t) }
    fire(x = null) {
        if (typeof x == "function") {
            this.add(x, this.moment + 1);
            x = null
        }
        let
            pool = {...this };
        const
            o = new Promise(function(pass) {
                pool.execution.each((z, i) => {
                    if (z) pool.timeserie[i] = setTimeout(z, pool.timeline[i], x, pool.setup);
                })
                setTimeout(function(ok) { return pass(ok) }, pool.timeserie.last() + 1, true)
            })
        return o
    }
    stop(i = null) {
        if (i !== null) { if (this.timeserie[i]) clearInterval(this.timeserie[i]) } else this.timeserie.each(x => clearInterval(x))
        return this
    }
    clear() {
        this.stop();
        return new FPool()
    }
    debug() {
        console.log("CONFIGURATION");
        console.log(this.setup);
        console.log("TIMESERIE");
        this.timeline.each((i, x) => { console.log("AT:" + x + " => DO:" + this.execution[i]) })
    }
    after(fn = null) {
        if (fn && typeof fn == 'function') setTimeout(fn, this.moment + 1);
        return this
    }
    drop(e) {
        if (!e) return this;
        const
            i = this.execution.indexOf(e);
        if (i + 1) this.execution[i] = null;
    }
    static instance(x) {
        return new FPool(x)
    }
    constructor(x) {
        this.moment = 0;
        this.timeline = new FArray();
        this.timeserie = new FArray();
        this.execution = new FArray();
        this.setup = new FObject();
        return this.add(x)
    }
};

class FLoader {
    loadLength() {
        return this.loaders.array().extract(n => n * 1 ? true : null).length / this.dependencies.length;
    }
    check(scr) {
        return scr ? this.loaders[scr] : this.alreadyLoaded
    }
    ready(scr) {
        const
            tmp = this;

        this.dependencies.each(x => tmp.loaders[x] = tmp.loaders[x] ? 1 : 0);
        if (scr || scr === 0) this.loaders[scr] = 1;

        let
            perc = this.loadLength();

        if (!this.alreadyLoaded && perc >= 1) {
            this.alreadyLoaded = true;
            this.onFinishLoading.fire();
        } else if (!this.alreadyLoaded) this.onReadyStateChange.fire(perc);

        return this.alreadyLoaded || false;
    }
    pass() {
        this.dependencies = ["pass"];
        return this.ready("pass");
    }
    constructor(dependencies) {
        this.alreadyLoaded = false;
        this.loadComponents = new FPool();
        this.onReadyStateChange = new FPool();
        this.onFinishLoading = new FPool();
        this.dependencies = FArray.instance(dependencies || ["pass"]);
        this.loaders = new FObject();
    }
};

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
    constructor(f, t = ANIMATION_LENGTH / 2) {
            this.assign(f, t);
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
        if (!this.func) return;
        let
            now = (new Date()).getTime();
        if (now - this.delay > this.timer) {
            eval(this.func)(d);
            this.timer = now;
        }
    }
};

class FCallResponse {
    constructor(url = location.href, args = {}, method = "POST", header = {}, data = null) {
        this.url = url;
        this.args = args;
        this.method = method;
        this.headers = header;
        this.data = data;
        this.status = this.data ? true : false;
    }
};;
class faau {

    initialize() { this.initPool.fire() }

    static binds(e, o) {
        let
            a = Object.keys(o);
        for (let i = a.length; i--;) e[a[a.length - i - 1]] = o[a[a.length - i - 1]];
        return e
    }

    static hash(str) {
        let
            h = 0,
            c = "",
            i = 0,
            j = str.length;
        if (!j) return h;
        while (i++ < j) {
            c = str.charCodeAt(i - 1);
            h = ((h << 5) - h) + c;
            h |= 0;
        }
        return Math.abs(h).toString();
    }

    /**
     *
     * @param {string} string
     * @returns MD5
     * Thanks to: https://css-tricks.com/snippets/javascript/javascript-md5/
     */

    static md5(string) {

        const
            RotateLeft = (lValue, iShiftBits) => (lValue << iShiftBits) | (lValue >>> (32 - iShiftBits)),
            AddUnsigned = (lX, lY) => {
                var lX4, lY4, lX8, lY8, lResult;
                lX8 = (lX & 0x80000000);
                lY8 = (lY & 0x80000000);
                lX4 = (lX & 0x40000000);
                lY4 = (lY & 0x40000000);
                lResult = (lX & 0x3FFFFFFF) + (lY & 0x3FFFFFFF);
                if (lX4 & lY4) return (lResult ^ 0x80000000 ^ lX8 ^ lY8);
                if (lX4 | lY4) {
                    if (lResult & 0x40000000) return (lResult ^ 0xC0000000 ^ lX8 ^ lY8);
                    else return (lResult ^ 0x40000000 ^ lX8 ^ lY8);
                } else return (lResult ^ lX8 ^ lY8);
            },
            F = (x, y, z) => (x & y) | ((~x) & z),
            G = (x, y, z) => (x & z) | (y & (~z)),
            H = (x, y, z) => (x ^ y ^ z),
            I = (x, y, z) => (y ^ (x | (~z))),
            FF = (a, b, c, d, x, s, ac) => {
                a = AddUnsigned(a, AddUnsigned(AddUnsigned(F(b, c, d), x), ac));
                return AddUnsigned(RotateLeft(a, s), b);
            },
            GG = (a, b, c, d, x, s, ac) => {
                a = AddUnsigned(a, AddUnsigned(AddUnsigned(G(b, c, d), x), ac));
                return AddUnsigned(RotateLeft(a, s), b);
            },
            HH = (a, b, c, d, x, s, ac) => {
                a = AddUnsigned(a, AddUnsigned(AddUnsigned(H(b, c, d), x), ac));
                return AddUnsigned(RotateLeft(a, s), b);
            },
            II = (a, b, c, d, x, s, ac) => {
                a = AddUnsigned(a, AddUnsigned(AddUnsigned(I(b, c, d), x), ac));
                return AddUnsigned(RotateLeft(a, s), b);
            },
            ConvertToWordArray = (string) => {
                var lWordCount;
                var lMessageLength = string.length;
                var lNumberOfWords_temp1 = lMessageLength + 8;
                var lNumberOfWords_temp2 = (lNumberOfWords_temp1 - (lNumberOfWords_temp1 % 64)) / 64;
                var lNumberOfWords = (lNumberOfWords_temp2 + 1) * 16;
                var lWordArray = Array(lNumberOfWords - 1);
                var lBytePosition = 0;
                var lByteCount = 0;
                while (lByteCount < lMessageLength) {
                    lWordCount = (lByteCount - (lByteCount % 4)) / 4;
                    lBytePosition = (lByteCount % 4) * 8;
                    lWordArray[lWordCount] = (lWordArray[lWordCount] | (string.charCodeAt(lByteCount) << lBytePosition));
                    lByteCount++;
                }
                lWordCount = (lByteCount - (lByteCount % 4)) / 4;
                lBytePosition = (lByteCount % 4) * 8;
                lWordArray[lWordCount] = lWordArray[lWordCount] | (0x80 << lBytePosition);
                lWordArray[lNumberOfWords - 2] = lMessageLength << 3;
                lWordArray[lNumberOfWords - 1] = lMessageLength >>> 29;
                return lWordArray;
            },
            WordToHex = (lValue) => {
                var WordToHexValue = "",
                    WordToHexValue_temp = "",
                    lByte, lCount;
                for (lCount = 0; lCount <= 3; lCount++) {
                    lByte = (lValue >>> (lCount * 8)) & 255;
                    WordToHexValue_temp = "0" + lByte.toString(16);
                    WordToHexValue = WordToHexValue + WordToHexValue_temp.substr(WordToHexValue_temp.length - 2, 2);
                }
                return WordToHexValue
            },
            Utf8Encode = (string) => {
                string = string.replace(/\r\n/g, "\n");
                var utftext = "";
                for (var n = 0; n < string.length; n++) {
                    var c = string.charCodeAt(n);
                    if (c < 128) utftext += String.fromCharCode(c);
                    else if ((c > 127) && (c < 2048)) {
                        utftext += String.fromCharCode((c >> 6) | 192);
                        utftext += String.fromCharCode((c & 63) | 128);
                    } else {
                        utftext += String.fromCharCode((c >> 12) | 224);
                        utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                        utftext += String.fromCharCode((c & 63) | 128);
                    }
                }
                return utftext
            };

        var
            x = [],
            k, AA, BB, CC, DD, a, b, c, d, S11 = 7,
            S12 = 12,
            S13 = 17,
            S14 = 22,
            S21 = 5,
            S22 = 9,
            S23 = 14,
            S24 = 20,
            S31 = 4,
            S32 = 11,
            S33 = 16,
            S34 = 23,
            S41 = 6,
            S42 = 10,
            S43 = 15,
            S44 = 21;;

        string = Utf8Encode(string);
        x = ConvertToWordArray(string);
        a = 0x67452301;
        b = 0xEFCDAB89;
        c = 0x98BADCFE;
        d = 0x10325476;
        for (k = 0; k < x.length; k += 16) {
            AA = a;
            BB = b;
            CC = c;
            DD = d;
            a = FF(a, b, c, d, x[k + 0], S11, 0xD76AA478);
            d = FF(d, a, b, c, x[k + 1], S12, 0xE8C7B756);
            c = FF(c, d, a, b, x[k + 2], S13, 0x242070DB);
            b = FF(b, c, d, a, x[k + 3], S14, 0xC1BDCEEE);
            a = FF(a, b, c, d, x[k + 4], S11, 0xF57C0FAF);
            d = FF(d, a, b, c, x[k + 5], S12, 0x4787C62A);
            c = FF(c, d, a, b, x[k + 6], S13, 0xA8304613);
            b = FF(b, c, d, a, x[k + 7], S14, 0xFD469501);
            a = FF(a, b, c, d, x[k + 8], S11, 0x698098D8);
            d = FF(d, a, b, c, x[k + 9], S12, 0x8B44F7AF);
            c = FF(c, d, a, b, x[k + 10], S13, 0xFFFF5BB1);
            b = FF(b, c, d, a, x[k + 11], S14, 0x895CD7BE);
            a = FF(a, b, c, d, x[k + 12], S11, 0x6B901122);
            d = FF(d, a, b, c, x[k + 13], S12, 0xFD987193);
            c = FF(c, d, a, b, x[k + 14], S13, 0xA679438E);
            b = FF(b, c, d, a, x[k + 15], S14, 0x49B40821);
            a = GG(a, b, c, d, x[k + 1], S21, 0xF61E2562);
            d = GG(d, a, b, c, x[k + 6], S22, 0xC040B340);
            c = GG(c, d, a, b, x[k + 11], S23, 0x265E5A51);
            b = GG(b, c, d, a, x[k + 0], S24, 0xE9B6C7AA);
            a = GG(a, b, c, d, x[k + 5], S21, 0xD62F105D);
            d = GG(d, a, b, c, x[k + 10], S22, 0x2441453);
            c = GG(c, d, a, b, x[k + 15], S23, 0xD8A1E681);
            b = GG(b, c, d, a, x[k + 4], S24, 0xE7D3FBC8);
            a = GG(a, b, c, d, x[k + 9], S21, 0x21E1CDE6);
            d = GG(d, a, b, c, x[k + 14], S22, 0xC33707D6);
            c = GG(c, d, a, b, x[k + 3], S23, 0xF4D50D87);
            b = GG(b, c, d, a, x[k + 8], S24, 0x455A14ED);
            a = GG(a, b, c, d, x[k + 13], S21, 0xA9E3E905);
            d = GG(d, a, b, c, x[k + 2], S22, 0xFCEFA3F8);
            c = GG(c, d, a, b, x[k + 7], S23, 0x676F02D9);
            b = GG(b, c, d, a, x[k + 12], S24, 0x8D2A4C8A);
            a = HH(a, b, c, d, x[k + 5], S31, 0xFFFA3942);
            d = HH(d, a, b, c, x[k + 8], S32, 0x8771F681);
            c = HH(c, d, a, b, x[k + 11], S33, 0x6D9D6122);
            b = HH(b, c, d, a, x[k + 14], S34, 0xFDE5380C);
            a = HH(a, b, c, d, x[k + 1], S31, 0xA4BEEA44);
            d = HH(d, a, b, c, x[k + 4], S32, 0x4BDECFA9);
            c = HH(c, d, a, b, x[k + 7], S33, 0xF6BB4B60);
            b = HH(b, c, d, a, x[k + 10], S34, 0xBEBFBC70);
            a = HH(a, b, c, d, x[k + 13], S31, 0x289B7EC6);
            d = HH(d, a, b, c, x[k + 0], S32, 0xEAA127FA);
            c = HH(c, d, a, b, x[k + 3], S33, 0xD4EF3085);
            b = HH(b, c, d, a, x[k + 6], S34, 0x4881D05);
            a = HH(a, b, c, d, x[k + 9], S31, 0xD9D4D039);
            d = HH(d, a, b, c, x[k + 12], S32, 0xE6DB99E5);
            c = HH(c, d, a, b, x[k + 15], S33, 0x1FA27CF8);
            b = HH(b, c, d, a, x[k + 2], S34, 0xC4AC5665);
            a = II(a, b, c, d, x[k + 0], S41, 0xF4292244);
            d = II(d, a, b, c, x[k + 7], S42, 0x432AFF97);
            c = II(c, d, a, b, x[k + 14], S43, 0xAB9423A7);
            b = II(b, c, d, a, x[k + 5], S44, 0xFC93A039);
            a = II(a, b, c, d, x[k + 12], S41, 0x655B59C3);
            d = II(d, a, b, c, x[k + 3], S42, 0x8F0CCC92);
            c = II(c, d, a, b, x[k + 10], S43, 0xFFEFF47D);
            b = II(b, c, d, a, x[k + 1], S44, 0x85845DD1);
            a = II(a, b, c, d, x[k + 8], S41, 0x6FA87E4F);
            d = II(d, a, b, c, x[k + 15], S42, 0xFE2CE6E0);
            c = II(c, d, a, b, x[k + 6], S43, 0xA3014314);
            b = II(b, c, d, a, x[k + 13], S44, 0x4E0811A1);
            a = II(a, b, c, d, x[k + 4], S41, 0xF7537E82);
            d = II(d, a, b, c, x[k + 11], S42, 0xBD3AF235);
            c = II(c, d, a, b, x[k + 2], S43, 0x2AD7D2BB);
            b = II(b, c, d, a, x[k + 9], S44, 0xEB86D391);
            a = AddUnsigned(a, AA);
            b = AddUnsigned(b, BB);
            c = AddUnsigned(c, CC);
            d = AddUnsigned(d, DD);
        }
        return (WordToHex(a) + WordToHex(b) + WordToHex(c) + WordToHex(d)).toLowerCase();
    }

    static fill(s, c = " ", l = 8, d = -1) {
        c = !c ? " " : c;
        d = d == 0 || d == null || d == undefined ? -1 : d;
        while (('' + s).length < l) s = (d < 0 ? c : "") + s + (d > 0 ? c : "");
        return s
    }

    static desnerdify(x) {
        let
            n = Number(x.replace(/[^0-9\.]/g, '').replace(',', '.')),
            s = x.replace(/[^a-zA-Z]/g, '');
        switch (s) {
            case "tri":
                n *= 1000000000000;
                break;
            case "bi":
                n *= 1000000000;
                break;
            case "mi":
                n *= 1000000;
                break;
            case "k":
                n *= 1000;
                break;
            default:
                n *= 1;
                break;
        }
        return n
    }
    static json(o) {
        let
            result = null;
        try {
            result = JSON.parse(o);
        } catch (e) {
            // statements
            console.trace(e);
        }
        return result;
    }
    static prepare(str, obj = null) {
        if (!obj) return this;
        Object.keys(obj).each(x => {
            let
                rgx = new RegExp("@" + x, "g");
            str = str.replace(rgx, obj[x]);
        })
        return str;
    }
    static regex(str, tx, flag = "gi") {
        if (Array.isArray(tx)) tx = tx.join('|');
        if (typeof tx == "string") {
            let
                rx = new RegExp(tx, flag);
            return rx.test(str)
        }
        return false
    }
    static nerdify(n) {
        n *= 1
        return n > 1000000000000 ? ((n / 1000000000000).toFixed(1)) + "tri" : (
            n > 1000000000 ? ((n / 1000000000).toFixed(1)) + "bi" : (
                n > 1000000 ? ((n / 1000000).toFixed(1)) + "mi" : (
                    n > 1000 ? ((n / 1000).toFixed(1)) + "k" : Math.ceil(n)
                )
            )
        )
    }
    static async call(url, args = null, method = null, head = null) {
        method = method ? method : (args ? "POST" : "GET")
        const
            o = new Promise(function(accepted, rejected) {
                let
                    o = new FCallResponse(url, args, method),
                    xhr = new XMLHttpRequest();

                xhr.onreadystatechange = function() {
                    if (xhr.readyState == 4) {
                        o.status = xhr.status;
                        o.data = xhr.responseText.trim();
                        return accepted(o);
                    };
                }
                xhr.open(method, url);
                // xhr.setRequestHeader("Content-Type", method=="POST" ? "application/json;charset=UTF-8": "text/plain");
                // xhr.setRequestHeader("FA-Custom", "@rafsb");
                // if(app.hash) xhr.setRequestHeader("hash", app.hash);
                // if(method == "POST") head = binds({ "Content-Type": "application/json"}, head||{});
                // if(head) Object.keys(head).each(h=>xhr.setRequestHeader(h,head[h]));
                xhr.send(args ? args.json() : null);

            });
        return o;
    }

    static async post(url, args, head = { "Content-Type": "application/json;charset=UTF-8" }) {
        return this.call(url, args, "POST", head)
    }

    static nuid(n = 8, prefix = "_") {
        let
            a = prefix;
        n -= a.length;
        while (n > 0 && n-- > n) { a += "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789".split('')[parseInt((Math.random() * 36) % 36)] }
        return a
    }

    static colors(pallete = "light") {
        return pallete && this.color_pallete[pallete] ? this.color_pallete[pallete] : this.color_pallete;
    }

    static hashit(o) { if (typeof o == "object" || typeof o == "array") o = JSON.stringify(o); return btoa(o) }

    static sanitize(str) {
        return encodeURIComponent(str).replace(/!/g, '%21').replace(/'/g, '%27').replace(/\(/g, '%28').replace(/\)/g, '%29').replace(/\*/g, '%2A').replace(/%20/g, '+')
    }

    static async sleep(time = ANIMATION_LENGTH) {
        return new Promise(function(ok) {
            setTimeout(function() { return ok() }, time)
        })
    }

    static iterate(s, e, fn, step = 1) {
        const x = [];
        if (!fn) fn = i => i;
        s = s || 0;
        e = e || s + 1;
        for (let i = s; i != e; i += step) x.push(fn(i));
        return x;
    }

    rgb2hex(color) {
        let
            hex = "#";
        if (!Array.isArray(color)) color = color.split(/[\s+,.-]/g);
        color.each(clr => {
            let
                tmp = (clr * 1).toString(16);
            hex += tmp.length == 1 ? "0" + tmp : tmp;
        })
        return hex.substring(0, 9)
    }

    hex2rgb(color) {
        let
            rgb = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})|([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(color);
        return rgb ? [parseInt(rgb[1] || 255, 16), parseInt(rgb[2] || 255, 16), parseInt(rgb[3] || 255, 16), parseInt(rgb[3] || 255, 16)] : null;
    }

    constructor() {
        this.Object = new FObject()
        this.Array = new FArray()
        this.initial_pragma = 0
        this.current = 0
        this.last = 0
        this.initPool = new Pool()
        this.onPragmaChange = new Pool()
        this.components = {}
        this.prism = {
            ALIZARIN: "#E84C3D",
            PETER_RIVER: "#2C97DD",
            ICE_PINK: "#CA179E",
            EMERLAND: "#53D78B",
            SUN_FLOWER: "#F2C60F",
            AMETHYST: "#9C56B8",
            CONCRETE: "#95A5A5",
            WET_ASPHALT: "#383C59",
            TURQUOISE: "#00BE9C",
            PURPLE_PINK: "#8628B8",
            PASTEL: "#FEC200",
            CLOUDS: "#ECF0F1",
            CARROT: "#E67D21",
            MIDNIGHT_BLUE: "#27283D",
            WISTERIA: "#8F44AD",
            BELIZE_HOLE: "#2A80B9",
            NEPHRITIS: "#27AE61",
            GREEN_SEA: "#169F85",
            ASBESTOS: "#7E8C8D",
            SILVER: "#BDC3C8",
            POMEGRANATE: "#C0382B",
            PUMPKIN: "#D35313",
            ORANGE: "#F39C19",
            BURRO_QNDO_FOJE: "#8C887B"
        }
        this.color_pallete = {
            /*** SYSTEM***/
            BACKGROUND: "#FFFFFF",
            FOREGROUND: "#ECF1F2",
            FONT: "#2C3D4F",
            FONTINVERTED: "#F2F2F2",
            FONTBLURED: "#7E8C8D",
            SPAN: "#2980B9",
            DISABLED: "#BDC3C8",
            DARK1: "rgba(0,0,0,.08)",
            DARK2: "rgba(0,0,0,.16)",
            DARK3: "rgba(0,0,0,.32)",
            DARK4: "rgba(0,0,0,.64)",
            LIGHT1: "rgba(255,255,255,.08)",
            LIGHT2: "rgba(255,255,255,.16)",
            LIGHT3: "rgba(255,255,255,.32)",
            LIGHT4: "rgba(255,255,255,.64)"
                /*** PALLETE ***/
                ,
            WHITE: "#FFFFFF",
            BLACK: "#000000"
        }
        binds(this.color_pallete, this.prism);
    }
};;

// console.log('  __\n\ / _| __ _  __ _ _   _\n\| |_ / _` |/ _` | | | |\n\|  _| (_| | (_| | |_| |\n\|_|  \\__,_|\\__,_|\\__,_|');

module.exports = {
    FDate: FDate,
    FObject: FObject,
    FArray: FArray,
    FPool: FPool,
    FThrottle: FThrottle,
    FLoader: FLoader,
    faau: faau
}