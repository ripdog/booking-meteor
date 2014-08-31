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
											 currentDate.getDay(), 8, 0, 0));//0800
	Session.set("endTime", new Date(currentDate.getFullYear(), currentDate.getMonth(),
										   currentDate.getDay(), 17, 0, 0));//1700
	Session.setDefault("appntlength", 15);//in minutes
	//TODO: Ensure that startTime and endTime get recomputed when current date changes
	//attach them to the date var
};
AutoForm.hooks({
	insertAppointmentFormInner: {
		docToForm: function(doc){
			console.log("its docToForm tiem!!!!");
			console.log(doc);
			if (doc.date instanceof Date) {
				//Session.set("editingDate", doc.date);//is this client code?
				doc.time = moment(doc.date).format("H:mm A");
			}
			console.log(doc);
			return doc;
		},
		formToDoc: function(doc){
			console.log("It's formToDoc!")
			console.log(doc)
			if (typeof doc.time === "string") {
				var datestring = moment(doc.date).format("YYYY-MM-DD ") + doc.time;
				console.log(datestring)
				doc.date = moment(datestring, "YYYY-MM-DD HH:mm A").toDate();
			}
			console.log(doc)
			return doc;
		},
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