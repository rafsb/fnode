
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

	, __Swipe__ 		= new Swipe()
	, __come__ 			= new Event('come')
	, __go__ 			= new Event('go')

	/*
	 * USER LEVELS
	 */
	, EEvents = {
		CLICK: 		  	"click"
		, MOUSEENTER: 	"mouseenter"
		, MOUSELEAVE: 	"mouseleave"
		, SUBMIT: 	  	"submit"
	}
	, EUsers = {
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
	}
	, EPragmas = {
		SCHEDULES: 	0
		, SOURCES: 	1
		, LOGS: 	2
	}
	/*
	 *
	 * CLIENT PREDEFINED CONSTANTS
	 *
	 */
;;