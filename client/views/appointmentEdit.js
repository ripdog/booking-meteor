Template.insertAppointmentForm.helpers({
	appointmentList: collections.apptList,
	currentDate: function(){
		var momentobj = moment(Session.get("date"));
		var ret = momentobj.format("dddd MMM Do GGGG");
		if(momentobj.isSame(moment(), 'day')) {
				return ret + " - today.";
		}
		else
			{
				return ret + " - " + momentobj.fromNow();
			}
	},
	sessionDate: function(){return Session.get("date")},
	length: function(){return Session.get("appntlength")},
	minDate: Session.get("startTime"),
	maxDate: Session.get("endTime")
})
Template.insertAppointmentForm.rendered = function() {
	AutoForm.debug();//TODO: Combine Date and Time.
	var thedate = moment().startOf("day").add(1, "hour").toDate();
	Session.set("date", thedate);
	var currentDate = Session.get("date")
	Session.set("startTime", new Date(currentDate.getFullYear(), currentDate.getMonth(),
											 currentDate.getDay(), 7, 0, 0));//0800
	Session.set("endTime", new Date(currentDate.getFullYear(), currentDate.getMonth(),
										   currentDate.getDay(), 16, 0, 0));//1700
	Session.setDefault("appntlength", 15);//in minutes
	//TODO: Ensure that startTime and endTime get recomputed when current date changes
	//attach them to the date var
};
AutoForm.hooks({
	insertAppointmentFormInner: {
// 		docToForm: function(doc){
// 			console.log("its docToForm tiem!!!!");
// 			console.log(doc);
// 			if (doc.time._dateobj) {
// 				console.log("doc.time instanceof Time == True");
// 				doc.time = moment(doc.time._dateobj).format("hh:mm a");
// 			}
// 			console.log(doc);
// 			return doc;
// 		},
// 		formToDoc: function(doc){
// 			console.log("It's formToDoc!")
// 			console.log(doc)
// 			if (typeof doc.time === "string") {
// 				doc.time = new Time(doc.time);
// 			}
// 			console.log(doc)
// 			return doc;
// 		},
		after: {
			insert: function(error, result) {
				if (error) {
					console.log("Insert Error:", error);
				} else {
					console.log("Insert Result:", result);
				}
			}
		}
	}
});