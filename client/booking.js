UI.body.events({
	'click #newAppointButton': function() {
		var appnt = new classes.appointment();
		//console.log('button clicked!');
		Session.set("currentAppointment", appnt);
		//console.log(Session.get("currentAppointment"))
		AutoForm.resetForm(insertAppointmentFormInner);
		$("#appointmentEditModal").modal();
	}
});