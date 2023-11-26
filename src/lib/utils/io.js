
const
fs = require("fs")
, os = require('os')
, path = require(`path`)
, fobject = require('./object')
, farray = require('./array')
;;

global.EIO = Object.freeze({
    REPLACE: 0
    , APPEND: 1
    , MAX_LOG_LINES: 1024
})

global.EIOErrors = Object.freeze({
    PATH_MISSING:   -1
    , OBJ_MISSING:  -2
    , PATH_BROKEN:  -3
})

module.exports = class IO {
    static root(p=null){
        if(p) {
            p = p.replace(/[\\/]+/g, path.sep)
            if(p[0] == path.sep || p.match(/\b[a-zA-Z]{1}:.*/gi)) return p;
        }
        return (ROOT + (p || ``)).replace(/[\\/]/g, path.sep)
    }

    static exists(f) {        
        return fs.existsSync(IO.root(f))
    }

    static read(f){
        var tmp = "";
        f = IO.root(f);
        if(f && fs.existsSync(f)) tmp = fs.readFileSync(f, "utf8").trim();
        return tmp;
    }

    static write(f, content, mode=EIO.REPLACE){
        f = IO.root(f)
        let tmp = f.split(/[\\/]/g) ;;
        tmp = tmp.slice(0,tmp.length-1).join(path.sep)
        if(!fs.existsSync(tmp)) IO.mkd(tmp)
        tmp = (mode == EIO.APPEND && fs.existsSync(f) ? IO.read(f) + "\n" : "") + content
        fs.writeFileSync(f, tmp)
        return fs.existsSync(f)
    }

    static jin(p=null, obj=null, mode=EIO.REPLACE, pretty=false) {
        if(p===null) return EIOErrors.PATH_MISSING
        if(obj===null) return EIOErrors.OBJ_MISSING
        try { obj = JSON.stringify(obj, null, pretty ? 4 : null) } catch(e){ if(VERBOSE>=2) console.trace(e); obj = false }
        return obj ? IO.write(p, obj, mode) : false
    }

    static jout(p) {
        try {
            const tmp = JSON.parse(IO.read(p)) ;;
            return Array.isArray(tmp) ? farray.cast(tmp) : fobject.cast(tmp)
        } catch(e){
            if(VERBOSE>=2) console.trace(e);
            return false
        }
    }

    static log(content, f="debug", mode = EIO.APPEND) {
        var tmp = [], offset ;
        f = [ "var", "logs" ].join(path.sep) + path.sep + f + (f.indexOf('.log') + 1 ? '' : '.log');
        if(fs.existsSync(IO.root(f))){
            tmp = mode == EIO.APPEND ? IO.read(f) : null
            if(tmp) tmp = tmp.split(/\n/g)
            else tmp = []
        }
        tmp.push(content);
        offset = tmp.length - EIO.MAX_LOG_LINES;
        tmp = tmp.slice(offset > 0 ? offset : 0, EIO.MAX_LOG_LINES).join('\n');
        IO.write(f, tmp, EIO.REPLACE);
        return content
    }

    static scan(folder=null,extension=null, withfolders=true) {
        if(folder===null || !fs.existsSync(IO.root(folder))) return new farray();
        var
        tmp = fs.readdirSync(IO.root(folder))
        , result = new farray()
        ;;
        if(tmp){
            tmp.forEach(t => {
                if(!(t=="." || t=="..")){
                    if(extension){
                        if(t.substr(extension.length*-1) == extension) result.push(t);
                    }
                    else if(withfolders || !fs.lstatSync(folder + path.sep + t).isDirectory()) result.push(t);
                }
            })
        }
        return result;
    }

    static files(p,ext=null) {
        return IO.scan(p,ext,false);
    }

    static folders(p) {
        var
        arr = new farray()
        , tmp = IO.scan(p, null, true)
        ;;
        if(tmp.length) tmp.forEach(f => { if(fs.lstatSync(IO.root(`${p}${path.sep}${f}`)).isDirectory()) arr.push(f) });
        return arr;
    }

    static rmf(dir=null){
        dir = IO.root(dir)
        try {
            fs.rmSync(dir, { recursive: true })
        } catch(e) {
            console.error(new Date(), 'IO', 'rmf', e.toString())
            if(VERBOSE>3) console.trace(e)
        }
        return !fs.existsSync(dir)
    }

    static mkd(dir){
        // console.log(`\n\n`, IO.root(dir), `\n\n`)
        fs.mkdirSync(IO.root(dir), { recursive: true })
        return fs.existsSync(dir)
    }

    static tmp() {
        return fs.mkdtempSync(os.tmpdir(), "fw")
    }

    static rm(p=null) {
        if(p===null) return EIOErrors.PATH_MISSING;
        p = IO.root(p);
        return fs.existsSync(p) ? fs.unlinkSync(p) : true;
    }

    static cpr(f,t) {
        if(!f||!t) return EIOErrors.PATH_MISSING;

        f = IO.root(f)
        t = IO.root(t)

        if(!fs.existsSync(f)) return EIOErrors.PATH_BROKEN;
        if(!fs.existsSync(f)) fs.mkdirSync(t)

        if(fs.lstatSync(f).isDirectory()) {
            fs.readdirSync(f).forEach(file => {
                if(fs.lstatSync(f + path.sep + file).isDirectory()) IO.cpr(f + path.sep + file, t );
                else fs.copyFileSync(f + path.sep + file, t);
            })
        }
    }

    static mv(f,t)
    {
        if(!f||!t) return EIOErrors.PATH_MISSING;
        f = IO.root(f)
        t = IO.root(t)
        // console.log({ f, t })
        return fs.renameSync(f, t)
    }

}