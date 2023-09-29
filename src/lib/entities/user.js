/*---------------------------------------------------------------------------------------------
 * User
 *--------------------------------------------------------------------------------------------*/

const hash = require('md5') ;;

if(!global.EUserLevels) global.EUserLevels = Object.freeze({
    PUBLIC : 0
    , DEV  : 9
})

const
entity = require('../interfaces/entity')
, fobject = require('../utils/fobject')
;;

module.exports = class User extends entity {

    id_builder(){
        this.id = this.id || hash(this.user)
    }

    validate() {
        return this.id
            && this.name
            && this.level !== undefined
        ? true : false
    }

    pass(alvl=EUserLevels.PUBLIC) {
        return this.level >= alvl
    }

    constructor(obj){
        super(fobject.blend({
            user    : ""
            , name  : ""
            , mail  : ""
            , level : 1
        }, obj))
    }

}