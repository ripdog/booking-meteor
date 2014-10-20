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
		return unusualDays.findOne({date: Session.get("date"), providerID: Session.get("selectedProviderId")});
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
		Tracker.autorun(function() {
			
			if (typeof Session.get("selectedProviderId") === "undefined") {
				try {
					Session.setDefault("selectedProviderId", providers.findOne()._id);
					console.log("No selectedProviderId, selecting one.")
				}
				catch (e) {}
			}
		})
		if (Roles.userIsInRole(Meteor.userId(), "provider")) {
			console.log("user is provider, setting selected provider id");
			Session.set("selectedProviderId", Meteor.user().providerID);
		}
		var provObject = unusualDays.findOne({date: Session.get("date"), providerID: Session.get("selectedProviderId")});
		if (!provObject) {
			provObject = providers.findOne(Session.get("selectedProviderId"));
		}
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
			ret.push({time: dateCounter.format("h:mm A"), rowTimeId:theTime});
			dateCounter.add(provObject.appointmentLength, "minutes");
		}
		var finalTime = dateCounter.format("h:mm A")
		// console.log(JSON.stringify({time: finalTime}));
		ret.push({time: finalTime, rowTimeId:finalTime});
		console.log("times has finished. Rerendering.");
		// rerenderDep.changed()
		return ret;
	},
	blockouts: function() {
		var today = moment(Session.get('date')).format("dddd").toLowerCase();
		return getBlockouts(today, Session.get("selectedProviderId"), Session.get('date'));
	},
	appointments: function() {
		var theDate = Session.get("date");
		startDate = moment(theDate).startOf("day").toDate();
		endDate = moment(theDate).endOf("day").toDate();
		// console.log(JSON.stringify({date: {$gte: startDate, $lt: endDate}}));
		queryPointer = appointmentList.find({date: {$gte: startDate, $lt: endDate}, providerID: Session.get("selectedProviderId")})
		return queryPointer;
	},
	providerNames: function() {
		return providers.find({}, {fields: {name: 1}})
	},
	selected: function() {
		if(Session.get("selectedProviderId") === this._id) {
			return "active";
		}
	},
	todaysUnusualTimes: function () {
		return unusualDays.findOne({date:Session.get('date'), providerID: Session.get("selectedProviderId")})
	},
	// unusualDaysFormClass: function() {
		
	// 	if (unusualDays.findOne({date:Session.get('date'), providerID: Session.get("selectedProviderId")})){
	// 		return "form-inline";
	// 	} else {
	// 		return "hidden";
	// 	}
	// },
	buttonStyle: function() {
		
		if (unusualDays.findOne({date:Session.get('date'), providerID: Session.get("selectedProviderId")})){
			return "display: none;";
		}
		else {
			return "";
		}
	},
	notes: function () {
		try{
			return unusualDays.findOne({date:Session.get('date'), providerID: Session.get("selectedProviderId")}).notes
		} catch(e) {/*fails when there is no unusualDay for today.*/}
	}
});


/*
	                                           /$$             
	                                          | $$             
	  /$$$$$$  /$$    /$$ /$$$$$$  /$$$$$$$  /$$$$$$   /$$$$$$$
	 /$$__  $$|  $$  /$$//$$__  $$| $$__  $$|_  $$_/  /$$_____/
	| $$$$$$$$ \  $$/$$/| $$$$$$$$| $$  \ $$  | $$   |  $$$$$$ 
	| $$_____/  \  $$$/ | $$_____/| $$  | $$  | $$ /$$\____  $$
	|  $$$$$$$   \  $/  |  $$$$$$$| $$  | $$  |  $$$$//$$$$$$$/
	 \_______/    \_/    \_______/|__/  |__/   \___/ |_______/ 
	                                                           
	                                                           
	                                                           
*/                                    
Template.bookingTable.events({
	'click .providerTab': function(event) {
		Session.set("selectedProviderId", $(event.currentTarget).data("id"));
	},
	'dblclick .appointmentItem': function(event) {
		event.stopImmediatePropagation();
		Router.go('editAppointment', {id: $(event.currentTarget).data("id")});
		// Session.set("currentlyEditingDoc", );
	},
	'click #customTimesButton': function(event) {
		var provObject = providers.findOne(Session.get("selectedProviderId"))
		unusualDays.insert({date: Session.get('date'), providerID: Session.get("selectedProviderId"), startTime: provObject.startTime, endTime: provObject.endTime, appointmentLength: provObject.appointmentLength});
	},
	'click #deleteCustomTimes': function(event) {
		unusualDays.remove(unusualDays.findOne({date:Session.get('date'), providerID: Session.get("selectedProviderId")})._id);
	},
	'dblclick .rowContent': function(event) {
		// if (Router.current().route.name === "newAppointment" || 
		// 	Router.current().route.name === "bookingTable") {
		Router.go("newAppointment", {time: event.currentTarget.previousElementSibling.innerHTML});
		// };
	}
})
// 	                                     /$$                                     /$$
// 	                                    | $$                                    | $$
// 	  /$$$$$$   /$$$$$$  /$$$$$$$   /$$$$$$$  /$$$$$$   /$$$$$$   /$$$$$$   /$$$$$$$
// 	 /$$__  $$ /$$__  $$| $$__  $$ /$$__  $$ /$$__  $$ /$$__  $$ /$$__  $$ /$$__  $$
// 	| $$  \__/| $$$$$$$$| $$  \ $$| $$  | $$| $$$$$$$$| $$  \__/| $$$$$$$$| $$  | $$
// 	| $$      | $$_____/| $$  | $$| $$  | $$| $$_____/| $$      | $$_____/| $$  | $$
// 	| $$      |  $$$$$$$| $$  | $$|  $$$$$$$|  $$$$$$$| $$      |  $$$$$$$|  $$$$$$$
// 	|__/       \_______/|__/  |__/ \_______/ \_______/|__/       \_______/ \_______/
// 	                                                                                
// 	                                                                                
// 	                                                                                
Template.bookingTable.rendered = function() {
	// if (Roles.userIsInRole(Meteor.userId(), "provider")) {
	// 	console.log("user is provider, setting selected provider id");
	// 	Session.set("selectedProviderId", Meteor.user().providerID);
	// }
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

