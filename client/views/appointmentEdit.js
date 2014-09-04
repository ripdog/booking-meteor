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


Template.insertAppointmentForm.helpers({
	appointmentList: appointmentList,
	currentDate: function(){
		var momentobj = moment(Session.get("date"));
		var ret = momentobj.format("dddd MMMM Do GGGG");
		return ret + " -"+ dayDelta(Session.get("date"));
	},
	sessionDate: function(){return Session.get("date")},
	length: function(){return Session.get("appntlength")},
	minDate: function() {return Session.get("startTime")},
	maxDate: function() {return Session.get("endTime")}
});
Template.insertAppointmentForm.rendered = function() {
// 	AutoForm.debug();

	//TODO: Ensure that startTime and endTime get recomputed when current date changes
	//attach them to the date var
};
AutoForm.hooks({
	insertAppointmentFormInner: {
		docToForm: function(doc){
			console.log("its docToForm tiem!!!!");
			if (doc.date instanceof Date) {
				doc.time = moment(doc.date).format("H:mm A");
			}
			return doc;
		},
		formToDoc: function(doc){
			if (typeof doc.time === "string") {
				var datestring = moment(Session.get("date")).zone(-12).format("YYYY-MM-DD ") + doc.time;
				//the time is localtime, the date is utc. Set the date to localtime, add the time
				//then convert back to utc.
				doc.date = moment(datestring, "YYYY-MM-DD HH:mm A").utc().toDate();
			}
			return doc;
		},
		after: {
			insert: function(error, result) {
				if (error) {
					console.log("Insert Error:", error);
					$("#insertSuccessAlert").alert();
				} else {
					console.log("Insert Result:", result);
				}
			}
		}
	}
});