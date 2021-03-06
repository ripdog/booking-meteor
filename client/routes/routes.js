subs = new SubsManager({
	cacheLimit: 20,//number of subs to cache
	expireIn: 20//minutes to hold on to subs
});

Router.configure({
  // layoutTemplate: 'masterLayout',
  notFoundTemplate: 'notFound',
  loadingTemplate: 'loading',
	layoutTemplate: 'singlePageMasterLayout'
});
Router.onBeforeAction(mustBeSignedIn, {except: ['loginPage']});
function mustBeSignedIn() {
	if (Meteor.loggingIn()) {
		//console.log("currently logging in");
		this.render('loading');
	} else {
		user = Meteor.user();
		if (!user) {
			//console.log("need to log in");
			console.log(Router.current().route.getName());
			this.render("loginPage");
			//Router.go('loginPage', {redirect: Router.current().route.path()});
		} else {
			this.next();
		}
	}
}
Router.onBeforeAction(correctProviderName, {except: ['loginPage']});
function correctProviderName() {
	if (Roles.userIsInRole(Meteor.user(), "provider") && Meteor.user().providerName !== Session.get("selectedProviderName")) {
		Session.set("selectedProviderName",Meteor.user().providerName);
	}
	this.next();
}
Router.onBeforeAction(cleanupTimer);
function cleanupTimer() {
	//if (typeof closeTimeout !== "undefined") {//ensure time and alert is goneburgers on new route changes.
	//	$('#saveAppointChanges').attr("disabled", false);
	//	Meteor.clearTimeout(closeTimeout);
	//	$('#insertSuccessAlert').hide('fast');
	//}
	this.next();
}

returnStandardSubs = function(date, providerName, appntId, blockId) {
	//date should be a string in YYYY-MM-DD format
	if (!providers.findOne({name: providerName})) {
		providerName = providers.findOne().name;
		//throw new Meteor.Error("returnStandardSubs given invalid providerName", providerName);
	}
	var thedate = moment(date, 'YYYY-MM-DD').startOf('day').toDate();
	var list = [];
	if (typeof date === "string" && typeof providerName === "string") {
		Session.set("date", thedate);
		Session.set("selectedProviderName", providerName);
		list = list.concat([Meteor.subscribe('appointmentList', Session.get('date'), Session.get("selectedProviderName")),
			Meteor.subscribe("unusualDays", Session.get("date")),
			Meteor.subscribe('blockouts', Session.get('date'), Session.get("selectedProviderName"))]);
	}
	if (typeof appntId === "string") {
		list = list.concat(Meteor.subscribe('singleAppoint', appntId));
	} else if (typeof blockId === "string") {
		list = list.concat(Meteor.subscribe('singleBlockout', blockId));
	}
	//console.log(list);
	return list;



};

Tracker.autorun(function() {
	console.log("session date has changed! " + Session.get('date'));
});
Router.route('index', {
	path: '/',
	action: function() {
		if (this.ready()) {
			Router.go('bookingTable',
				{date: moment().startOf('day').format('YYYY-MM-DD'),
					providerName: providers.findOne().name});
		}
	}
});


