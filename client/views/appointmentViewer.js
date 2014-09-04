Template.bookingTable.helpers({
	day: function() {
		var momentobj = moment(Session.get("date"));
		var ret = momentobj.format("dddd MMMM Do GGGG");
		if(momentobj.isSame(moment(), 'day')) {
				return ret + " - today.";
		}
		else {
			return ret + " - " + momentobj.fromNow();
		}
	},
	times: function(){
		Session.set("startTime", 8);
		Session.set("endTime", 17);
		if (typeof Session.get("date") === "undefined") {
			var thedate = moment().startOf("day").add(1, "hour").toDate();
			Session.set("date", thedate);
		}
		var dateCounter = moment(Session.get("date")).hours(Session.get("startTime") || 8)
		var ret = [];
		while ((dateCounter.hours() < Session.get("endTime")) || (dateCounter.minutes() === 0))
		{
			ret.push({time: dateCounter.format("h:mm A")});
			dateCounter.add(Session.get("appntlength") || 15, "minutes");
		}
		return ret;
	},
	appointments: function() {
		var theDate = Session.get("date");
		startDate = moment(theDate).startOf("day").toDate();
		endDate = moment(theDate).endOf("day").toDate();
		console.log(JSON.stringify({date: {$gte: startDate, $lt: endDate}}))
		queryPointer = appointmentList.find({date: {$gte: startDate, $lt: endDate}})
		return queryPointer;
	}
});
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
		console.log("calcing height");
		var defaultHeight = getRowHeight();
		var pxPerMinute = defaultHeight/Session.get("appntlength");
		console.log(getRowHeight());
 		console.log(pxPerMinute);
		console.log(this.length);
		console.log(pxPerMinute * this.length);
		return Math.ceil(pxPerMinute * this.length) + "px"
	},
	left: function() {
		rerenderDep.depend();
		return $(".rowHeader").css("width")
	},
	top: function() {
		rerenderDep.depend();
		var numFromTop = (moment(this.date).unix() -
			moment(Session.get("date")).hours(Session.get("startTime")).unix())/60;

		if(numFromTop/Session.get("appntlength") === 0){
			return $("thead th").css("height")
		}
		else
		{
			var untouchedAppntsFromTop = (numFromTop/Session.get("appntlength"))+1;

			var appntsFromTop = Math.floor(untouchedAppntsFromTop);
// 			console.log(this.date + " is  " + untouchedAppntsFromTop + " appoints from the top.");
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
// Template.appointmentItem.rendered = function(asd) {
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
