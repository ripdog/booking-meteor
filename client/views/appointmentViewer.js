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

	})
// 	console.log(comp)
// 	for (var booking in queryPointer.fetch())
// 	{
// 		console.log(booking);
// 	};
}
