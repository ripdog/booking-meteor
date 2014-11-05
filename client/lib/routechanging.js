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
		Router.go(Router.current().route.getName(), newparams);
	}
};
newAppointment = function(newtime) {
	if (newtime && newtime instanceof Date) {
		newtime = moment(newtime).format('hh-mm-A');
	} else {
		newtime = newtime.replace(':', "-").replace(' ', "-")
	}
	if (Router.current().params.provName && Router.current().params.date) {
		var newparams = {date: Router.current().params.date,
			provName: Router.current().params.provName};
		if(newtime) {
			newparams.time = newtime;
		}
		Router.go('newAppointment', newparams);
	}
};
goHome = function(newDate, newProv) {//newDate is a date obj please
	var newparams = {}
	if (Session.get('date') && Session.get('selectedProviderName')) {
		newparams.date = moment(Session.get('date')).format('YYYY-MM-DD') ;
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
}