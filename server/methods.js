Meteor.methods({
	checkTimes: function(searchDate, provider) {
		//assert the provided date is midnight NZST
		if(!providers.findOne({'unusualDays.date': searchDate, '_id':provider})) {
			console.log ('no');
			return providers.findOne(provider);
		}
	}
})

//very unfinised ^^