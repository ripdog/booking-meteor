Template["afFormGroup_bootstraptimepicker"].helpers({
  afFieldLabelAtts: function () {
    return _.extend({template: 'bootstraptimepicker'}, this.afFieldLabelAtts);
  },
  afFieldInputAtts: function () {
    return _.extend({template: 'bootstraptimepicker'}, this.afFieldInputAtts);
  }
});

function addFormControlAtts() {
	var atts = _.clone(this.atts);
	if (typeof atts["class"] === "string") {
		atts["class"] += " form-control";
	} else {
		atts["class"] = "form-control";
	}
	return atts;
}
Template.afInput_bootstraptimepicker.atts = addFormControlAtts;

Template.afInput_bootstraptimepicker.rendered  = function() {
	$('#datetimepicker4').datetimepicker({
		pickDate: false,
		minuteStepping:5,
		defaultDate: $('#datetimepicker4 > input')[0].value
		// defaultDate: moment().startOf('day').hour(12).zone(-12)
		//TODO ^ should pick closest date to 1200 which isn't taken.
	});
}
Template.afInput_bootstraptimepicker.events = {
	'click #datetimepicker4': function (event){$('#datetimepicker4').data("DateTimePicker").show()}
}