if(!fw.components.table) {

    function header_from_serie(serie) {
        const element = TAG('tr'), set = new Set() ;;
        serie.forEach(row => Object.keys(row).forEach(k => set.add(k)))
        set.forEach(f => {
            const e = TAG('th') ;;
            e.html(f)
            e.value = f
            element.app(e)
        })
        return { set, element }
    }

    function rows_from_serie(serie, headers, postEffects) {
        const elements = [] ;;
        serie.forEach(row => {
            const e = TAG('tr', 'flex') ;;
            headers.forEach(head => {
                const t = TAG('td', 'col-1') ;;
                let htmlval = null;
                if(row[head])  {
                    if (row[head] == null || row[head] == undefined || isNaN(row[head])) htmlval = row[head]
                    else htmlval = (row[head]*1).toFixed(5)
                } else htmlval = '-'
                e.dataset[head] = row[head]
                t.html(htmlval)
                //t.html(row[head] ? (row[head] == null || row[head] == undefined || isNaN(row[head]) ? row[head] : (row[head]*1).toFixed(1)) : '-')

                if(!isNaN(row[head])) t.css({ textAlign: 'center' })
                if(postEffects && postEffects[head]) postEffects[head](t,row)
                t.key = head
                t.val = row[head] || null
                e.app(t)
            })
            elements.push(e)
            e.item = row
            e.id = row.id
            e.on('click', function() { this.click_callback && this.click_callback(e) })
        })
        return { elements }
    }

    async function table_fill(ref, target, q={}, headers, postEffects, len, empty=false, endpoint) {
        if(empty) target.empty()
        q.offset = Math.max(0, target.$('tr').length - 1)
        q.limit = len || 100
        return new Promise(pass => sock(`${ref}/filter`, {
            data: q
            , callback: res => {
                if(res?.items?.length) {
                    if(!headers) headers = header_from_serie(res.items).set
                    rows_from_serie(res.items, headers, postEffects).elements?.forEach(row => target.app(row))
                    pass()
                } else if( !res?.items?.length && empty ) {
                    target.app(DIV("row content-center", {color:"gray", padding:"1em"}).text("Nenhum registro encontrado para o filtro selecionado."))
                }
            }
        }))

    }

    fw.components.table = async config => {

        const
        { ref, target, q, postEffects, len, headers } = config
        , table = TAG('table', 'wrap scrolls')
        ;;

        if(ref && target) {
            target.empty()
            if(headers) {
                const row = TAG('tr', 'flex') ;;
                headers.forEach(f => {
                    const e = TAG('th', 'col-1 content-center pointer', { background:'{{span}}', color:'{{light4}}', fontWeight:'bolder' }) ;;
                    e.html(fw.components.translatedict[f] || f)
                    e.value = f
                    e.onclick = function () {
                        this.upFind('--table').$('table')[1].dataSort(f, 'asc', true, true)

                        /*
                            click on the header to sort with
                            animation for add and remove
                        */
                        if(this.upFind('.-clicked').$('.-clicked')[0]){
                            this.upFind('.-clicked').$('.-clicked')[0].removeClass('-clicked')
                        }
                        this.classList.add('-clicked')
                        //
                    }
                    row.app(e)
                })
                target.app(TAG('table', 'flex').app(row))
            }
            target.app(table)
            await table_fill(ref, table, q, headers, postEffects, len, true)

            target.app(
                TAG('div', 'row').app(
                    DIV('right').app(
                        SPAN('Qtde. registros: ', 'left').css({ padding:'0 0 .5em 0', opacity: .32 })
                    ).app(
                        SPAN('0', 'left --registers').css({ padding:'0 .5em 0 1em' })
                    )
                )
            )

            target.$('.--registers')[0].text(target.$('tr').length - 1)
        }

        table.load_more = async _ => (await table_fill(ref, table, q, postEffects, len, false)) && target.$('.--registers')[0].text(target.$('tr').length - 1)

        return table
    }
}