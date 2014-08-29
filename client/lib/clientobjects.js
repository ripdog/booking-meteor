Meteor.startup(function() {
	AutoForm.debug();
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