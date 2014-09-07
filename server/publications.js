Meteor.publish("appointmentList", function (date, providerId) {
	var startDate = moment(date).startOf('day').toDate();
	var endDate = moment(date).endOf('day').toDate();
	return appointmentList.find({"date": {$gte: startDate, $lt: endDate}, "providerID": providerId});
})
Meteor.publish("providerSubscription", function() {
	return providers.find();
});
Meteor.publish("providerNames", function() {
	return providers.find({})
});
Meteor.publish("unusualDays", function(thedate) {
	return unusualDays.find({date:thedate})
});
// console.log(providers.find({}).fetch());
