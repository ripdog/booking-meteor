// 	 /$$                 /$$                                        
// 	| $$                | $$                                        
// 	| $$$$$$$   /$$$$$$ | $$  /$$$$$$   /$$$$$$   /$$$$$$   /$$$$$$$
// 	| $$__  $$ /$$__  $$| $$ /$$__  $$ /$$__  $$ /$$__  $$ /$$_____/
// 	| $$  \ $$| $$$$$$$$| $$| $$  \ $$| $$$$$$$$| $$  \__/|  $$$$$$ 
// 	| $$  | $$| $$_____/| $$| $$  | $$| $$_____/| $$       \____  $$
// 	| $$  | $$|  $$$$$$$| $$| $$$$$$$/|  $$$$$$$| $$       /$$$$$$$/
// 	|__/  |__/ \_______/|__/| $$____/  \_______/|__/      |_______/ 
// 	                        | $$                                    
// 	                        | $$                                    
// 	                        |__/                                    
Template.bookingTable.helpers({
	unusualDays: function() {
		return unusualDays.findOne({date: Session.get("date"), providerName: Session.get("selectedProviderName")});
	},
	day: function() {
		var momentobj = moment(Session.get("date"));
		var ret = momentobj.format("dddd, MMMM Do GGGG");
		return ret + " -"+ dayDelta(Session.get("date"));
	},
	loggedIn: function() {
		return Meteor.userId();
	},
	times: function(){
		if (Roles.userIsInRole(Meteor.userId(), "provider")) {
			console.log("user is provider, setting selected provider name");
			Session.set("selectedProviderName", Meteor.user().providerName);
		}
		var provObject = getProvObject(Session.get("date"), Session.get('selectedProviderName'));
		if (!provObject) {
			console.log("provider not yet available, bailing out");
			return;
		}
		// console.log(provObject);
		var dateCounter = moment().startOf('day').hours(provObject.startTime);
		var dateTarget = moment().startOf('day').hours(provObject.endTime);
		var ret = [];
		var theTime;
		while(dateTarget.diff(dateCounter) > 0)
		{
			theTime = dateCounter.format("h:mm A");
			ret.push({time: theTime, rowTimeId:theTime});
			dateCounter.add(provObject.appointmentLength, "minutes");
		}
		var finalTime = dateCounter.format("h:mm A");
		// console.log(JSON.stringify({time: finalTime}));
		ret.push({time: finalTime, rowTimeId:finalTime});
		console.log("times has finished. Rerendering.");
		// rerenderDep.changed()
		return ret;
	},
	blockouts: function() {
		return getBlockouts(Session.get("selectedProviderName"), Session.get('date'));
	},
	appointments: function() {
		var theDate = Session.get("date");
		startDate = moment(theDate).startOf("day").toDate();
		endDate = moment(theDate).endOf("day").toDate();
		// console.log(JSON.stringify({date: {$gte: startDate, $lt: endDate}}));
		queryPointer = appointmentList.find({date: {$gte: startDate, $lt: endDate},
			providerName: Session.get("selectedProviderName")});
		return queryPointer;
	},
	providerNames: function() {
		return providers.find({}, {fields: {name: 1}})
	},
	selected: function() {
		if(Session.get("selectedProviderName") === this.name) {
			return "active";
		}
	},
	todaysUnusualTimes: function () {
		return unusualDays.findOne({date:Session.get('date'), providerName: Session.get("selectedProviderName")})
	},

	buttonStyle: function() {
		
		if (unusualDays.findOne({date:Session.get('date'), providerName: Session.get("selectedProviderName")})){
			return "display: none;";
		}
		else {
			return "";
		}
	},
	notes: function () {
		try{
			return unusualDays.findOne({date:Session.get('date'), providerName: Session.get("selectedProviderName")}).notes
		} catch(e) {/*fails when there is no unusualDay for today.*/}
	}
});



Template.bookingTable.events({
	'click .providerTab': function(event) {
		console.log('providerTab clicked');
		changeParams(null,$(event.currentTarget).data("name"));
	},
	'dblclick .appointmentItem': function(event) {
		event.stopImmediatePropagation();
		Router.go('editAppointment', {id: $(event.currentTarget).data("id")});
		// Session.set("currentlyEditingDoc", );
	},
	'dblclick .blockoutItem': function(event) {
		event.stopImmediatePropagation();
		Router.go('editBlockout', {id: $(event.currentTarget).data("id")});
	},
	'click #customTimesButton': function(event) {
		var provObject = providers.findOne({name: Session.get("selectedProviderName")});
		unusualDays.insert({date: Session.get('date'),
			providerName: Session.get("selectedProviderName"),
			startTime: provObject.startTime,
			endTime: provObject.endTime,
			appointmentLength: provObject.appointmentLength});
	},
	'click #deleteCustomTimes': function(event) {
		unusualDays.remove(unusualDays.findOne({date:Session.get('date'), providerName: Session.get("selectedProviderName")})._id);
	},
	'dblclick .rowContent': function(event) {
		newAppointment(event.currentTarget.previousElementSibling.innerHTML.replace(':','-'));
	}
});

Template.bookingTable.rendered = function() {
	console.log("rerendering");
	rerenderDep.changed();
	Tracker.autorun(function(asd) {
		// /appointToScrollTo
		// var pos = $('div[data-id="'+Session.get("currentlyEditingDoc")+'"]')[0].offsetTop
		var pos = Session.get("scrollToPoint");
		if (pos === null) {return;}
		console.log("Scrolling to :" + pos);
		$("#bookingTableWrapper").animate({
			scrollTop: pos,
			scrollLeft: 0
		});
		Tracker.nonreactive(function() {
			Session.set("scrollToPoint", null);
		})
		
	})
}





Template.timeRow.helpers({
	rowHighlightClass: function() {
		if (Session.get("newTime") !== "undefined" && Session.get("formForInsert") === true) {
			if(Session.get("newTime") == this.time) {
				console.log(this);
				return "bg-success";
			}
		}
		
	}
})
Template.timeRow.rendered = function(){
	if(Session.equals("newTime", this.data.time)) {
		Session.set("scrollToPoint", this.firstNode.offsetTop);
	}
}

