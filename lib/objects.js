getProvObject = function(date, providerName) {
	var provObject = unusualDays.findOne({date: date, providerName: providerName});
	if (typeof provObject === "undefined") {
		provObject = providers.findOne({name: providerName});
	}
	return provObject;
};

getBlockouts = function(providerName, date) {
	//Returns a complete list of blockouts for a given provider and day.
	//console.log('looking for blockouts for day ' + date);
	var day = moment(date).format("dddd").toLowerCase();
	try {var providerBlockouts = providers.findOne({name: providerName}, {fields: {blockouts: 1}}).blockouts;}
	catch (e) {}
	var startDate = moment(date).startOf('day').toDate();
	var endDate = moment(date).endOf('day').toDate();
	var singleDayBlockouts = blockouts.find({date: {$gte: startDate, $lt: endDate}, providerName: providerName}).fetch();
	var ret = _.union(providerBlockouts, singleDayBlockouts);
	ret = _.filter(ret, function(block) {
		if (typeof block !== "undefined" && !block.hasOwnProperty("day")) {
			return true;//this means the blockout is custom for today, thus kept
		} else if (typeof block !== "undefined") {
			return (block.day === day || block.day === "all");
		}//this means the blockout is a recurring one for this provider, so kept if
		//is an everyday one or for this day of the week.
		return false;
	});
	//console.log(ret);
	return ret;
};

checkDate = function(thisobj, isAppnt) {
	//Checks a given date falls within the bounds of the current day and does not overlap
	//appointments or blockouts

	//////////////////////////////////////////////////
	/////////////CHECKING DAY BOUNDS
	/////////////////////////////////////////////////
	var cleanDate = moment(thisobj.value).startOf('day');
	var provObject = getProvObject(cleanDate.toDate(), thisobj.field("providerName").value);
	//thisobj may fail due to timezone
	console.log("checking "+moment(thisobj.value).format()+" is inside "+ moment(cleanDate).tz("Pacific/Auckland").hours(provObject.startTime).format() + " and "+
	moment(cleanDate).tz("Pacific/Auckland").hours(provObject.endTime).format());
	if(moment(thisobj.value).isValid() === false) {
		return "wtf"
	}

	else if (moment(thisobj.value).isBefore(moment(cleanDate).tz("Pacific/Auckland").hours(provObject.startTime).utc())) {
		return "dateOutOfBounds"
	}
	else if (moment(thisobj.value).isAfter(moment(cleanDate).tz("Pacific/Auckland").hours(provObject.endTime).utc())) {
		return "dateOutOfBounds"
	}
	//////////////////////////////////////////////////
	/////////////CHECKING APPOINTMENT OVERLAP
	/////////////////////////////////////////////////
	var currentAppoint = thisobj.value;
	var currentAppointEnd = moment(currentAppoint).add(parseInt(thisobj.field("length").value), 'minutes');
	var currentRange = moment(currentAppoint).twix(currentAppointEnd);
	var queryStart = moment(thisobj.value).startOf('day').toDate();
	var queryEnd = moment(thisobj.value).endOf('day').toDate();
	//console.log(JSON.stringify({date: {$gte: queryStart, $lt:queryEnd},providerName: thisobj.field("providerName").value}));
	var appoints = appointmentList.find({date: {$gte: queryStart, $lt:queryEnd},providerName: thisobj.field("providerName").value}).fetch();
	var ret;
	_.each(appoints, function(comparedAppoint) {
		var comparedRange = moment(comparedAppoint.date)
			.twix(moment(comparedAppoint.date)
				.add(comparedAppoint.length, "minutes"));

		//console.log("Comparing " + currentRange.format() + " with " + comparedRange.format());
		var overlaps = currentRange.overlaps(comparedRange);
		if (overlaps) {
			if (Meteor.isServer) {
				if (!(thisobj.docId === comparedAppoint._id)) {
					console.log("different appointments clashing");
					ret = "overlappingDates";
					return "overlappingDates";
				}
			}
			else if (Meteor.isClient) {
				if (!(Session.get("currentlyEditingDoc") === comparedAppoint._id)) {
					console.log("different appointments clashing");
					ret = "overlappingDates";
					return "overlappingDates";
				}
			}
		}
	});
	if (typeof ret === "string") {
		return ret;
	}
	//////////////////////////////////////////////////
	/////////////CHECKING BLOCKOUT OVERLAP
	/////////////////////////////////////////////////
	var blockouts = getBlockouts(thisobj.field("providerName").value,
		cleanDate.toDate());
	_.each(blockouts, function(comparedBlockout) {
		var blockStartDate = moment(cleanDate.tz('Pacific/Auckland').format('YYYY MM DD ') + comparedBlockout.time,
			"YYYY MM DD HH:mm A");
		var blockEndDate = moment(blockStartDate).add(comparedBlockout.length, 'minutes');
		var blockTwix = moment(blockStartDate).twix(blockEndDate);
		//console.log();
		//console.log("comparing block " + blockTwix.format() + " with appointment "+ currentRange.format());
		var overlaps = blockTwix.overlaps(currentRange);
		if (overlaps) {
			if (Meteor.isServer) {
				//if (!(thisobj.docId === comparedBlockout._id)) {
				//	console.log("clashing with blockout");
				//	ret = "overlappingBlockout";
				//	return "overlappingBlockout";
				//}
			}
			else if (Meteor.isClient) {


				if (!(Session.get("currentlyEditingDoc") === comparedBlockout._id)) {
					if(isAppnt) {
						if(confirm('This appointment overlaps a blockout. Are you sure you want to place it here?')) {
							return;
						}
					}
					//console.log("clashing with blockout");
					ret = "overlappingBlockout";
					return "overlappingBlockout";
				}
			}
		}
	});
	if (typeof ret === "string") {
		return ret;
	}
};

