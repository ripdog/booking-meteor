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
		while(dateTarget.diff(dateCounter) > 0)
		{
			ret.push({time: dateCounter.format("h:mm A")});
			dateCounter.add(provObject.appointmentLength, "minutes");
		}
		ret.push({time: dateCounter.format("h:mm A")});
		Session.set("maxNumOfAppointments", ret.length);
		return ret;
	},
	appointments: function() {
		var theDate = Session.get("date");
		startDate = moment(theDate).startOf("day").toDate();
		endDate = moment(theDate).endOf("day").toDate();
		// console.log(JSON.stringify({date: {$gte: startDate, $lt: endDate}}));
		queryPointer = appointmentList.find({date: {$gte: startDate, $lt: endDate}})
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
	unusualDaysFormClass: function() {
		
		if (unusualDays.findOne({date:Session.get('date'), providerID: Session.get("selectedProviderId")})){
			return "form-inline";
		} else {
			return "hidden";
		}
	},
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
		Router.go("newAppointment", {time: event.currentTarget.previousElementSibling.innerHTML});
	}
})

Template.bookingTable.rendered = function() {
	// if (Roles.userIsInRole(Meteor.userId(), "provider")) {
	// 	console.log("user is provider, setting selected provider id");
	// 	Session.set("selectedProviderId", Meteor.user().providerID);
	// }
	console.log("rerendering");
	rerenderDep.changed();
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
				console.log("highlighting " + this.time);
				return "bg-success";
			}
		}
		
	}
})

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
// 		console.log("rendering this obj: ");
// 		console.log(this);
		rerenderDep.depend();

		if ($(".timeRow").length === 0) {
			console.log("rendering too early, hold off.");
			return 0;
		}
		var provObject = unusualDays.findOne({date: Session.get("date"), providerID: Session.get("selectedProviderId")})
		if (!provObject) {
			provObject = providers.findOne(Session.get("selectedProviderId"))
		}
		// console.log(provObject);
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
			if (untouchedAppntsFromTop > Session.get("maxNumOfAppointments") ||
			 	untouchedAppntsFromTop < 0) {
				//Protect against exceptions when system tries to render appointments
				//on wrong days.
				return 0;
			}
			var appntsFromTop = Math.floor(untouchedAppntsFromTop);
  	 		// console.log(this.date + " is  " + untouchedAppntsFromTop + " appoints from the top.");
			try {
				var pixelsFromTop = $(".timeRow:nth-child("+appntsFromTop+")")[0].offsetTop
			}
			catch (exc) {
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
			return pixelsFromTop + "px";
		}
	},
	itemHighlightClass: function() {
		// console.log(this);
	}
});

Template.appointmentItem.rendered = function(asd) {

}


//  	console.log("AppointmentItem Rendered!");
// // 	this.$(this.firstNode).css("left", );
// // 	this.$(this.firstNode).css("height", );
// // 	this.$(this.firstNode).css("width", );
// 	// 		var data = UI._templateInstance()
// 	///////////////////////////////////
//  	var numFromTop = (moment(this.date).unix() -
//  					  moment(Session.get("date")).hours(Session.get("startTime")).unix())/60;
//  	console.log(numFromTop);
//  	if(numFromTop/Session.get("appntlength") === 0){
//  		return $("thead th").css("height")
//  	}
//  	else
//  	{
//  		var untouchedAppntsFromTop = (numFromTop/Session.get("appntlength"))+1;

//  		var appntsFromTop = Math.floor(untouchedAppntsFromTop);
//  		console.log(this.data.date + " is  " + untouchedAppntsFromTop + " appoints from the top.");
//  		var pixelsFromTop = $(".timeRow:nth-child("+appntsFromTop+")").position().top
//  		if (untouchedAppntsFromTop % 1 !== 0){
//  			console.log(untouchedAppntsFromTop % 1);
//  			//if the appnt doesn't align with standard boundries - i.e, 15 mins
//  			var extraPixels = parseInt($(".rowContent").css('height')) *
//  				(untouchedAppntsFromTop % 1);
// 			console.log("extrapixels: " + extraPixels);
//  			pixelsFromTop += extraPixels;
//  		}
//  		this.$(this.firstNode).css("top", pixelsFromTop + "px");
//  	}
// }

// Template.bookinglist.rendered = render;
// Template.bookinglist.autorun = render;

// Session.set("height", 1200);
// // moment();
// //appointmentList.find({date: Session.get("date")})

// ///////////////////////////////////////////////
// ///////////QUERY THE DATA
// ///////////////////////////////////////////////
// queryPointer.observe({
// 	added: function (doc, beforeIndex) {
// 		render();
// 	}});
// function render(comp){

// 	///////////////////////////////////////////////
// 	///////////RENDER
// 	///////////////////////////////////////////////
// 	this.autorun = Deps.autorun(function() {
// 		var pxPerMinute = Math.ceil(Session.get("height")/((Session.get("endTime") -
// 						Session.get("startTime"))*60));//Basis of our pixel counting.
// 		console.log("Px Per Minute: " + pxPerMinute);
// 		canvas = document.getElementById('bookinglistcanvas');
// 		var ctx = canvas.getContext('2d');
// 		var lineCounter = (pxPerMinute * Session.get("appntlength"));
// 		var textCounter = moment(Session.get("startTime"), "H");
// 		while (true) {//first, draw the guidelines.
// 			ctx.beginPath();
// 			ctx.moveTo(0,lineCounter);
// 			ctx.lineTo(canvas.width,lineCounter);
// 			ctx.stroke();
// 			var text = textCounter.format("HH:mm A");
// 			var textPoint = lineCounter - (pxPerMinute*Session.get("appntlength"))*0.4;
// 			ctx.fillText(text, 0, textPoint);
// 			lineCounter += (pxPerMinute * Session.get("appntlength"));
// 			textCounter = textCounter.add(Session.get("appntlength"), "minutes");
// 			if (lineCounter >= canvas.height){break;}
// 		}
// 		console.log(comp)
// 		for (var booking in queryPointer.fetch())
// 		{
// 			console.log(queryPointer.fetch()[booking]);
// 			var theObj = queryPointer.fetch()[booking]
// 			var bookingText = theObj.date;
// 			var bookingTextPoint = moment(theObj.date).unix() - moment(Session.get("date")).hours(Session.get("startTime")).unix()
// 			console.log(moment(Session.get("date")).hours(Session.get("startTime")));
// 			console.log(bookingTextPoint);
// 			bookingTextPoint /= 60  //this is the number of minutes since start of day
// 			bookingTextPoint *= pxPerMinute;
// 			ctx.fillText(bookingText, 100, bookingTextPoint);
// 		};
// 	})
// }
