const
IO = require(`../../../lib/io`)
;;

module.exports = class Themes {

    static get(theme_name) {
        const path = EPaths.ASSETS + "themes/" + theme_name + ".theme";
        return IO.read(IO.exists(path) ? path : EPaths.WEBASSETS + "themes/light.theme");
    }

    static init(obj) {
        return this.get(obj?.theme ? obj.theme : 'light')
    }

}