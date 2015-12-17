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
	});
	//self = this;
	Tracker.autorun(function(comp) {
		try{
			if (Session.get("newTime") &&
				(Router.current().route.getName() === "newAppointment" ||
				Router.current().route.getName() === "newBlockout")) {
				self.$('#datetimepicker').data("DateTimePicker").date(moment(Session.get("newTime"), "h:mm A"))
			}
		}
		catch (e) {
			comp.invalidated = true;
			comp.stopped = false;
		}
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
	valueIn: function(val) {
		try {

			$('#datetimepicker').data("DateTimePicker").date(val);
			console.log("managed to set timePicker time from ValueIn, "+ val)
		} catch(e) {
			console.log("failed to set timePicker time from ValueIn")
		}
		return val;
	},
	valueOut: function() {
		try {
			return $('#datetimepicker').data("DateTimePicker").date().toDate();
		} catch (e) {

		}
	}
});