Template["afQuickField_bootstraptimepicker"].helpers({
  afFieldLabelAtts: function () {
    return _.extend({template: 'bootstrap'}, this.afFieldLabelAtts);
  },
  afFieldInputAtts: function () {
    return _.extend({template: 'bootstrap'}, this.afFieldInputAtts);
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
Template.afQuickField_bootstraptimepicker.atts = addFormControlAtts;
Template.afQuickField_bootstraptimepicker.events = {
	'click #datetimepicker4': function (event){$('#datetimepicker4').data("DateTimePicker").show()}
}
Template.afQuickField_bootstraptimepicker.rendered = function() {
	$('#datetimepicker4').datetimepicker({
		pickDate: false,
		minuteStepping:5,
		defaultDate: moment().hour(12).minute(0)
		//TODO ^ should pick closest date to 1200 which isn't taken.
	});
}