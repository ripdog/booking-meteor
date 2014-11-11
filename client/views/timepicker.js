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
	$('#datetimepicker4').datetimepicker({
		pickDate: false,
		minuteStepping:5,
		defaultDate: $('#datetimepicker4 > input')[0].value
		// defaultDate: moment().startOf('day').hour(12).tz("Pacific/Auckland")
		//TODO ^ should pick closest date to 1200 which isn't taken.
	});
};
Template.afInputTimePicker.events = {
	'click #datetimepicker4': function (event){$('#datetimepicker4').data("DateTimePicker").show()}
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