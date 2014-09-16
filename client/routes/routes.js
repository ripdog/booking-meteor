var subs = new SubsManager({
	cacheLimit: 20,//number of subs to cache
	expireIn: 20//minutes to hold on to subs
})

Router.configure({
  // layoutTemplate: 'masterLayout',
  notFoundTemplate: 'notFound',
  loadingTemplate: 'loading',
});
Router.onBeforeAction(mustBeSignedIn, {except: ['login']});
function mustBeSignedIn(pause) {
	if (Meteor.loggingIn()) {
		console.log("currently logging in");
		this.render('loading');
		pause();
	} else {
		user = Meteor.user();
		if (!user) {
			console.log("need to sign in");
			Router.go('login', {redirect: this.options.path});
		}
	}
}

Router.map(function() {// Links to / should choose whether to default to today or existing date
	//based on Session.get('date')
	this.route('bookingTable', {//Split up the bookingTable so that the appointment
      //items always render after the table itself. Also allow cleanup so less
      //stuff disappears when changing date. Add date to url.
		path: '/',
		layoutTemplate: "masterLayout",
		waitOn: function() {
			Session.setDefault("date", moment().startOf("day").toDate());
			return [this.subscribe('appointmentList', Session.get('date'), Session.get("selectedProviderId")),
         this.subscribe("unusualDays", Session.get("date")), this.subscribe('providerNames')];
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
	this.route("permalink", {
		path: '/perma/:prov/:date',
		action: function() {
			Session.set("date", moment(Date(this.params.date)).startOf('day').toDate());
			Session.set("selectedProviderId", this.params.date);
			Router.go('bookingTable');
		}
	})
	this.route('newAppointment', {
		path: '/new/:time?',//TODO: Where all is this set?
		layoutTemplate: "masterLayout",
		template: 'sideEditWrapper',
		waitOn: function() {
			Session.setDefault("date", moment().startOf("day").toDate());
			return [subs.subscribe('appointmentList', Session.get('date'), Session.get("selectedProviderId")),
         subs.subscribe("unusualDays", Session.get("date")), subs.subscribe('providerNames')];
		},
		loadingTemplate: 'loading',
		onBeforeAction: function () {
			if (typeof closeTimeout !== "undefined") {//form was used, then user started another
				//appointment creation. Clean up the form.
				$('#saveAppointChanges').attr("disabled", false);
				Meteor.clearTimeout(closeTimeout);
				$('#insertSuccessAlert').hide('fast');
			}
			Session.set("formForInsert", true);
			Session.set("currentlyEditingAppointment", null);
			AutoForm.resetForm("insertAppointmentFormInner");
			if (this.params.time) {
				var momentvar = moment(this.params.time, "hh:mm A");
				//Session.set("date", momentvar.startOf('day').toDate());
				Session.set("newTime", momentvar.format("h:mm A"));
			}
			
		},
		action: function() {
			if(this.ready()) {
				this.render();
			}
		},
		onAfterAction: function() {
			if (this.params.time) {
				if (this.ready()) {
					// var queryString = 'td:contains('+this.params.time+')';
					// if ($(queryString).length > 0) {
					// 	$(queryString).parent().addClass('bg-success');
					// } else {
					// 	Meteor.setTimeout(function() {
					// 		$(queryString).parent().addClass('bg-success')
					// 	}, 400);
					// }
					try {
						$('#datetimepicker4').data("DateTimePicker").setDate(this.params.time);
					} catch (e) {}
				}

				
			}
		},
		onStop: function() {
			Session.set("newTime", null);//remove Highlight
			$("div.bootstrap-datetimepicker-widget").remove();
		}
	});
	this.route('editAppointment', {
		path: '/edit/:id',
		layoutTemplate: "masterLayout",
		template: 'sideEditWrapper',//TODO: If not on correct date for appointment, change
		waitOn: function() {
			Session.setDefault("date", moment().startOf("day").toDate());
			return [subs.subscribe('appointmentList', Session.get('date'), Session.get("selectedProviderId")),
         subs.subscribe("unusualDays", Session.get("date")), subs.subscribe('providerNames')];
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
		onStop: function() {
			Session.set("formForInsert", true);
			Session.set("currentlyEditingAppointment", null);
			$("div.bootstrap-datetimepicker-widget").remove();
		}
	});
	this.route('providerList', {
		path: '/providers',
		layoutTemplate: "masterLayout",
		loginRequired: 'login',
		waitOn: function() {
			return Meteor.subscribe('providerSubscription');
		},
	});
	this.route('userList', {
		path: '/users',
		layoutTemplate: "masterLayout",
		waitOn: function() {
			return [Meteor.subscribe("userList"), Meteor.subscribe('providerSubscription')];
		}
	})
	// this.route('registration', {
	// 	path: '/register',
	// });
	this.route('login', {
		path: '/login/:redirect(*)?',
		onBeforeAction: function() {
			if(this.params.redirect) {
				Session.set('loginRedirect', this.params.redirect);
			}
		}
	});
})
