Router.configure({
  layoutTemplate: 'masterLayout',
  notFoundTemplate: 'notFound',
  loadingTemplate: 'loading'
});

Router.map(function() {
	this.route('bookingTable', {//Split up the bookingTable so that the appointment
      //items always render after the table itself. Also allow cleanup so less
      //stuff disappears when changing date. Add date to url.
		path: '/',
		waitOn: function() {
			Session.setDefault("date", moment().startOf("day").toDate());
			return [Meteor.subscribe('appointmentList', Session.get('date'), Session.get("selectedProviderId")),
         Meteor.subscribe("unusualDays", Session.get("date")), Meteor.subscribe('providerNames')];
		},
		onBeforeAction: function () {
			// Session.setDefault("startTime", 8);
			// Session.setDefault("endTime", 17);
// 			var thedate = moment().startOf("day").toDate();
//			Session.setDefault("appntlength", 15);//in minutes
// 			Session.setDefault("formForInsert", true);//insert
		},
      action: function() {
         if(this.ready()) {
            this.render();
         }
      },
		onAfterAction: function () {

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
