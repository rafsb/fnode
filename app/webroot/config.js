
const
	/*
	 *
	 * CONFIG FILE
	 *
	 */
	ANIMATION_LENGTH 	= 400
	, AL 				= ANIMATION_LENGTH

	, APP_DEFAULT_THEME = "light"
	, APP_NEEDS_LOGIN 	= false
	, CUT_CHAR          = 'ÿ'

	// , __Swipe__ 		= new Swipe()
	// , __come__ 		= new Event('come')
	// , __go__ 		= new Event('go')

	/*
	 * USER LEVELS
	 */
	, EEvents = Object.freeze({
		CLICK: 		  	"click"
		, MOUSEENTER: 	"mouseenter"
		, MOUSELEAVE: 	"mouseleave"
		, SUBMIT: 	  	"submit"
	})
	, EUsers = Object.freeze({
		LOGGED: 		0
		, USER: 		1
		, EDITOR: 		2
		, MANAGER: 		3
		, TI: 			4
		, DIRECTOR: 	5
		, ADMIN: 		6
		, DEV: 			7
		, SYSTEM: 		8
		, ROOT: 		9
	})
	, EPragmas = Object.freeze({
		SCHEDULES: 		0
		, SOURCES: 		1
		, LOGS: 		2
	})
	, EChartTypes = Object.freeze({
		LINE: 			0
		, BAR: 			1
		, WAVE: 		2
		, CURVE: 		3
		, SMOOTH: 		4
		, GROUPED_BAR: 	5
	})
	/*
	 * CLIENT PREDEFINED CONSTANTS
	 */
;;