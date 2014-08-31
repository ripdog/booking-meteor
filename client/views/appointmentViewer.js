Template.bookinglist.helpers({
	width: "700px"
});
Template.bookinglist.height = function() {return Session.get("height");}
Template.bookinglist.rendered = render;
// Template.bookinglist.autorun = render;
// console.log("Starting query build.")
// var theDate = Session.get("date");
// console.log(theDate);
// startDate = moment(theDate).startOf("day").toDate();
// console.log(startDate);
// endDate = moment(theDate).endOf("day").toDate();
// console.log(endDate);
// queryPointer = collections.apptList.find({date: {$gte: startDate, $lt: endDate}})
// console.log(queryPointer.fetch());
// moment();
//appointmentList.find({date: Session.get("date")})
function render(comp){
// 	Session.set("height", 1200);
	///////////////////////////////////////////////
	///////////QUERY THE DATA
	///////////////////////////////////////////////
	///////////////////////////////////////////////
	///////////RENDER
	///////////////////////////////////////////////
	Session.get("height");
	this.autorun = Deps.autorun(function() {
		var pxPerMinute = Math.ceil(Session.get("height")/((Session.get("endTime").getHours() -
						Session.get("startTime").getHours())*60));//Basis of our pixel counting.
		console.log("Px Per Minute: " + pxPerMinute);
		canvas = document.getElementById('bookinglistcanvas');
		var ctx = canvas.getContext('2d');
		var lineCounter = (pxPerMinute * Session.get("appntlength"));
		var textCounter = moment(Session.get("startTime"));
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
