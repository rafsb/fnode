(function(app, args){

    const
    d = DIV('row content-center').app(
        TAG('form', 'col-2').attr({ action:'javascript:void(0)' }).app(
            DIV('row').app(
                TAG('input', 'row').attr({ name:'user', type:'user', placeholder:'Usuário' })
            )
        ).app(
            DIV('row', { margin: "1em 0"}).app(
                TAG('input', 'row -hash').attr({ name:'pswd', type:'password', placeholder:'Senha' })
            )
        ).app(
            DIV('row').app(
                TAG('input', 'row only-pointer', {
                    marginTop: "1em"
                    , background:'{{GREEN_SEA}}'
                    // , color: '{{SILVER}}'
                }).attr({ type:'submit', value:'Pronto!' }).on('click', function() {
                    const data = this.upFind('form').json() ;;
                    sock('auth/sign', { data, callback: res => {
                        if(res.status) {
                            app.storage('uat', res.uat)
                            app.success('Login realizado com sucesso! Reiniciando o sistema...')
                            setTimeout(_ => location.reload(), 2000)
                        } else {
                            app.storage('uat', "")
                            app.error('Ops! Algo deu errado, tente novamente mais tarde...')
                        }
                    } })
                })
            )
        ).app(
            DIV('row content-center').app(
                SPAN('OU', null, { color:'{{SILVER}}44', padding:'1em' })
            )
        ).app(
            DIV('row').app(
                TAG('input', 'row', { background:'{{silver}}22', color:"{{silver}}" }).attr({ name:'token', type:'text', placeholder:'Chave' })
            )
        )
    )
    ;;

    $('#app').empty().css({ background: "{{midnight_blue}}", color:"{{silver" }).app(
        TAG('header', 'row relative content-center', { height:'20vh' }).app(
            SPAN('·.·.·L·O·G·I·N·.·.·', 'centered -roboto-thin invert', { fontSize:'3em' })
        )
    ).app(d)

})