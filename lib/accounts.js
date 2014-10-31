
// Meteor.users.allow({
// 	update: function(userId, doc, fieldNames, modifier) {
// 		if (_.contains(Meteor.users.findOne(userId).roles, "admin")) {
// 			return true;
// 		} else {
// 			return false;
// 		}
// 	}
// });
// Accounts.validateNewUser(function (user) {
// 	console.log(user)
// 	try {
// 		var loggedInUser = Meteor.user();

// 		if (Roles.userIsInRole(loggedInUser, ['admin'])) {
// 			return true;
// 		}

// 		throw new Meteor.Error(403, "Not authorized to create new users");
// 	} catch (e) {
// 		return true;
// 	}

// });
Schema = {};
Schema.UserProfile = new SimpleSchema({
    firstName: {
        type: String,
        regEx: /^[a-zA-Z-]{2,25}$/,
        optional: true
    },
    lastName: {
        type: String,
        regEx: /^[a-zA-Z]{2,25}$/,
        optional: true
    },
    birthday: {
        type: Date,
        optional: true
    },
    gender: {
        type: String,
        allowedValues: ['Male', 'Female'],
        optional: true
    },
    organization : {
        type: String,
        regEx: /^[a-z0-9A-z .]{3,30}$/,
        optional: true
    },
});

Schema.User = new SimpleSchema({
    _id: {
        type: String,
        regEx: SimpleSchema.RegEx.Id
    },
    username: {
        type: String,
        regEx: /^[a-z0-9A-Z_]{3,15}$/,
        // optional: true,
        custom: function () {
        	console.log(this);
        }
    },
    emails: {
    	optional: true,
        type: [Object],
    },
    "emails.$.address": {
    	optional: true,
        type: String,
        regEx: SimpleSchema.RegEx.Email
    },
    "emails.$.verified": {
    	optional: true,
        type: Boolean
    },
    createdAt: {
        type: Date
    },
    profile: {
        type: Schema.UserProfile,
        optional: true
    },
    services: {
        type: Object,
        optional: true,
        blackbox: true
    },
    // Add `roles` to your schema if you use the meteor-roles package.
    // Note that when using this package, you must also specify the
    // `Roles.GLOBAL_GROUP` group whenever you add a user to a role.
    // Roles.addUsersToRoles(userId, ["admin"], Roles.GLOBAL_GROUP);
    // You can't mix and match adding with and without a group since
    // you will fail validation in some cases.
    roles: {
        type: [String],
        optional: true,
        blackbox: true,
        allowedValues: ['booker', 'provider', 'admin']
    },
 	providerName: {
 		type: String,
 		optional: true
 	}
});

Meteor.users.attachSchema(Schema.User);
