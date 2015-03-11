/**
 * Created by Mitchell on 2014-10-24.
 */
changeParams = function(newDate, newProv, newTime) {
	//TODO: Update this so a single object with named children is passed in
	//also do row highlighting for newblockout
	//Provides non-destructive in-place changing of URL parameters
	var possibleParams = ["date", "provName", "time", "id"];//keep this up to date with all possible param names
	newparams = {};
	for (i = 0; i <= possibleParams.length; i++) {
		if (typeof Router.current().params[possibleParams[i]] === "string") {
			newparams[possibleParams[i]] = Router.current().params[possibleParams[i]];
		}
	}
	if(newDate) {
		newparams.date = moment(newDate).format('YYYY-MM-DD');
	}
	if(newProv) {
		newparams.provName = newProv;
	}
	if (newTime) {
		newparams.time = newTime;
	}
	//console.log(EJSON.stringify(newparams));
	Router.go(Router.current().route.getName(), newparams);
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