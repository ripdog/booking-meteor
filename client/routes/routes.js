Router.configure({
  layoutTemplate: 'layout',
  notFoundTemplate: 'notFound',
  loadingTemplate: 'loading'
});

Router.map(function() {
	this.route('bookingTable', {
		path: '/',
		layoutTemplate: "masterLayout",
		waitOn: function() {
			Session.setDefault("date", moment().startOf("day").toDate());
			return [Meteor.subscribe('appointmentList', Session.get('date'), Session.get("selectedProviderId")), Meteor.subscribe('providerNames')];
		},
		onBeforeAction: function () {
			Session.setDefault("startTime", 8);
			Session.setDefault("endTime", 17);
// 			var thedate = moment().startOf("day").toDate();
			Session.setDefault("appntlength", 15);//in minutes
// 			Session.setDefault("formForInsert", true);//insert
		},
		onAfterAction: function () {
			rerenderDep.changed();
		}
	});
	this.route('providerList', {
		path: '/providers',
		layoutTemplate: "masterLayout",
		waitOn: function() {
			return Meteor.subscribe('providerSubscription');
		},
		onBeforeAction: function() {
// 			try {
// 			}
// 			catch(err){
// 				console.log(err);
// 			}
		}
	});
})