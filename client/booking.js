Template.navbar.events({
	'click #nextDay': function() {
		//if current route == calendar then change current month
		changeParams({date: moment(Session.get("date")).add(1, 'day').format("YYYY-MM-DD")});
	},
	'click #prevDay': function() {
		changeParams({date: moment(Session.get("date")).subtract(1, 'day').format("YYYY-MM-DD")});
	},
	'click #datetimepicker1': function() {
		$('#datetimepicker1').data("DateTimePicker").show()
	},
	'click #newAppointButton': function() {
		newAppointment('12:00 PM', false);
	},
	'click #newBlockButton': function() {
		newAppointment('12:00 PM', true);
	},
	'click #signOutButton': function() {
		Meteor.logout();
	}
});
Template.navbar.helpers({
	//theDate: function() {
	//	// if (typeof Session.get("date") === 'undefined'){
	//	// 	var thedate = moment().startOf("day").toDate();
	//	// 	Session.set("date", thedate);
	//	// }
	//	return moment(Session.get("date")).format("YYYY-MM-DD");
	//},
	loggedIn: function() {
		return Meteor.userId();
	},
	homeLinkDate: function() {
		//return moment(Session.get('date')).format('YYYY-MM-DD');
		return moment().format('YYYY-MM-DD');
	},
	homeLinkProv: function() {
		var returnitem;
		try {
			returnitem = Session.get('selectedProviderName') || providers.findOne().name;
		}catch (e){}
		return returnitem;
	}
});
Template.navbar.rendered = function() {
	if($("#datetimepicker1").length != 0) {
		$('#datetimepicker1').datetimepicker({
			format: "YYYY-MM-DD"
		});
		try {
			Deps.autorun(function (comp) {
				$('#datetimepicker1').data("DateTimePicker").date(moment(Session.get("date")));
			});
		} catch (e) {}
		$('#datetimepicker1').on("dp.change", function(e) {
			changeParams({date: e.date.format("YYYY-MM-DD")});
		})
	}
};

