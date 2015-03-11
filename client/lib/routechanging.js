/**
 * Created by Mitchell on 2014-10-24.
 */
changeParams = function(inputObj) {
	// Call it like this: changeParams({time: "12:00 AM", date: Date(), provName: "Provider"})
	//Provides non-destructive in-place changing of URL parameters
	newparams = {};
	for (param in Router.current().params) { //first, copy out all old params
		if (!Router.current().params.hasOwnProperty(param)) {
			continue;//ignores BS properties
		}
		//console.log(Router.current().params[param]);
		newparams[param] = Router.current().params[param];
	}
	for (param in inputObj) {//then replace/add all input params
		if (!Router.current().params.hasOwnProperty(param)) {
			continue;//ignores BS properties
		}
		//console.log(inputObj[param]);
		newparams[param] = inputObj[param];
	}
	if (inputObj.route) {//finally, change route if requested.
		Router.go(inputObj.route, newparams);
	} else {
		Router.go(Router.current().route.getName(), newparams);
	}

};
newAppointment = function(newtime, block) {
	//if block is true, we'll go to newBlockout instead
	if (typeof block === "undefined") {
		block = false;
	}
	console.log("newAppointment with time " + newtime);
	var newparams = {};
	if (newtime && newtime instanceof Date) {
		newtime = moment(newtime).format('h-mm-A');
	} else if (newtime && typeof newtime === "string") {
		newtime = newtime.replace(':', "-").replace(' ', "-")
		//change 12:40 PM to 12-40-PM
	}
	if (Router.current().params.provName && Router.current().params.date) {
		newparams.date = Router.current().params.date;
		newparams.provName = Router.current().params.provName;
	} else if (Session.get('date') && Session.get("selectedProviderName")) {
		newparams.date = moment(Session.get('date')).startOf('day').format('YYYY-MM-DD');
		newparams.provName = Session.get("selectedProviderName");
	} else {
		console.error("newAppointment called without date or providerName set");
		newparams.date = moment().startOf('day').format('YYYY-MM-DD');
		newparams.provName = providers.findOne().name;
	}
	if (newtime) {
		newparams.time = newtime;
	} else {
		newparams.time = "12-00-AM"
	}
	console.log(newparams);
	if (!block) {
		Router.go('newAppointment', newparams);
	} else {
		Router.go('newBlockoutForm', newparams);
	}
};
goHome = function(newDate, newProv) {//newDate is a date obj please
	var newparams = {};
	if (Session.get('date') && Session.get('selectedProviderName')) {
		newparams.date = moment(Session.get('date')).format('YYYY-MM-DD');
		newparams.provName= Session.get('selectedProviderName');
	} else {
		Router.go('/'); //when moving from non-bookingtable pages.
	}
	if(newDate) {
		newparams.date = moment(newDate).format('YYYY-MM-DD');
	}
	if(newProv) {
		newparams.provName = newProv;
	}

	Router.go('bookingTable', newparams);
};