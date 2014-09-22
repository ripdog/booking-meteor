function dayDelta(date) {
	var diff = moment(date).diff(moment().startOf('day'), "days");
	if (diff===1){
		return " tomorrow";
	}
	else if (diff===-1) {
		return " yesterday";
	}
	else if (diff === 0)
	{
		return " today"
	}
	else if (diff > 1)
	{
		return " in " +Math.abs(diff)+ " days"
	}
	else
	{
		return " "+Math.abs(diff)+" days ago"
	}
}


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
		var provObject = unusualDays.findOne({date: Session.get("date"), providerID: Session.get("selectedProviderId")})
		if (!provObject) {
			provObject = providers.findOne(Session.get("selectedProviderId"))
		}
		// console.log(provObject);
		var dateCounter = moment().startOf('day').hours(provObject.startTime)
		var dateTarget = moment().startOf('day').hours(provObject.endTime)
		var ret = [];
		var theTime;
		while(dateTarget.diff(dateCounter) > 0)
		{
			theTime = dateCounter.format("h:mm A");
			ret.push({time: dateCounter.format("h:mm A"), rowTimeId:theTime});
			dateCounter.add(provObject.appointmentLength, "minutes");
		}
		var finalTime = dateCounter.format("h:mm A")
		console.log(JSON.stringify({time: finalTime}));
		ret.push({time: finalTime, rowTimeId:finalTime});
		console.log("times has finished. Rerendering.");
		// rerenderDep.changed()
		return ret;
	},
	appointments: function() {
		var theDate = Session.get("date");
		startDate = moment(theDate).startOf("day").toDate();
		endDate = moment(theDate).endOf("day").toDate();
		// console.log(JSON.stringify({date: {$gte: startDate, $lt: endDate}}));
		queryPointer = appointmentList.find({date: {$gte: startDate, $lt: endDate}, providerID: Session.get("selectedProviderId")})
		// queryPointer = appointmentList.find()
		
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
		} catch(e) {}
	}
});
Template.bookingTable.events({
	'click .providerTab': function(event) {
		Session.set("selectedProviderId", $(event.currentTarget).data("id"));
	},
	'dblclick .appointmentItem': function(event) {
		event.stopImmediatePropagation();
		Router.go('editAppointment', {id: $(event.currentTarget).data("id")});
		// Session.set("currentlyEditingAppointment", );
	},
	'click #customTimesButton': function(event) {
		var provObject = providers.findOne(Session.get("selectedProviderId"))
		unusualDays.insert({date: Session.get('date'), providerID: Session.get("selectedProviderId"), startTime: provObject.startTime, endTime: provObject.endTime, appointmentLength: provObject.appointmentLength});
	},
	'click #deleteCustomTimes': function(event) {
		unusualDays.remove(unusualDays.findOne({date:Session.get('date'), providerID: Session.get("selectedProviderId")})._id);
	},
	'dblclick .rowContent': function(event) {
		if (Router.current().route.name === "newAppointment" || 
			Router.current().route.name === "bookingTable") {
			Router.go("newAppointment", {time: event.currentTarget.previousElementSibling.innerHTML});
		};
	}
})

Template.bookingTable.rendered = function() {
	// if (Roles.userIsInRole(Meteor.userId(), "provider")) {
	// 	console.log("user is provider, setting selected provider id");
	// 	Session.set("selectedProviderId", Meteor.user().providerID);
	// }
	console.log("rerendering");
	rerenderDep.changed();
	Tracker.autorun(function(asd) {
		// /appointToScrollTo
		// var pos = $('div[data-id="'+Session.get("currentlyEditingAppointment")+'"]')[0].offsetTop
		var pos = Session.get("scrollToPoint");
		if (pos === null) {return;}
		console.log("Scrolling to :");
		console.log(pos);
		$("#bookingTableWrapper").animate({
			scrollTop: pos,
			scrollLeft: 0
		});
		Tracker.nonreactive(function() {
			Session.set("scrollToPoint", null);
		})
		
	})
}



function getRowHeight() {
	var ret = parseInt($(".timeRow").css("height"));
	if (ret === 38) {//OH GOD DIRTY HACK
	//Firefox overreports the height of rows by 1px. Wat?
		return ret-1;
	}
	else {
		return ret;
	}
}
function getDate(){
	return Session.get("date");
}

