Template.masterLayout.events({
	'click #newAppointButton': function() {
		//console.log('button clicked!');
// 		Session.set("currentAppointment", appnt);
		//console.log(Session.get("currentAppointment"))
		AutoForm.resetForm(insertAppointmentFormInner);
		$("#appointmentEditModal").modal();
	},
	'click #nextDay': function() {
		Session.set("date", moment(Session.get("date")).add(1, 'day').toDate());
	},
	'click #prevDay': function() {
		var thedate = (moment(Session.get("date")).subtract(1, 'day').toDate())
		Session.set("date", thedate);
	},
	'click #datetimepicker1': function() {
		$('#datetimepicker1').data("DateTimePicker").show()
	}
});
Template.masterLayout.helpers({
	theDate: function() {
		if (typeof Session.get("date") === 'undefined'){
			var thedate = moment().startOf("day").toDate();
			Session.set("date", thedate);
		}
		return moment(Session.get("date")).format("YYYY-MM-DD");
	}
})
Template.masterLayout.rendered = function() {
	$('#datetimepicker1').datetimepicker({
		pickTime: false,
	})
	$('#datetimepicker1').data("DateTimePicker").format = "YYYY-MM-DD";
// 	$('#datetimepicker1').data("DateTimePicker").setDate(moment(Session.get("date")));
	Deps.autorun(function (comp) {
		console.log(comp);
		$('#datetimepicker1').data("DateTimePicker").setDate(moment(Session.get("date")));
	})
	$('#datetimepicker1').on("dp.change", function(e) {
		console.log(e);
		Session.set("date", e.date.toDate());
	})
};

