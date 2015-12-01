Template.calendar.rendered = function() {
	var currentView = $("#innercalendar").fullCalendar("getView");
	var currentSub;
	currentSub = Meteor.subscribe("unusualDaysRange", currentView.start.toDate(), currentView.end.toDate());
	Session.set('date', moment().startOf('day').format('YYYY-MM-DD'));

	$("#innercalendar").on('viewRender', function(view, element) {
		console.log('jquery event triggered');
		console.log(view.start);
	})
};
Template.calendar.events({
	'viewRender #innercalendar': function(event, view, element) {
		console.log('meteor event triggered');
		console.log(view.start);
	}
});

Tracker.autorun(function() {
	try {
		if (Router.current().route.getName() == "calendar") {
			console.log("populating calendar");
			var containingObject = { events: []};
			_.forEach(unusualDays.find().fetch(), function(day) {
				containingObject.events.push({title:day.notes, start: day.date, allday: true })
			});
			$('#innercalendar').fullCalendar("addEventSource", containingObject)
		}
	}
	catch (e) {}

});

Tracker.autorun(function() {

});