const
IO = LIB("io")
, default_theme = {
    BACKGROUND : "#FFFFFF"
    , FOREGROUND : "#ECF1F2"
    , FONT : "#2C3D4F"
    , FONTINVERTED: "#F2F2F2"
    , FONTBLURED:"#7E8C8D"
    , SPAN :"#2980B9"
    , DISABLED: "#BDC3C8"
}
;;

module.exports = class Themes {
    
    static get(theme_name){
        const path = EPaths.ASSETS + "themes/" + theme_name + ".theme";
        return IO.read(IO.exists(path) ? path : EPaths.ASSETS + "themes/light.theme", UTF8);
    }

    static render(obj){
        return this.get(obj.theme)
    }

}