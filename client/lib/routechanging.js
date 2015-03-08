/**
 * Created by Mitchell on 2014-10-24.
 */
changeParams = function(newDate, newProv) {
	if (Router.current().params.provName && Router.current().params.date) {
		var newparams = {date: Router.current().params.date,
						provName: Router.current().params.provName};
		if(newDate) {
			newparams.date = moment(newDate).format('YYYY-MM-DD');
		}
		if(newProv) {
			newparams.provName = newProv;
		}
		console.log(EJSON.stringify(newparams));
		Router.go(Router.current().route.getName(), newparams);
	}
};
newAppointment = function(newtime) {
	console.log("newAppointment with time " + newtime);
	var newparams = {};
	if (newtime && newtime instanceof Date) {
		newtime = moment(newtime).format('hh-mm-A');
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
		newparams.date = moment().startOf('day').format('YYYY-MM-DD');
		newparams.provName = providers.findOne().name;
	}
	if (newtime) {
		newparams.time = newtime;
	} else {
		newparams.time = "12-00-AM"
	}
	console.log(newparams);
	Router.go('newAppointment', newparams);
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