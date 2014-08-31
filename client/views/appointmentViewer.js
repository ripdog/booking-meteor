Template.bookinglist.width = function() {return "700px";};
Template.bookinglist.height = function() {return Session.get("height");}
Template.bookinglist.rendered = render;
Template.bookinglist.autorun = render;

Session.set("height", 1200);
// moment();
//appointmentList.find({date: Session.get("date")})
function render(comp){
	///////////////////////////////////////////////
	///////////QUERY THE DATA
	///////////////////////////////////////////////
	console.log("Starting query build.")
	var theDate = Session.get("date");
	console.log(theDate);
	startDate = moment(theDate).zone(-12).startOf("day")._d;
	console.log(startDate);
	endDate = moment(theDate).zone(-12).endOf("day")._d;
	console.log(endDate);
	console.log(JSON.stringify({date: {$gte: startDate, $lt: endDate}}))
	queryPointer = appointmentList.find({date: {$gte: startDate, $lt: endDate}})
	console.log(queryPointer.fetch());
	///////////////////////////////////////////////
	///////////RENDER
	///////////////////////////////////////////////
	this.autorun = Deps.autorun(function() {
		var pxPerMinute = Math.ceil(Session.get("height")/((Session.get("endTime") -
						Session.get("startTime"))*60));//Basis of our pixel counting.
		console.log("Px Per Minute: " + pxPerMinute);
		canvas = document.getElementById('bookinglistcanvas');
		var ctx = canvas.getContext('2d');
		var lineCounter = (pxPerMinute * Session.get("appntlength"));
		var textCounter = moment(Session.get("startTime"), "H");
		while (true) {//first, draw the guidelines.
			ctx.beginPath();
			ctx.moveTo(0,lineCounter);
			ctx.lineTo(canvas.width,lineCounter);
			ctx.stroke();
			var text = textCounter.format("HH:mm A");
			var textPoint = lineCounter - (pxPerMinute*Session.get("appntlength"))*0.4;
			ctx.fillText(text, 0, textPoint);
			lineCounter += (pxPerMinute * Session.get("appntlength"));
			textCounter = textCounter.add(Session.get("appntlength"), "minutes");
			if (lineCounter >= canvas.height){break;}
		}
	})
// 	console.log(comp)
// 	for (var booking in queryPointer.fetch())
// 	{
// 		console.log(booking);
// 	};
}
