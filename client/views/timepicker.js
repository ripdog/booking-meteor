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
	self = this;
	this.autorun(function () {
		var data = Template.currentData();
		var dtp = self.$("#datetimepicker").data("DateTimePicker");

		// set field value
		if (data.value instanceof Date) {
			dtp.date(data.value);
		} else {
			dtp.date(); // clear
		}
	});
	this.autorun(function(comp) {
		try{
			if (Session.get("newTime") && Session.get("formForInsert") &&
				(Router.current().route.getName() === "newAppointment" ||
				Router.current().route.getName() === "newBlockout")) {
				console.log("setting DateTimePicker value from newTime");
				self.$('#datetimepicker').data("DateTimePicker").date(moment(Session.get("newTime"), "h:mm A"))
			}
		}
		catch (e) {
			//comp.invalidated = true;
			//comp.stopped = false;
			console.log(e);
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
		//try {
		//	$('#datetimepicker').data("DateTimePicker").date(val);
		//	console.log("managed to set timePicker time from ValueIn, "+ val)
		//} catch(e) {
		//	console.log("failed to set timePicker time from ValueIn")
		//	console.log(e);
		//}
		return val;
	},
	valueOut: function() {
		try {
			return $('#datetimepicker').data("DateTimePicker").date().toDate();
		} catch (e) {

		}
	}
});