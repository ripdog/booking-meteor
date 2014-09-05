Meteor.publish("appointmentList", function () {
	return appointmentList.find({});
})
Meteor.publish("providerSubscription", function() {
	return providers.find();
});
// console.log(providers.find({}).fetch());