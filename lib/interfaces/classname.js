/*---------------------------------------------------------------------------------------------
 * Classname
 *--------------------------------------------------------------------------------------------*/

const
IO = require('../io')
, { FObject } = require('../il')
;;

module.exports = class Classname extends FObject {

    classname(){ return { name: this.constructor.name, cls: new this.constructor } }

    static classname(){

        const name = this.toString().replace(/\n+/gui, ' ').split(/\s+/gui)[1].trim() ;;
        var cls;

        [
            'lib'
            , 'lib/models'
            , 'lib/entities'
            , 'lib/utils'
        ].forEach(prefix => {
            if(IO.exists(prefix + '/' + name + '.js')) cls = require('../../' + prefix + '/' + name.toLowerCase())
        })

        return { name, cls }
    }

}