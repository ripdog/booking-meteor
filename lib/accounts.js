
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
        optional: true,
        custom: function () {
        	console.log(this);
        }
    },
    emails: {
    	optional: true,
        type: [Object],
        custom: function () {
        	console.log(this);
        }
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
        type: String,
        optional: true,
        blackbox: true,
        allowedValues: ['booker', 'provider', 'admin']
    }
});

// Meteor.users.attachSchema(Schema.User);

// // Meteor.users.attachSchema(new SimpleSchema({
// // 	username: {
// // 		type: String,
// // 		label: "Username",
// // 		unique: true,
// // 	},
// // 	// email: {
// // 	// 	type: String,
// // 	// 	label: "Email",
// // 	// 	unique: true,
// // 	// 	regEx: SimpleSchema.RegEx.Email
// // 	// },
// // 	emails: {
// //     	type: [Object],
// //     	custom: function(){
// //     		console.log(this);
// //     	}
// // 	},
// // 	"emails.$.address": {
// // 	    type: String,
// // 	    regEx: SimpleSchema.RegEx.Email
// // 	},
// // 	"emails.$.verified": {
// // 	    type: Boolean
// // 	},
// // 	providerID: {
// // 		type:String,
// // 		unique:true,
// // 		optional: true,
// // 	},
// // 	password: {
// // 		type: String,
// // 		label: "Password"
// // 	},
// // 	roles: {
// // 		type: String,
// // 		label: "Permissions",
// // 		allowedValues: ['booker', 'provider', 'admin'],
// // 		defaultValue: 'booker'
// // 	}
// // }))
