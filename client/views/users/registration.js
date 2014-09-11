Template.registration.helpers({})

AutoForm.hooks({
	registrationForm: {
		onSubmit: function(insertDoc, updateDoc, currentDoc) {
			Meteor.users.simpleSchema().clean(insertDoc);
			console.log(insertDoc);
			Accounts.createUser({
					username: insertDoc.username,
					emails: insertDoc.emails,
					password: insertDoc.password,
					roles: insertDoc.roles
				}, function(error, status) {
					console.log(error);
			});
			this.event.preventDefault();
			return false;
		}
	}
})