Router.route('newAppointment', {
	path: '/new/:date/:providerName/:time?',
	layoutTemplate: "sideEditMasterTemplate",
	template: 'appointmentEdit',
	loadingTemplate: 'loading',
	waitOn: function() {
		if (Meteor.user()) {
			console.log("NewAppointment here, grabbing my standard subs!");
			return returnStandardSubs(this.params.date, this.params.providerName, null, null);
		}

	},
	onBeforeAction: function () {
		console.log("new onbeforeaction");

		Session.set("formForInsert", true);
		Session.set("currentlyEditingDoc", null);
		
		if (this.params.time) {
			Session.set("newTime", this.params.time.replace('-', ':').replace('-', ' '));
		}
		this.next();
	},
	action: function() {
		console.log("newAppointment action");
		if(this.ready()) {
			console.log("newAppointment ready");
			this.render('bookingTable', {to: "right"});
			this.render();
		}
	},
	onStop: function() {
		Session.set("newTime", null);//remove Highlight
	}
});
Router.route('editAppointment', {
	path: '/edit/:id',
	layoutTemplate: "sideEditMasterTemplate",
	template: 'appointmentEdit',
	//waitOn: function() {
	//	return returnStandardSubs(null, null, this.params.id, null);
	//},
	loadingTemplate: 'loading',
	onBeforeAction: function () {
		console.log("edit onbeforeaction");
			var handle = Meteor.subscribe('singleAppoint', this.params.id);
			if (handle.ready()) {
				var appoint = appointmentList.findOne(this.params.id);
				if (!appoint) {this.render("notFound")}
				Session.set('date', moment(appoint.date).startOf('day').toDate());
				Session.set('selectedProviderName', appoint.providerName);
				Tracker.autorun(function() {
					var subs = returnStandardSubs(moment(Session.get('date')).startOf('day').format('YYYY-MM-DD'),
						Session.get('selectedProviderName'),
						null,
						null);
				});
				//this.wait(subs);
				Session.set("formForInsert", false);
				Session.set("currentlyEditingDoc", this.params.id);
				this.next();
			}



	},
	action: function() {
		if(this.ready()) {
			this.render('bookingTable', {to: 'right'});
			this.render();
		}
	},
	onAfterAction: function() {
		//console.log("edit onafteraction");
	},
	onStop: function() {
		//console.log("edit onstop");
		Session.set("formForInsert", true);
		Session.set("currentlyEditingDoc", null);
	}
});
Router.route('newBlockout', {
	path: '/newBlockout/:date/:providerName/:time',
	layoutTemplate: "sideEditMasterTemplate",
	template: 'blockoutEdit',
	waitOn: function() {
		//console.log("newBlockout here, grabbing my standard subs!");
		if (Meteor.user()) {
			return returnStandardSubs(this.params.date, this.params.providerName, null, null);
		}
	},
	onBeforeAction: function() {
		Session.set("formForInsert", true);
		Session.set("currentlyEditingDoc", null);
		if (this.params.time) {
			Session.set("newTime", this.params.time.replace('-', ':').replace('-', ' '));
		}
		this.next();
	},
	action: function() {
		this.render('bookingTable', {to: "right"});
		this.render();
	},
	onStop: function() {
		Session.set("newTime", null);//remove Highlight
	}

});
Router.route('editBlockout', {
	path: '/editBlockout/:id',
	layoutTemplate: "sideEditMasterTemplate",
	template: 'blockoutEdit',//TODO: If not on correct date for appointment, change
	loadingTemplate: 'loading',
	onBeforeAction: function () {
		var handle = Meteor.subscribe('singleBlockout', this.params.id);
		Session.set("formForInsert", false);
		Session.set("currentlyEditingDoc", this.params.id);
		if (handle.ready()) {
			Tracker.autorun(function () {
				var block = blockouts.findOne(Session.get('currentlyEditingDoc'));
				var subs = returnStandardSubs(moment(block.date).startOf('day').format('YYYY-MM-DD'),
					block.providerName,
					null,
					null);
			});
			this.next();
		}
	},
	action: function() {
		if(this.ready()) {
			this.render('bookingTable', {to: 'right'});
			this.render();
		}
	},
	//onAfterAction: function() {
	//	if (this.ready()) {
	//
	//	}
	//},
	onStop: function() {
		Session.set("formForInsert", true);
		Session.set("currentlyEditingDoc", null);
	}
});
Router.route('providerList', {
	path: '/providers'
});
Router.route('userList', {
	path: '/users',
	waitOn: function() {
		if(Meteor.user()) {
			return Meteor.subscribe("userList");
		}
	}
});

Router.route('loginPage', {
	path: '/login/(.*)',
	template: 'loginPage',
	onBeforeAction: function() {
		if(this.params) {
			Session.set('loginRedirect', this.params[0]);
		}
		//console.log(this.params[0]);
		this.next();
	}
});

Router.route('printout', {
	template: "bookingTable",
	layoutTemplate: "blank",
	path: '/printout/:date/:providerName',
	waitOn: function() {
		if(Meteor.user()) {
			return returnStandardSubs(this.params.date, this.params.providerName);
		}
	},
	action: function() {
		if(this.ready()) {
			this.render();
		}
	}
});

Router.route('calendar', {
	template:"calendar",
	path: '/calendar/:year/:month',
	waitOn: function() {
		if (Meteor.user()) {
			var startDate = moment().year(this.params.year).month(this.params.month).startOf('month').subtract(5, "days");
			var endDate = moment().year(this.params.year).month(this.params.month).endOf('month').add(10, "days");
			return Meteor.subscribe("unusualDaysRange", startDate.toDate(), endDate.toDate());
		}
	},
	onBeforeAction: function() {
		Session.set("calendarStart", moment().year(this.params.year).month(this.params.month).startOf('month').toDate());
		Session.set("calendarEnd", moment().year(this.params.year).month(this.params.month).endOf('month').toDate());
		Session.set("date", moment().year(this.params.year).month(this.params.month).startOf('month').toDate());
		this.next();
	}
});

Router.route('bookingTable', {
	path: '/:date/:providerName',
	waitOn: function() {
		if(Meteor.user()) {
			return returnStandardSubs(this.params.date, this.params.providerName);
		}
	},
	onBeforeAction: function () {
		Session.setDefault("formForInsert", true);
		AutoForm.resetForm("insertAppointmentFormInner");
		AutoForm.resetForm("insertBlockoutFormInner");
		Session.set("newTime", null);
		this.next();
	},
	action: function() {
		if(this.ready()) {
			this.render();
		}
	}
});


