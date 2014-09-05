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
		var ret = momentobj.format("dddd MMMM Do GGGG");
		return ret + " -"+ dayDelta(Session.get("date"));
	},
	times: function(){
		var dateCounter = moment().startOf('day').hours(Session.get("startTime") || 8)
		var ret = [];
		while ((dateCounter.hours() < Session.get("endTime")) || (dateCounter.minutes() === 0))
		{
			ret.push({time: dateCounter.format("h:mm A")});
			dateCounter.add(Session.get("appntlength") || 15, "minutes");
		}
		Session.set("maxNumOfAppointments", ret.length);
		return ret;
	},
	appointments: function() {
		var theDate = Session.get("date");
		startDate = moment(theDate).startOf("day").toDate();
		endDate = moment(theDate).endOf("day").toDate();
// 		console.log(JSON.stringify({date: {$gte: startDate, $lt: endDate}}))
		queryPointer = appointmentList.find({date: {$gte: startDate, $lt: endDate}})
		return queryPointer;
	},
	providerNames: function() {
		return providers.find({}, {fields: {name: 1}})
	},
	selected: function() {
		if(Session.get("selectedProviderId") === this._id) {
			return "active";
		}
	}
});
Template.bookingTable.events({
	'click .providerTab': function(event) {
		Session.set("selectedProviderId", $(event.target).data("id"));
	},
	'dblclick .appointmentItem': function(event) {
		Session.set("formForInsert", false);//edit mode
		Session.set("currentlyEditingAppointment", $(event.target).data("id"));
		AutoForm.resetForm(insertAppointmentFormInner);
		$("#appointmentEditModal").modal();
	}
})

Tracker.autorun(function() {
	if (typeof Session.get("selectedProviderId") === "undefined") {
		try {
			Session.setDefault("selectedProviderId", providers.findOne()._id);
		}
		catch (e) {}
	}
})

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
		rerenderDep.depend();
		return $(".rowContent").css("width");
	},
	height: function() {
		rerenderDep.depend();
		if (this.length == Session.get("appntlength"))
		{
			return getRowHeight() +"px";
		}
// 		console.log("calcing height");
		var defaultHeight = getRowHeight();
		var pxPerMinute = defaultHeight/Session.get("appntlength");
// 		console.log(getRowHeight());
//  		console.log(pxPerMinute);
// 		console.log(this.length);
// 		console.log(pxPerMinute * this.length);
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
		var numFromTop = (moment(this.date).unix() -
						  moment(getDate()).hours(Session.get("startTime")).unix())/60;

		//getDate is used to avoid a dependence upon the date var. Don't want to attempt
		//to rerender this template when it no longer exists.
		if(numFromTop/Session.get("appntlength") === 0){
			return $("thead th").css("height")
		}
		else
		{
			var untouchedAppntsFromTop = (numFromTop/Session.get("appntlength"))+1;
			if (untouchedAppntsFromTop > Session.get("maxNumOfAppointments") ||
			 	untouchedAppntsFromTop < 0) {
				//Protect against exceptions when system tries to render appointments
				//on wrong days.
				return 0;
			}
			var appntsFromTop = Math.floor(untouchedAppntsFromTop);
//  			console.log(this.date + " is  " + untouchedAppntsFromTop + " appoints from the top.");
			var pixelsFromTop = $(".timeRow:nth-child("+appntsFromTop+")").position().top
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
