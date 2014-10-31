Meteor.publish("appointmentList", function (date, providerName) {
	if(!this.userId) {
		this.stop();
		return;
	}
	console.log(date);
	var startDate = moment(date).startOf('day').toDate();
	var endDate = moment(date).endOf('day').toDate();
	try{
		console.log("appointmentList subscribed by " + providers.findOne({name: providerName}).name);
		console.log("query is "+JSON.stringify({"date": {$gte: startDate, $lt: endDate}, "providerName": providerName}))
	} catch(e) {
		console.log("!!!! appointmentList subscribed without providerName!");
		//this.stop();
		//return;
	}
	return appointmentList.find({"date": {$gte: startDate, $lt: endDate}, "providerName": providerName});
})
Meteor.publish(null, function() {
	if(!this.userId) {
		this.stop();
		return;
	}
	if (Roles.userIsInRole(this.userId, 'provider')) {
		console.log("providerSubscription subscribed by provider");
		return providers.find(Meteor.users.findOne(this.userId).providerName);
	}
	console.log("providerSubscription subscribed by non-provider");
	return providers.find();
});
Meteor.publish("unusualDays", function(thedate) {
	if(!this.userId) {
		this.stop();
		return;
	}
	return unusualDays.find({date:thedate})
});
Meteor.publish(null, function (){ 
	if(!this.userId) {
		this.stop();
		return;
	}
  return Meteor.roles.find({})//publish all roles without sub
});
Meteor.publish(null, function(){
	if(!this.userId) {
		this.stop();
		return;
	} else if (Roles.userIsInRole(this.userId, "provider")) {
		return Meteor.users.find(this.userId, {fields: {providerName: 1}});
	}
});//DOES THIS DO ANYTHING WTF
Meteor.publish("userList", function() {
	console.log("userlist caller is admin? " + Roles.userIsInRole(this.userId, 'admin'))
	if(!this.userId || !Roles.userIsInRole(this.userId, 'admin')) {
		this.stop();
		return;
	}
	return Meteor.users.find();
});
Meteor.publish("blockouts", function(date, provider) {
	try {
		console.log("blockouts subscribed by:  " + provider);
	}
	catch(e) {
		console.log("blockouts subscribed without provider name");
		//this.stop();
		//return;
	}//no providerID provided.
	if(!this.userId) {
		this.stop();
		return;
	}
	var startDate = moment(date).startOf('day').toDate();
	var endDate = moment(date).endOf('day').toDate();
	//console.log({date: {$gte: startDate, $lt: endDate}, providerID: provider});
	//console.log(blockouts.find().fetch());
	return blockouts.find({date: {$gte: startDate, $lt: endDate}, providerName: provider});
});
Meteor.publish("singleAppoint", function(id) {
	if(!this.userId) {
		this.stop();
		return;
	}
	console.log('singleAppoint subbed: '+id);
	return appointmentList.find(id);
});
Meteor.publish("singleBlockout", function(id) {
	if(!this.userId) {
		this.stop();
		return;
	}
	return blockouts.find(id);
});