/*---------------------------------------------------------------------------------------------
 * User
 *--------------------------------------------------------------------------------------------*/

const hash = require('md5') ;;

if(!global.EUserLevels) global.EUserLevels = Object.freeze({
    PUBLIC  : 0
    , OWNER : 7
    , DEV   : 8
    , ROOT  : 9
})

const
entity = require('../interfaces/entity')
, fobject = require('../utils/object')
;;

module.exports = class Users extends entity {

    id_builder() {
        this.id = this.id || -1
        return true
    }

    validate() {
        return Boolean(this.username && this.access_level !== undefined)
    }

    pass(alvl=EUserLevels.PUBLIC) {
        return Boolean(this.access_level >= alvl)
    }

    constructor(obj){
        super(fobject.blend({
            username        : ``
            , password      : ``
            , uat           : ``
            , dev           : ``
            , access_level  : EUserLevels.PUBLIC
            , status        : EStatus.ACTIVE
        }, obj))
    }

}