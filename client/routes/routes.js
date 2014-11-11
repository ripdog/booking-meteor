var subs = new SubsManager({
	cacheLimit: 20,//number of subs to cache
	expireIn: 20//minutes to hold on to subs
});

Router.configure({
  // layoutTemplate: 'masterLayout',
  notFoundTemplate: 'notFound',
  loadingTemplate: 'loading',
	layoutTemplate: 'singlePageMasterLayout'
});
Router.onBeforeAction(mustBeSignedIn, {except: ['login']});
function mustBeSignedIn() {
	if (Meteor.loggingIn()) {
		console.log("currently logging in");
		this.render('loading');
	} else {
		user = Meteor.user();
		if (!user) {
			console.log("need to log in");
			Router.go('loginPage', {redirect: this.options.path});
		}
		this.next();
	}
}
//editDataLoader.load = function(id) {//thanks to Manuel Schoebel
//	var handle, self;
//	self = this;
//	if (!this._subs[sub]) {
//		this._subs[sub] = {
//			src: sub,
//			ready: false,
//			readyDeps: new Tracker.Dependency
//		};
//		Meteor.call('getAppointmentById', id)
//	}
//	handle = {
//		ready: function() {
//			var sub;
//			sub = self._libs[src];
//			lib.readyDeps.depend();
//			return lib.ready;
//		}
//	};
//	return handle;
//};

returnStandardSubs = function(date, provName, appntId, blockId) {
	//date should be a string in YYYY-MM-DD format
	var thedate = moment(date, 'YYYY-MM-DD').startOf('day').toDate();
	var list = [];
	if (typeof date === "string" && typeof provName === "string") {
		Session.set("date", thedate);
		Session.set("selectedProviderName", provName);
		list = list.concat([Meteor.subscribe('appointmentList', Session.get('date'), Session.get("selectedProviderName")),
			Meteor.subscribe("unusualDays", Session.get("date")),
			Meteor.subscribe('blockouts', Session.get('date'), Session.get("selectedProviderName"))]);
	}
	if (typeof appntId === "string") {
		list = list.concat(Meteor.subscribe('singleAppoint', appntId));
	} else if (typeof blockId === "string") {
		list = list.concat(Meteor.subscribe('singleBlockout', blockId));
	}
	console.log(list);
	return list;



};

Tracker.autorun(function() {
	console.log("session date has changed! " + Session.get('date'));
});
/*TODO: Links to / should choose whether to default to today or existing date
based on Session.get('date')*/
Router.route('index', {
	path: '/',
	action: function() {
		if (this.ready()) {
			Router.go('bookingTable',
				{date: moment().startOf('day').format('YYYY-MM-DD'),
					provName: providers.findOne().name});
		}
	}
});


Router.route('newAppointment', {
	path: '/new/:date/:provName/:time?',//TODO: Where all is this set?
	layoutTemplate: "sideEditMasterTemplate",
	template: 'appointmentEdit',
	waitOn: function() {
		console.log("NewAppointment here, grabbing my standard subs!");
		return returnStandardSubs(this.params.date, this.params.provName, null, null);
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
			//var momentvar = moment(this.params.time, "hh-mm-A");
			//Session.set("date", momentvar.startOf('day').toDate());
			Session.set("newTime", this.params.time.replace('-', ':').replace('-', ' '));
		}
		this.next();
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

				var provObject = getProvObject(Session.get("date"), Session.get('selectedProviderName'));
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
		Session.set("newTime", null);//remove Highlight
	}
});
Router.route('editAppointment', {
	path: '/edit/:id',
	layoutTemplate: "sideEditMasterTemplate",
	template: 'appointmentEdit',//TODO: If not on correct date for appointment, change
	//waitOn: function() {
	//	return returnStandardSubs(null, null, this.params.id, null);
	//},
	loadingTemplate: 'loading',
	onBeforeAction: function () {
		//if (!this.state.get('postGotten')) {
			var handle = Meteor.subscribe('singleAppoint', this.params.id);
			if (handle.ready()) {
				var appoint = appointmentList.findOne(this.params.id);
				console.log('found appointment');
				Session.set('date', moment(appoint.date).startOf('day').toDate());
				Session.set('selectedProviderName', appoint.providerName);
				//handle.stop();
				var subs = returnStandardSubs(moment(appoint.date).startOf('day').format('YYYY-MM-DD'), appoint.providerName, null, null);
				console.log(subs);
				this.wait(subs);
				//this.state.set('postGotten', true);
				this.next();
			}
		//}
		Session.set("formForInsert", false);
		Session.set("currentlyEditingDoc", this.params.id);
		//if(this.ready()) {
		//	Session.set('selectedProviderName', providers.findOne().name);
		//	Session.set('date', moment().startOf('day').toDate());
		//}
		//	console.log('onBeforeAction for appointmentEdit is ready');


		//
		//}


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
	path: '/newBlockout/:date/:provName/:time',
	layoutTemplate: "sideEditMasterTemplate",
	template: 'blockoutEdit',
	waitOn: function() {
		console.log("newBlockout here, grabbing my standard subs!");
		return returnStandardSubs(this.params.date, this.params.provName, null, null);
	},
	onBeforeAction: function() {
		Session.set("formForInsert", true);
		Session.set("currentlyEditingDoc", null);
		this.next();
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
		this.next();
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
	path: '/providers'
	//waitOn: function() {
	//	return Meteor.subscribe('providerSubscription');
	//}
});
Router.route('userList', {
	path: '/users',
	waitOn: function() {
		return [Meteor.subscribe("userList"), Meteor.subscribe('providerSubscription')];
	}
});


//TODO: Split up the bookingTable so that the appointment
//items always render after the table itself. Also allow cleanup so less
//stuff disappears when changing date. Add date to url.
Router.route('bookingTable', {
	path: '/:date/:provName',
	waitOn: function() {
		subs = returnStandardSubs(this.params.date, this.params.provName);
		return subs;
	},
	onBeforeAction: function () {
		Session.setDefault("formForInsert", true);
		this.next();
	},
	action: function() {
		if(this.ready()) {
			this.render();
		}
	}
});


Router.route('loginPage', {
	path: '/login/:redirect*',
	onBeforeAction: function() {
		if(this.params.redirect) {
			Session.set('loginRedirect', this.params.redirect);
		}
		this.next();
	}
});
