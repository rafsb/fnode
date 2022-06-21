/*---------------------------------------------------------------------------------------------
 * Context
 *--------------------------------------------------------------------------------------------*/

const
Entity = require('../interfaces/entity')
, { App } = require(`../il`)
;;

module.exports = class Pragma extends Entity {

    constructor(obj){
        super(App.blend({
            name_           : ''
            , description_  : ''
            , value_        : EPragmas.NOT_SET
        }, obj));
    }

}