Template.bookinglist.helpers({
	height: Session.get("height")||"900px",
	width: "700px"
});
Template.bookinglist.rendered = render;
queryPointer = collections.apptList.find({date: Session.get("date")})
//appointmentList.find({date: Session.get("date")})
function render(){
	var pxPerMinute = Math.ceil(Session.get("height")/((Session.get("endTime").getHours() -
						Session.get("startTime").getHours())*60));//Basis of our pixel counting.
	console.log("Px Per Minute: " + pxPerMinute);
	canvas = document.getElementById('bookinglistcanvas');
	console.log(canvas)
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
	for booking in queryPointer
	{
		console.log(booking);
	};
};
