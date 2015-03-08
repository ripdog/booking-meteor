Template.userList.helpers({
	userList: function() {return Meteor.users.find()},
	userIsAdmin: function() {return Roles.userIsInRole(Meteor.userId(), 'admin')}
})
Template.userList.events({
	'click #newUserButton': function(event) {
		Meteor.call('newUser', function(result) {
			console.log(result);
		})},
	'click .userName': function(event) {
		Session.set("editingUser", $(event.currentTarget).data("id"))
	},
	'click .userDeleteButton': function (event) {
		if (confirm("Are you absolutely sure? This will delete *ALL* this users data!")) {
				if (confirm("ALL data related to this user will be deleted. Are you totally, complete, utterly sure?")){
					Meteor.call('deleteUser', $(event.currentTarget).parent().data("id"), function(err, result) {
						console.log(err);
						console.log(result);
					});
				}
			}
	},
	'click #changePasswordButton': function(event) {
		if (confirm("Are you sure you want to change this users password?")) {
			Meteor.call("forcePassword", Session.get('editingUser'), $('#changePasswordForm').val(), function(error, result) {
				console.log(error);
				console.log(result);
			})
		}
	}
})
Template.userEdit.rendered = function() {
	Session.set("editingUser", Meteor.users.findOne()._id)
}

Template.userEdit.helpers ({
	usercoll: function() {return Meteor.users},
	editingUser: function() {
		if(typeof Session.get("editingUser") !== "undefined") {
			return Meteor.users.findOne(Session.get("editingUser"));
		} else {
			return Meteor.users.findOne();
		}
	},
	isProvider: function() {
		return Roles.userIsInRole(Session.get("editingUser"), 'provider');
	},
	provOptions: function() {
		var ret = [];
		_.each(providers.find().fetch(), function(prov) {
			ret.push({label: prov.name, value: prov._id});
		});
		return ret;
	}
})