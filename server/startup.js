Meteor.startup(function() {
	if(Meteor.users.find().count() === 0) {
		var id = Accounts.createUser({
			username:"admin", 
			password:"admin"
		});
		Roles.addUsersToRoles(id, "admin");
		id = Accounts.createUser({
			username:"booker", 
			password:"booker"
		});
		Roles.addUsersToRoles(id, ["booker"]);
		id = Accounts.createUser({
			username:"provider", 
			password:"provider",
		});
		Roles.addUsersToRoles(id, ["provider"]);
	}
})