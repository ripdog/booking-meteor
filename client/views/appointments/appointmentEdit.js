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
	length: function() {
		var provObject = unusualDays.findOne({date: Session.get("date"), providerID: Session.get("selectedProviderId")})
		if (typeof provObject === "undefined") {
			provObject = providers.findOne(Session.get("selectedProviderId"))
		}
		try {return provObject.appointmentLength}
		catch (e) {
			console.log("looking for appointment length too early.")
			return 0;
		}//this error doesn't matter, it means the unusualDays
		// and Providers collections aren't filled yet.
		//will be fixed for real when iron router is used for appointment editing
		///creation
	},
	currentType: function() {
		if(Session.get("formForInsert")) {
			return "insert"
		}
		else {
			return "update"
		}
	},
	currentDoc: function() {return appointmentList.findOne(Session.get("currentlyEditingAppointment"))}
});
// Template.insertAppointmentForm.rendered = function() {
// 	//TODO: Ensure that startTime and endTime get recomputed when current date changes
// 	//attach them to the date var
// };
AutoForm.hooks({
	insertAppointmentFormInner: {
		docToForm: function(doc){
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
			doc.providerID = Session.get("selectedProviderId");
			console.log("logging doc")
			console.log(doc)
			return doc;
		},
		after: {
			insert: function(error, result) {//TODO: When appointment is made, use the data-id var
				//to find it in the appointment list and bounce it!
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
