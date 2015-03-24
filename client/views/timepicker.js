//Template["afInputTimePicker"].helpers({
//});

function addFormControlAtts() {
	var atts = _.clone(this.atts);
	if (typeof atts["class"] === "string") {
		atts["class"] += " form-control";
	} else {
		atts["class"] = "form-control";
	}
	return atts;
}
Template.afInputTimePicker.atts = addFormControlAtts;

Template.afInputTimePicker.rendered  = function() {

	this.$('#datetimepicker').datetimepicker({
		format: "h:mm A",
		stepping:5
		//defaultDate: function() {
		//	if (Session.get("newTime") instanceof Date) {
		//		return moment(Session.get("newTime"))
		//	} else {
		//		return moment().startOf('day').hour(12).tz("Pacific/Auckland")
		//	}
		//}
		//defaultDate: moment($('#datetimepicker > input').value, "h:mm A").tz("Pacific/Auckland").toDate()
		//defaultDate: moment().startOf('day').hour(12).tz("Pacific/Auckland")
	});
	self = this;
	Tracker.autorun(function() {
		try{
			if (Session.get("newTime") &&
				(Router.current().route.getName() === "newAppointment" ||
				Router.current().route.getName() === "newBlockout")) {
				self.$('#datetimepicker').data("DateTimePicker").date(moment(Session.get("newTime"), "h:mm A"))
			}
		}
		catch (e) {}
	})
};
Template.afInputTimePicker.events = {
	'click #datetimepicker': function (event){
		$(event.currentTarget).data("DateTimePicker").show();
	}
};
Template.afInputTimePicker.destroyed = function() {
	$("div.bootstrap-datetimepicker-widget").remove();
};
AutoForm.addInputType("timePicker", {
	template: "afInputTimePicker",
	//valueIn: function() {}
	valueOut: function() {
		return this.val()
	}
});