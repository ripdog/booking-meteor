var subs = new SubsManager({
	cacheLimit: 20,//number of subs to cache
	expireIn: 20//minutes to hold on to subs
})

Router.configure({
  // layoutTemplate: 'masterLayout',
  notFoundTemplate: 'notFound',
  loadingTemplate: 'loading',
  layoutTemplate: 'singlePageMasterLayout',
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

returnStandardSubs = function() {
	Session.setDefault("date", moment().startOf("day").toDate());
	return [
		Meteor.subscribe('appointmentList', Session.get('date'), Session.get("selectedProviderId")),
		Meteor.subscribe("unusualDays", Session.get("date")),
		Meteor.subscribe('providerSubscription'),
		Meteor.subscribe('blockouts', Session.get('date'), Session.get("selectedProviderId"))
	];

}

// Links to / should choose whether to default to today or existing date
//based on Session.get('date')
Router.route('bookingTable', {//Split up the bookingTable so that the appointment
  //items always render after the table itself. Also allow cleanup so less
  //stuff disappears when changing date. Add date to url.
	path: '/',
	waitOn: function() {
		return returnStandardSubs();
	},
	onBeforeAction: function () {
			Session.setDefault("formForInsert", true);//insert
	},
	action: function() {
		if(this.ready()) {
			Session.setDefault("selectedProviderId", providers.findOne()._id);
			this.render();
		}
	},
});
Router.route("permalink", {
	path: '/perma/:prov/:date',
	action: function() {
		Session.set("date", moment(Date(this.params.date)).startOf('day').toDate());
		Session.set("selectedProviderId", this.params.date);
		Router.go('bookingTable');
	}
});
Router.route('newAppointment', {
	path: '/new/:time?',//TODO: Where all is this set?
	layoutTemplate: "sideEditMasterTemplate",
	template: 'appointmentEdit',
	waitOn: function() {
		return returnStandardSubs();
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
		Session.set("currentlyEditingDoc", null);
		
		if (this.params.time) {
			var momentvar = moment(this.params.time, "hh:mm A");
			//Session.set("date", momentvar.startOf('day').toDate());
			Session.set("newTime", momentvar.format("h:mm A"));
		}
		
	},
	action: function() {
		if(this.ready()) {
			this.render('bookingTable', {to: "right"});
			this.render();
		}
	},
	onAfterAction: function() {
		//if (this.ready()) {
			//AutoForm.resetForm("insertAppointmentFormInner");
		//}

		if (this.params.time) {
			if (this.ready()) {
				var provObject = unusualDays.findOne({date: Session.get("date"), providerID: Session.get("selectedProviderId")})
				if (!provObject) {
					provObject = providers.findOne(Session.get("selectedProviderId"))
				}
				try {//ensure there is a sane default for appointment length field.
					$("#insertAppointmentFormInner [data-schema-key='length']").val(provObject.appointmentLength);
				}
				catch(e) {}
				try {
					$('#datetimepicker4').data("DateTimePicker").setDate(this.params.time);
				} catch (e) {}
			}
		}
	},
	onStop: function() {
		//console.log("onStop for New Appointment");
		//console.log(this);
		Session.set("newTime", null);//remove Highlight
	}
});
Router.route('editAppointment', {
	path: '/edit/:id',
	layoutTemplate: "sideEditMasterTemplate",
	template: 'appointmentEdit',//TODO: If not on correct date for appointment, change
	waitOn: function() {
		return returnStandardSubs().push(Meteor.subscribe("singleAppointment", this.params.id));
	},
	loadingTemplate: 'loading',
	onBeforeAction: function () {
		Session.set("formForInsert", false);
		Session.set("currentlyEditingDoc", this.params.id);
		if(this.ready()) {
			Session.set("date", moment(appointmentList.findOne(this.params.id).date).startOf('day').toDate());
		}

	},
	action: function() {
		if(this.ready()) {
			this.render('bookingTable', {to: 'right'});
			this.render();
		}
	},
	onAfterAction: function() {
		if (this.ready()) {
			AutoForm.resetForm("insertAppointmentFormInner");
		}
	},
	onStop: function() {
		Session.set("formForInsert", true);
		Session.set("currentlyEditingDoc", null);
	}
});
Router.route('newBlockoutForm', {
	path: '/newBlockout/:time',
	layoutTemplate: "sideEditMasterTemplate",
	template: 'blockoutEdit',
	waitOn: function() {
		return returnStandardSubs();
	},
	onBeforeAction: function() {
		Session.set("formForInsert", true);
		Session.set("currentlyEditingDoc", null);
	},
	action: function() {
		this.render('bookingTable', {to: "right"});
		this.render();
	},
	onAfterAction: function() {
		if (this.ready()) {
			try {
				$('#datetimepicker4').data("DateTimePicker").setDate(this.params.time);
			} catch (e) {}
		}
	}

});
Router.route('editBlockout', {
	path: '/editBlockout/:id',
	layoutTemplate: "sideEditMasterTemplate",
	template: 'blockoutEdit',//TODO: If not on correct date for appointment, change
	waitOn: function() {
		return returnStandardSubs();
	},
	loadingTemplate: 'loading',
	onBeforeAction: function () {
		this.wait(Meteor.subscribe("singleBlockout", this.params.id));
		Session.set("formForInsert", false);
		Session.set("currentlyEditingDoc", this.params.id);
		if(this.ready()) {
			Session.set("date", moment(blockouts.findOne(this.params.id).date).startOf('day').toDate());
		}
	},
	action: function() {
		if(this.ready()) {
			this.render('bookingTable', {to: 'right'});
			this.render();
		}
	},
	onAfterAction: function() {
		if (this.ready()) {
			AutoForm.resetForm("insertBlockoutFormInner");
		}
	},
	onStop: function() {
		Session.set("formForInsert", true);
		Session.set("currentlyEditingDoc", null);
	}
});
Router.route('providerList', {
	path: '/providers',
	waitOn: function() {
		return Meteor.subscribe('providerSubscription');
	},
});
Router.route('userList', {
	path: '/users',
	waitOn: function() {
		return [Meteor.subscribe("userList"), Meteor.subscribe('providerSubscription')];
	}
});
Router.route('login', {
	path: '/login/:redirect(*)?',
	onBeforeAction: function() {
		if(this.params.redirect) {
			Session.set('loginRedirect', this.params.redirect);
		}
	}
});