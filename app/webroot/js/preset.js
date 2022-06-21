const

/**
 * PRESETS
*/

ANIMATION_LENGTH 	    = 400
, AL 				    = ANIMATION_LENGTH

/*
 * ENUMS
 */
 , EPaths = Object.freeze({
 	API                 : "/api/"
 })

, EUsers = Object.freeze({
	LOGGED              : 0
	, USER              : 1
	, MANAGER           : 2
	, ADMIN             : 3
    /** 4-6 */
	, DEV               : 7
	, SYSTEM            : 8
	, ROOT              : 9
})

, EPragmas = Object.freeze({
	NOT_SET             : 0
})

/*
 * CLIENT PREDEFINED CONSTANTS
 */
, APP_NEEDS_LOGIN 	    = false
, APP_DEFAULT_THEME     = `light`
;;

app.loading()

app.blend(app, {
    components          : {}
    , theme_name        : app.storage("theme_name", app.storage("theme_name") || APP_DEFAULT_THEME)
    , initial_pragma    : EPragmas.NOT_SET
    , clear_cache: _ => {
        [
            /*
             * Clear Storage variables
             */
            "hash", "theme_name", "custom_theme", "v"

        ].each(item => app.storage(item, false))
    }
})
;;

bootloader.dependencies = [
    /*
     * Set the components to be loaded before
     * the system boot
     */
    "theme", "splash", "home", "header"
];

/*
 * These components are loaded at system boot times
 * the splash screen will let the system procede
 * after this execution queue and all bootloader`s
 * loaders are all done
 */
bootloader.loadComponents.add(async _ => {

    /**
     * Check current scripts version
     */
    const v = await app.call(EPaths.API + 'version') ;;
    if(app.storage('v') != v.data) {
        app.warn('Há uma atualização em andamento! Em instantes o sistema será iniciado...');
        return setTimeout(_ => {
            app.work('Recarregando scripts...');
            return setTimeout(_ => {
                app.clearStorage();
                app.storage('v', v.data);
                location.reload()
            }, AL * 4)
        }, AL * 4)
    }

    /**
     * Load App theme and assign
    */
    let theme = (await app.post(EPaths.API + "themes", { theme: app.theme_name })).data.json() ;;
    let custom_theme = app.storage("custom_theme");
    if(custom_theme) app.blend(theme, custom_theme.json());
    app.blend(app.color_pallete, theme);
    [ "background", "foreground" ].map(x => app.get(".--"+x).css({ background: app.color_pallete[x.toUpperCase()] }));
    bootloader.ready("theme")

    /*
    * Splash/Login boot depends on config
    */
    await app.load("splash.htm")
    await app.load("home.htm")

})

/*
 * This pool will fire after all loaders are true
 */
bootloader.onFinishLoading.add(function() {

    /*
     * commonly used helpers, uncommnt to fire
     */
    // app.tooltips();
    app.loading(false)

})

/*
 * a key pair value used for tooltips
 * tooltip() function must be fired to
 * make these hints work
 */
app.hints = {
    // some_id: "A simple tootlip used as example"
}

/*
 * The system will boot with bootloader rules
 * comment to normal initialization without
 * possible system dependencies
 */
InitPool.add(_ => bootloader.loadComponents.fire())

// app.onPragmaChange.add(pragma => {
//     /**
//      *
//      * TODO:  pragma based system
//      *
//      */
// })

window.onpopstate = x => {
    app.back_used = true;
    switch(x.state.ref) {

        case('p'):
            if(x.state.query == 'home') {
                /**
                 * TODO
                 */
            }
        break;

        default: history.back(); break;

    }
}