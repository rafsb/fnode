/**************************************************************************
 * farray
 ***************************************************************************/
module.exports = class farray extends Array {

    static cast(arr){
        return new farray(...(arr || arguments))
    }

    static iterate(s, e, fn, step = 1) {
        if (!fn) fn = i => i
        s = s || 0
        e = e || s + 1
        const x = [] ;;
        for (let i = s; i != e; i += step) x.push(fn(i))
        return farray.cast(x)
    }

    json(){ return JSON.stringify(this); }

    clone() { return this.slice(0) }

    each(fn) { if(fn) return this.map(fn); return this }

    static each(arr, callback){
        return farray.cast(arr).each(callback)
    }

    extract(fn=null){
        if(!fn) return this;
        return this.map((x,i)=>fn?fn(x,i):i).filter(i=>i)
    }

    cast(arr){
        return new farray(arr)
    }

    tiny(n=10){
        let
        narr=[ this.first() ]
        , x = this.length / (n-1)
        , i = x
        ;
        while(i<this.length){
            narr.push(this.interpolate(i))
            i+=x
        }
        narr.push(this.last())
        return narr
    }

    sum() {
        return this.reduce((p, q) => p += q, 0)
    }

    average() {
        return this.sum() / this.length
    }
    
    harmony() {
        return this.length/this.reduce((p, q) => p+=1/q, 0)
    }
    
    trend(target) {
        let m, b, x, y, x2, xy, z, np = this.length ;;
        m = b = x = y = x2 = xy = z = 0
        target = target || np
        this.each((n, i) => {
            x = x + i
            y = y + n
            xy = xy + i * n
            x2 = x2 + i * i
        })
        z = np*x2 - x*x
        if(z){
            m = (np*xy - x*y)/z;
            b = (y*x2 - x*xy)/z;
        }
        return m * target + b
    }
    
    progress() {
        const me = this ;;
        return this.map((x, i) => i ? x/me[i-1] : 1)
    }
    
    max() {
        return Math.max(... this)
    }

    min() {
        return Math.min(... this)
    }

    relatify() {
        const max = this.max() ;;
        return this.map(i => i/max)
    }
            
    linear_interpolation(z) {
        if(!z) return this[0] || 0
        let x0=0, x1=Number.MAX_SAFE_INTEGER ;;
        for (let i = 0; i < this.length; i++) {
            if (this[i] !== null && this[i] !== undefined) {
                if(i<z) x0 = Math.max(x0, i)
                if(i>z) x1 = Math.min(x1, i)
            }
        }
        let y0 = this[x0]||0, y1 = this[x1]||0 ;;
        return y0 + (y1 - y0) * ((z - x0) / (x1 - x0))
    }
    lagrange_interpolation(z) {
        const x=[], y=[] ;;
        for (let i = 0; i < this.length; i++) {
            if (this[i] !== null && this[i] !== undefined) {
                x.push(i)
                y.push(this[i])
            }
        }
        let n = x.length, sum = 0 ;;
        for (let i = 0; i < n; i++) {
            let term = y[i] ;;
            for (var j = 0; j < n; j++) if(j!==i) term = term * (z - x[j]) / (x[i] - x[j])
            sum += term
        }
        return sum
    }
    fillNulls() {
        const nulls = this.map((x, i) => x === null ? i : null).filter(i=>i) ;;
        for(let i=0;i<nulls.length;i++) this[nulls[i]] = this.interpolate(nulls[i])
        return this
    }
    last(n=null) {
        if (!this.length) return null
        if (n === null) return this[this.length - 1]
        return farray.cast(this.slice(Math.max(this.length - n, 0)))
    }
    first(n=null) {
        if (!this.length) return null;
        if (n === null) return this[0];
        return farray.cast(this.slice(0, n))
    }
    at(n=0) {
        if(n >= 0) return this[n]
        return this.length > n*-1 ? this[this.length+n] : null
    }
    rand(){
        return this[Math.floor(Math.random()*this.length)]
    }
    not(el) {
        while(this.indexOf(el)+1) this.splice(this.indexOf(el), 1)
        return this;
    }
    empty(){
        return new farray(this.length)
    }
    array() {
        return [ ... this ]
    }

}
