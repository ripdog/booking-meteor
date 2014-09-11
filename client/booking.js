Template.masterLayout.events({
	'click #newAppointButton': function() {
		//console.log('button clicked!');
		//console.log(Session.get("currentAppointment"))
		// 
		// 
		// 
	//	$("#appointmentEditModal").modal();
	},
	'click #nextDay': function() {
		Session.set("date", moment(Session.get("date")).add(1, 'day').toDate());
	},
	'click #prevDay': function() {
		Session.set("date", moment(Session.get("date")).subtract(1, 'day').toDate());
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
	},
	loggedIn: function() {
		return Meteor.userId();
	},
})
Template.masterLayout.rendered = function() {
	$('#datetimepicker1').datetimepicker({
		pickTime: false,
	})
	$('#datetimepicker1').data("DateTimePicker").format = "YYYY-MM-DD";
// 	$('#datetimepicker1').data("DateTimePicker").setDate(moment(Session.get("date")));
	Deps.autorun(function (comp) {
		$('#datetimepicker1').data("DateTimePicker").setDate(moment(Session.get("date")));
	})
	$('#datetimepicker1').on("dp.change", function(e) {
		Session.set("date", e.date.toDate());
	})
};

