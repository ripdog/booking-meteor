Template.bookinglist.helpers({
	height: function () {return Session.get("height")},
	width: "700px"
});
Template.bookinglist.rendered = render;
console.log("Starting query build.")
var theDate = Session.get("date");
console.log(theDate);
startDate = moment(theDate).startOf("day").toDate();
console.log(startDate);
endDate = moment(theDate).endOf("day").toDate();
console.log(endDate);
queryPointer = collections.apptList.find({date: {$gte: startDate, $lt: endDate}})
console.log(queryPointer.fetch());
moment();
//appointmentList.find({date: Session.get("date")})
function render(){
	///////////////////////////////////////////////
	///////////QUERY THE DATA
	///////////////////////////////////////////////
	
	///////////////////////////////////////////////
	///////////RENDER
	///////////////////////////////////////////////
	var pxPerMinute = Math.ceil(Session.get("height")/((Session.get("endTime").getHours() -
						Session.get("startTime").getHours())*60));//Basis of our pixel counting.
	console.log("Px Per Minute: " + pxPerMinute);
	canvas = document.getElementById('bookinglistcanvas');
	var ctx = canvas.getContext('2d');
	var counter = 0;
	while (true) {//first, draw the guidelines.
		counter += (pxPerMinute * Session.get("appntlength"))
		ctx.beginPath();
		ctx.moveTo(0,counter);
		ctx.lineTo(canvas.width,counter);
		ctx.stroke();
		if (counter >= canvas.height){break;}
	}
	for (var booking in queryPointer.fetch())
	{
		console.log(booking);
	};
}
