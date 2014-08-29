// Template.appointmentEditModal.helpers({
// // 	currentAppoint: Session.get("currentAppointment") || {},
// 	aappointmentList: collections.apptList
// })
// Template.appointmentEditModal.events({
// 	'click #saveAppointChanges': function() {
// 		console.log("Submitting patient info");
// 		appnt = Session.get("currentAppointment");
// 		appnt.firstName = $('#firstnameinput').val();
// 		appnt.lastName = $('#lastnameinput').val();
// 		console.log()
// 		console.log(appointmentList.upsert(appnt._id._str, appnt));
// 	}
// })

Template.insertAppointmentForm.helpers({
	appointmentList: collections.apptList,
	minDate: Session.get("startTime"),
	maxDate: Session.get("endTime")
})