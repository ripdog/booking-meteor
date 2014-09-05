Meteor.publish("appointmentList", function (date, providerId) {
	var startDate = moment(date).startOf('day').toDate();
	var endDate = moment(date).endOf('day').toDate();
	return appointmentList.find({"date": {$gte: startDate, $lt: endDate}, "providerID": providerId});
})
Meteor.publish("providerSubscription", function() {
	return providers.find();
});
Meteor.publish("providerNames", function() {
	return providers.find({}, {fields: {name: 1}})
});
// console.log(providers.find({}).fetch());