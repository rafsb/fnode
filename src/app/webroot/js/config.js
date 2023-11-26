/*---------------------------------------------------------------------------------------------
 * CONFIG
 *--------------------------------------------------------------------------------------------*/
/*
 *
 * GLOBALS
 *
 */
window.VERBOSE            = true
window.APP_NEEDS_LOGIN    = false
/*
 * ENUMS
 */

;;

const
EPragmas = Object.freeze({
	HOME            : 0
})
, EUserLevels = Object.freeze({
    PUBLIC         : 0
    , DEV          : 9
})
;;

/*
 * These components are loaded at system boot times
 * the splash screen will let the system procede
 * after this execution queue and all bootloader`s
 * loaders are all done
 */
initpool.add(async _ => {
    /**
     *
     */
    bootloader.dependencies.add('home')
    fw.load(`home.htm`)

    /** Translate */
    bootloader.dependencies.add('translate')
    get(fw.locale + '/translate.json', res => {
        fw.components.translatedict = res
        bootloader.ready('translate')
    })

})

/**
 * LET THERE BE MAGIC
 */
fw.initial_pragma = EPragmas.HOME

fw.onPragmaChange.add((pragma, args) => {

    if(pragma == fw.last_pragma) return

})

/*
 * a key pair value used for tooltips
 * tooltip() function must be fired to
 * make these hints work
 */
blend(fw.hints, {
    // some_id: "A simple tootlip used as example"
})

history.pushState({}, "stay", "/");
window.onpopstate = e => {
    $('main.view, .-window').last()?.remove()
    history.pushState({}, "stay", "/");
}
document.onkeyup = e => {
    switch(e.key) {
        case('Escape') :  history.back(); break
    }
}

function increment(target, value, d=true, fill=false) {
    let
    v = Math.max(target.text()*1, 1)
    , pace = Math.max(1, (value - v) / 10)
    ;;
    v += pace
    if((d && v >= value) || (!d && v <= value)) return target.text(fill ? (""+value).fill('0',2) : value)
    target.text(v.toFixed(2))
    setTimeout(increment, 20, target, value, d, fill)
}