Router.configure({
  // layoutTemplate: 'masterLayout',
  notFoundTemplate: 'notFound',
  loadingTemplate: 'loading'
});
Router.hooks.onBeforeAction = function() {
		console.log(this);
	}

Router.onBeforeAction(AccountsTemplates.ensureSignedIn, {
    except: ['login', 'atForgotPassword']
});

Router.map(function() {
	this.route('bookingTable', {//Split up the bookingTable so that the appointment
      //items always render after the table itself. Also allow cleanup so less
      //stuff disappears when changing date. Add date to url.
		path: '/',//should be /view/:prov/:date?
		layoutTemplate: "masterLayout",
		waitOn: function() {
			Session.setDefault("date", moment().startOf("day").toDate());
			return [Meteor.subscribe('appointmentList', Session.get('date'), Session.get("selectedProviderId")),
         Meteor.subscribe("unusualDays", Session.get("date")), Meteor.subscribe('providerNames')];
		},
		loadingTemplate: 'loading',
		onBeforeAction: function () {
 			Session.setDefault("formForInsert", true);//insert
		},
		action: function() {
			if(this.ready()) {
				this.render();
			}
		},
		// onAfterAction: function () {

		// }
	});
	this.route('newAppointment', {
		path: '/new/:date?',
		layoutTemplate: "masterLayout",
		template: 'sideEditWrapper',
		waitOn: function() {
			Session.setDefault("date", moment().startOf("day").toDate());
			return [Meteor.subscribe('appointmentList', Session.get('date'), Session.get("selectedProviderId")),
         Meteor.subscribe("unusualDays", Session.get("date")), Meteor.subscribe('providerNames')];
		},
		loadingTemplate: 'loading',
		onBeforeAction: function () {
			Session.set("formForInsert", true);
			Session.set("currentlyEditingAppointment", null);
			AutoForm.resetForm("insertAppointmentFormInner");
		},
		action: function() {
			if(this.ready()) {
				this.render();
			}
		},
	});
	this.route('editAppointment', {
		path: '/edit/:id',
		layoutTemplate: "masterLayout",
		template: 'sideEditWrapper',
		waitOn: function() {
			Session.setDefault("date", moment().startOf("day").toDate());
			return [Meteor.subscribe('appointmentList', Session.get('date'), Session.get("selectedProviderId")),
         Meteor.subscribe("unusualDays", Session.get("date")), Meteor.subscribe('providerNames')];
		},
		loadingTemplate: 'loading',
		onBeforeAction: function () {
			Session.set("formForInsert", false);
			Session.set("currentlyEditingAppointment", this.params.id);
			AutoForm.resetForm("insertAppointmentFormInner");
		},
		action: function() {
			if(this.ready()) {
				this.render();
			}
		},
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
	this.route('userList', {
		path: '/users',
		layoutTemplate: "masterLayout",
		waitOn: function() {
			return Meteor.subscribe("userList");
		}
	})
	this.route('registration', {
		path: '/register',
	});
	// this.route('login', {
	// 	path: '/login',
	// });
	// this.route('login', {
	// 	path: '/login',
	// });
})
