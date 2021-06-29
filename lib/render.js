const
IO = LIB('io')
;;

module.exports = class Render {
    static render(){
        if(IO.exists(EPaths.APP + 'index.html')) return IO.read(EPaths.APP + 'index.html');
        return '<h1> ERROR 404 </h1>'
    }
}
