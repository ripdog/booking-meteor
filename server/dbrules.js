unusualDays.deny({
	remove: function(userId, doc) {
		//ensure that no appointments will be left stranded by this day being removed.
		var provider = doc.providerID;
		var cleanDate = moment(doc.date);
		var provObj = providers.findOne(provider);
		var startDate = cleanDate.clone().tz("Pacific/Auckland").hour(provObj.startTime).toDate();
		var endDate = cleanDate.clone().tz("Pacific/Auckland").hour(provObj.endTime).toDate()
		var dayTwix = moment(startDate).twix(endDate);
		console.log(dayTwix.format());
		//build query
		var midnight = moment(cleanDate).startOf("day").toDate();
		var midday = moment(cleanDate).endOf("day").toDate();
		var appoints = appointmentList.find({date: {$gte: midnight, $lt: midday},
			providerID: provider}).fetch();
		var ret = false
		_.each(appoints, function(appoint) {
			console.log(appoint);
			if(!dayTwix.contains(appoint.date)) {
				console.log("fail")
				ret = true;
			}
		});
		return ret;
	}
})
// { date: Thu Sep 18 2014 00:00:00 GMT+1200 (NZST),
// App 23011 stdout: I20140918-18:00:30.652(12)?   providerID: '8gP3mvG37ptD55omd',
// App 23011 stdout: I20140918-18:00:30.652(12)?   startTime: 8,
// App 23011 stdout: I20140918-18:00:30.652(12)?   endTime: 17,
// App 23011 stdout: I20140918-18:00:30.652(12)?   appointmentLength: 15,
// App 23011 stdout: I20140918-18:00:30.654(12)?   _id: 'HDmdni7HnYZozNNuQ' }