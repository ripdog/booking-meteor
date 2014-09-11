Template.userList.helpers({
	userList: function() {return Meteor.users.find()}
})