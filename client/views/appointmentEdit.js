// Template.appointmentEditModal.helpers({
// 	currentAppoint: Session.get("currentAppointment") || {}
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