/*---------------------------------------------------------------------------------------------
 * Dict
 *--------------------------------------------------------------------------------------------*/

const
{ App } = require(`../il`)
, Entity = require('../interfaces/entity')
;;

module.exports = class Asset extends Entity {

    validate(){
        return (
            this.id
            && this.data()
        ) ? this : null
    }

    constructor(obj){
        super(App.blend({ name_: '' }, obj))
    }

}