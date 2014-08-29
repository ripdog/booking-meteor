Meteor.startup(function() {
// 	AutoForm.debug();
	Session.setDefault("height", 900);
	Session.setDefault("appntlength", 15);//in minutes
	Session.setDefault("date", new Date());
	var currentDate = Session.get("date")
	Session.setDefault("startTime", new Date(currentDate.getFullYear(), currentDate.getMonth(),
											 currentDate.getDay(), 8, 0, 0));//0800
	Session.setDefault("endTime", new Date(currentDate.getFullYear(), currentDate.getMonth(),
										   currentDate.getDay(), 17, 0, 0));//1700

}
);
function Appointment (type) {
	//firstName, lastName, date, starttime, length
	this.type = type;
	this.firstName = "firstName";
	this.lastName = "lastName";
	this.date = new Date();
	this.starttime =  new Date();
	this.length =  15;
	this._id = new Meteor.Collection.ObjectID();
}
appointmentList = new Meteor.Collection("appointmentList");
appointmentList.attachSchema(new SimpleSchema({
	firstname: {
		type: String,
		label: "First Name",
		max: 100
	},
	lastname: {
		type: String,
		label: "Last Name",
		max: 100
	},
	notes: {
		type: String,
		label: "Notes",
		optional: true
	},
	date: {
		type: Date,
		label: "Date & Time"
	},
	length: {
		type: Number,
		defaultValue: Session.get("defaultAppointmentLength")
	}
}));
classes = {appointment: Appointment};
collections = {apptList: appointmentList}