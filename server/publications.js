Meteor.publish("appointmentList", function (date, providerId) {
	if(!this.userId) {
		this.stop();
		return;
	}
	var startDate = moment(date).startOf('day').toDate();
	var endDate = moment(date).endOf('day').toDate();
	return appointmentList.find({"date": {$gte: startDate, $lt: endDate}, "providerID": providerId});
})
Meteor.publish("providerSubscription", function() {
	if(!this.userId) {
		this.stop();
		return;
	}
	// if (Roles.userIsInRole(this.userId, 'provider')) {
	// 	return providers.find(Meteor.users.findOne(this.userId).providerId);
	// }
	return providers.find();
});
Meteor.publish("providerNames", function() {
	if(!this.userId) {
		this.stop();
		return;
	}
	return providers.find({})
});
Meteor.publish("unusualDays", function(thedate) {
	if(!this.userId) {
		this.stop();
		return;
	}//TODO: Restrict sent data to providers
	return unusualDays.find({date:thedate})
});
Meteor.publish(null, function (){ 
	if(!this.userId) {
		this.stop();
		return;
	}
  return Meteor.roles.find({})//publish all roles without sub
});
Meteor.publish("userList", function() {
	console.log("userlist caller is admin? " + !Roles.userIsInRole(this.userId, 'admin'))
	if(!this.userId || !Roles.userIsInRole(this.userId, 'admin')) {
		this.stop();
		return;
	}
	return Meteor.users.find();
})