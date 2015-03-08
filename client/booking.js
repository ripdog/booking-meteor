Template.navbar.events({
	'click #nextDay': function() {
		changeParams(moment(Session.get("date")).add(1, 'day').toDate(), null);
	},
	'click #prevDay': function() {
		changeParams(moment(Session.get("date")).subtract(1, 'day').toDate(), null);
	},
	'click #datetimepicker1': function() {
		$('#datetimepicker1').data("DateTimePicker").show()
	},
	'click #newAppointButton': function() {
		newAppointment('12:00 PM')
	}
});
Template.navbar.helpers({
	theDate: function() {
		// if (typeof Session.get("date") === 'undefined'){
		// 	var thedate = moment().startOf("day").toDate();
		// 	Session.set("date", thedate);
		// }
		return moment(Session.get("date")).format("YYYY-MM-DD");
	},
	loggedIn: function() {
		return Meteor.userId();
	},
	newBlockLink: function() {
		return "/newBlockout/" + "12-00-PM";
	},
	homeLinkDate: function() {
		//return moment(Session.get('date')).format('YYYY-MM-DD');
		return moment().format('YYYY-MM-DD');
	},
	homeLinkProv: function() {
		return Session.get('selectedProviderName');
	}
});
Template.navbar.rendered = function() {
	if($("#datetimepicker1").length != 0) {
		$('#datetimepicker1').datetimepicker({
			pickTime: false,
		});
		$('#datetimepicker1').data("DateTimePicker").format = "YYYY-MM-DD";
// 	$('#datetimepicker1').data("DateTimePicker").setDate(moment(Session.get("date")));
		Deps.autorun(function (comp) {
			$('#datetimepicker1').data("DateTimePicker").setDate(moment(Session.get("date")));
		})
		$('#datetimepicker1').on("dp.change", function(e) {
			changeParams(e.date.toDate(), null);
		})
	}
};

