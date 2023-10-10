
const maskdoc = e => {
    const str = e.target.value.replace(/[^0-9x]/gi,'') ;;
    let ma;
    if(!str) e.target.value = ''    
    else {         
        if (str.length < 11) {
            ma = [ str.slice(0,2), ".", str.slice(2,5), ".", str.slice(5,8), "-", str.slice(8, 10) ]
        } else if (str.length < 12) {
            ma = [ str.slice(0,3), ".", str.slice(3,6), ".", str.slice(6,9), "-", str.slice(9, 11) ]
        } else {
            ma = [ str.slice(0,2), ".", str.slice(2,5), ".", str.slice(5,8), "/", str.slice(8,12), "-", str.slice(12, 14) ]
        }        
        e.target.value = ma.filter(i=>i).join('')
    }
}

const maskphone = e => {
    const str = e.target.value.replace(/[^0-9]/g,'') ;;
    if(!str) e.target.value = ''
    else e.target.value = (
        str.length <= 10
        ? [ "(", str.slice(0,2), ")", " ", str.slice(2,6), " ", str.slice(6,10) ]
        : [ "(", str.slice(0,2), ")", " ", str.slice(2,3), " ", str.slice(3,7), " ", str.slice(7,11) ]
    ).filter(i=>i).join('')
}

const maskcep = e => {
    const str = e.target.value.replace(/[^0-9]/g,'') ;;
    if(!str) e.target.value = ''
    else e.target.value = [ str.slice(0,2), ".", str.slice(2,5), "-", str.slice(5,8) ].join('')
}