Template.timeRow.helpers({
	rowHighlightClass: function() {
		if (Session.get("newTime") !== "undefined" && Session.get("formForInsert") == true) {
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

rerenderDep = new Deps.Dependency()
Template.appointmentItem.helpers({
	appointmentName: function () {
		return this.firstname + " " + this.lastname;
	},
	appointmentTime: function() {
		return this.time;
	},
	appointmentPhone: function() {
		return this.phone;
	},
	appointmentLength: function() {
		return this.length;
	},
	inbetween: function() {
		//WARNING DIRTY HACK
		//WILL FAIL IF DEFAULT APPNT LENGTH CHANGED
		//TODO: Calculate if the height of 3 internal data blocks
		//will fit inside the container - 10px for padding or so
		//dont forget to depend on rerenderDep!
		if (this.length >= 45) {
			return '<br/>'
		}
		else {
			return " - "
		}
	},
	width: function() {
		// rerenderDep.depend();
		// return $(".rowContent").css("width");
		return "auto";
	},
	height: function() {
		rerenderDep.depend();
		if (this.length == Session.get("appntlength"))
		{
			return getRowHeight() +"px";
		}
		var provObject = unusualDays.findOne({date: Session.get("date"), providerID: Session.get("selectedProviderId")})
		if (!provObject) {
			provObject = providers.findOne(Session.get("selectedProviderId"))
		}
		var defaultHeight = getRowHeight();
		var pxPerMinute = defaultHeight/provObject.appointmentLength;
		return Math.ceil(pxPerMinute * this.length) + "px"
	},
	left: function() {
		rerenderDep.depend();
		return $(".rowHeader").css("width")
	},
	top: function() {
		// rerenderDep.depend();

		// if ($(".timeRow").length === 0) {
		// 	console.log("rendering too early, hold off.");
		// 	return 0;
		// }
		// // console.log(moment(this.date).format("h:mm A"))
		// console.log('.rowContent[id="'+moment(this.date).format("h:mm A")+'"]');
		// var header = $('.rowContent[id="'+moment(this.date).format("h:mm A")+'"]')[0].offsetTop;
		// // console.log(header);
		// return header + "px";
		var provObject = unusualDays.findOne({date: Session.get("date"), providerID: Session.get("selectedProviderId")})
		if (!provObject) {
			provObject = providers.findOne(Session.get("selectedProviderId"))
		}
		var numFromTop = (moment(this.date).unix() -
					  moment(getDate()).hours(provObject.startTime).unix())/60;

		//getDate is used to avoid a dependence upon the date var. Don't want to attempt
		//to rerender this template when it no longer exists.
		if(numFromTop/provObject.appointmentLength === 0){
			return $("thead th").css("height")
		}
		else
		{
			var untouchedAppntsFromTop = (numFromTop/provObject.appointmentLength)+1;
			if (untouchedAppntsFromTop > $(".timeRow").length+1 ||
			 	untouchedAppntsFromTop < 0) {
				//Protect against exceptions when system tries to render appointments
				//on wrong days.
				console.log(untouchedAppntsFromTop);
				console.log("appointment item out of bounds, return 0 for top")
				return 0;
			}
			var appntsFromTop = Math.floor(untouchedAppntsFromTop);
  	 		// console.log(this.date + " is  " + untouchedAppntsFromTop + " appoints from the top.");
			try {
				var pixelsFromTop = $(".timeRow:nth-child("+appntsFromTop+")")[0].offsetTop
			}
			catch (exc) {
				console.log(appntsFromTop);
				console.log("exception caught, rendering too early, hold off.");
				rerenderDep.changed();
			}
			// console.log("PixelsFromTop: "+pixelsFromTop);
			if (untouchedAppntsFromTop % 1 !== 0){
// 				console.log(untouchedAppntsFromTop % 1);
				//if the appnt doesn't align with standard boundries - i.e, 15 mins
				var extraPixels = getRowHeight() *
					(untouchedAppntsFromTop % 1);
// 				console.log(extraPixels);
				pixelsFromTop += extraPixels;
			}
			console.log("Editing: "+Session.get("currentlyEditingAppointment"))
			if(Session.equals("currentlyEditingAppointment", this._id)) {
				console.log("This is me, setting scrollToPoint");
				Session.set("scrollToPoint", pixelsFromTop);
			}
			return pixelsFromTop + "px";
		}
	},
	itemHighlightClass: function() {
		// console.log(this);
		if(typeof Session.get('currentlyEditingAppointment') !== "undefined" 
			&& Session.get("currentlyEditingAppointment") === this._id) {

			return "being-edited";
		}
	}
});

