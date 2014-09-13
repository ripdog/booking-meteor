Meteor.methods({
	newUser: function() {
		if (Roles.userIsInRole(this.userId, 'admin')) {
			return ret = Accounts.createUser({
				username:"newuser",
				email:"fakeEmail@example.com",
				roles: ["booker"],
				password:"newpass"
			})
		}
	},
	deleteUser: function(id) {
		if(Roles.userIsInRole(this.userId, 'admin')) {
			return Meteor.users.remove(id);
		} 
	}
})


// Meteor.methods({
// 	checkTimes: function(searchDate, provider) {
// 		//assert the provided date is midnight NZST
// 		var unusualDate = providers.findOne({'unusualDays.date': searchDate, '_id':provider});
// 		if(!unusualDate) {
// 			console.log ('no');
// 			return providers.findOne(provider);
// 		} else {
// 			console.log('yes!');
// 			return unusualDate;
// 		}
// 	}
// })

//very unfinised ^^



//TODO: Define a method which removes a provider and ALL dependants
