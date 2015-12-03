Template.calendar.helpers({
	dateString: function() {
		return moment(Session.get("calendarStart")).format("MMMM YYYY");
	},
	prevmonth: function() {
		return moment(Session.get("calendarStart")).subtract(1, "month").format("MMMM")
	},
	nextmonth: function() {
		return moment(Session.get("calendarStart")).add(1, "month").format("MMMM")
	},
});

Template.calendar.rendered = function() {
	var currentView = $("#innercalendar").fullCalendar("getView");
	$("#innercalendar").fullCalendar('gotoDate', Session.get("calendarStart"));
	//$("#innercalendar").on('viewRender', function(view, element) {
	//	console.log('jquery event triggered');
	//	console.log(view.start);
	//})
	Tracker.autorun(function() {
		try {
			if (Router.current().route.getName() == "calendar") {
				$('#innercalendar').fullCalendar("removeEvents");
				console.log("populating calendar - " + unusualDays.find().count());
				var containingObject = { events: []};
				_.forEach(unusualDays.find().fetch(), function(day) {
					var title = day.providerName;
					if (typeof day.notes !== "undefined") {
						title = title + " \n" + day.notes;
					}
					containingObject.events.push({title:title, start: day.date, allDay: true })
				});
				$('#innercalendar').fullCalendar("addEventSource", containingObject)
			}
		}
		catch (e) {
			console.error("caught error while populating calendar");
			console.log(e);
		}

	});

};
Template.calendar.events({
	'viewRender #innercalendar': function(event, view, element) {
		console.log('meteor event triggered');
		console.log(view.start);
	},
	'click div#nextMonth button': function(event) {
		event.stopImmediatePropagation();
		var newdate = moment(Session.get("date")).add(1, "month");
		Router.go("/calendar/"+newdate.format("YYYY")+"/"+newdate.format("MMMM"))
	},
	'click div#prevMonth button': function(event) {
		event.stopImmediatePropagation();
		var newdate = moment(Session.get("date")).subtract(1, "month");
		Router.go("/calendar/"+newdate.format("YYYY")+"/"+newdate.format("MMMM"))
	},
});