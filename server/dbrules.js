unusualDays.deny({
	remove: function(userId, doc) {
		//ensure that no appointments will be left stranded by this day being removed.
		var provider = doc.providerName;
		var cleanDate = moment(doc.date);
		var provObj = providers.findOne({name: provider});
		var startDate = cleanDate.clone().tz("Pacific/Auckland").hour(provObj.startTime).toDate();
		var endDate = cleanDate.clone().tz("Pacific/Auckland").hour(provObj.endTime).toDate();
		var dayTwix = moment(startDate).twix(endDate);
		console.log(dayTwix.format());
		//build query
		var midnight = moment(cleanDate).startOf("day").toDate();
		var midday = moment(cleanDate).endOf("day").toDate();
		var appoints = appointmentList.find({date: {$gte: midnight, $lt: midday},
			providerName: provider}).fetch();
		var ret = false;
		_.each(appoints, function(appoint) {
			console.log(appoint);
			if(!dayTwix.contains(appoint.date)) {
				console.log("fail");
				ret = true;
			}
		});
		return ret;
	}
});

appointmentList.allow({
	insert: function(userId, appointment) {
		if (Roles.userIsInRole(userId, 'provider') && appointment.providerName != Meteor.users.findOne(userId).providerName) {
			throw new Meteor.Error (403, "Provider tried to add appointment for user other than herself.")
		}
		return true;
	},
	update: function(userId, appointment) {

		if (Roles.userIsInRole(userId, 'provider') && appointment.providerName != Meteor.users.findOne(userId).providerName) {
			throw new Meteor.Error (403, "Provider tried to edit appointment for user other than herself.");
		}
		return true;
	},
	remove:function(userId, appointment) {

		if (Roles.userIsInRole(userId, 'provider') && appointment.providerName != Meteor.users.findOne(userId).providerName) {
			throw new Meteor.Error (403, "Provider tried to delete appointment for user other than herself.");
		}
		return true;
	},
	fetch: ["providerName"]
});

blockouts.allow({
	insert: function(userId, blockout) {
		if (Roles.userIsInRole(userId, 'provider') && blockout.providerName != Meteor.users.findOne(userId).providerName) {
			throw new Meteor.Error (403, "Provider tried to add blockout for user other than herself.")
		}
		return true;
	},
	update: function(userId, blockout) {

		if (Roles.userIsInRole(userId, 'provider') && blockout.providerName != Meteor.users.findOne(userId).providerName) {
			throw new Meteor.Error (403, "Provider tried to edit blockout for user other than herself.");
		}
		return true;
	},
	remove:function(userId, blockout) {

		if (Roles.userIsInRole(userId, 'provider') && blockout.providerName != Meteor.users.findOne(userId).providerName) {
			throw new Meteor.Error (403, "Provider tried to delete blockout for user other than herself.");
		}
		return true;
	},
	fetch: ["providerName"]
});

Meteor.users.allow({
	update: function(userId, user) {
		if(Roles.userIsInRole(userId, 'admin')) {
			return true;
		}
		throw new Meteor.Error(403, "Nice try punk. Only admins can edit users.")
	},
	insert: function(userId, user) {
		if(Roles.userIsInRole(userId, 'admin')) {
			return true;
		}
		throw new Meteor.Error(403, "Nice try punk. Only admins can add users.")
	},
	remove: function(userId, user) {
		if(Roles.userIsInRole(userId, 'admin')) {
			return true;
		}
		throw new Meteor.Error(403, "Nice try punk. Only admins can delete users.")
	}
});

unusualDays.allow({
	insert: function(userId, unusualDay) {
		if (Roles.userIsInRole(userId, 'provider') && unusualDay.providerName != Meteor.users.findOne(userId).providerName) {
			throw new Meteor.Error (403, "Provider tried to add unusualDay for user other than herself.")
		}
		return true;
	},
	update: function(userId, unusualDay) {

		if (Roles.userIsInRole(userId, 'provider') && unusualDay.providerName != Meteor.users.findOne(userId).providerName) {
			throw new Meteor.Error (403, "Provider tried to edit blockout for user other than herself.");
		}
		return true;
	},
	remove:function(userId, unusualDay) {

		if (Roles.userIsInRole(userId, 'provider') && unusualDay.providerName != Meteor.users.findOne(userId).providerName) {
			throw new Meteor.Error (403, "Provider tried to delete blockout for user other than herself.");
		}
		return true;
	},
	fetch: ["providerName"]
});