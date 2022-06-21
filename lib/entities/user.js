/*---------------------------------------------------------------------------------------------
 * User
 *--------------------------------------------------------------------------------------------*/

const
{ App, FDate } = require(`../il`)
, Entity = require('../interfaces/entity')
;;

module.exports = class User extends Entity {

    async last_access(date){
        if(date) {
            date = FDate.guess(date);
            this.last_access_ = date.time();
            this.last_acces_str_ = date.as(`Y-m-dTh:i:s.000Z`)
        }
        return [ this.last_access_, this.last_access_str_ ]
    }

}