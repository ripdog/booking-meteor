Meteor.startup(function() {
	Kadira.connect('dJ6gZ6qfhtsLjqt59', 'b0f959b1-3714-41d9-848f-0cdd146c5ac3');
	if(Meteor.users.find().count() === 0) {
		var id = Accounts.createUser({
			username:"admin", 
			password:"admin",
			email: "admin@example.com"
		});
		Roles.addUsersToRoles(id, "admin");
		id = Accounts.createUser({
			username:"booker", 
			password:"booker",
			email: "booker@example.com"
		});
		Roles.addUsersToRoles(id, "booker");
		id = Accounts.createUser({
			username:"provider", 
			password:"provider",
			email: "provider@example.com"
		});
		Roles.addUsersToRoles(id, "provider");
	}
	console.log("Number of users: " + Meteor.users.find().count())
});
