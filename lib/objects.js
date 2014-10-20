getBlockouts = function(day, provId, date) {
	//Returns a complete list of blockouts for a given provider and day.
	console.log('looking for blockouts for day ' + date);
	try {var blockouts = providers.findOne({_id: provId, "blockouts.day": day}, {fields: {blockouts: 1}}).blockouts;}
	catch (e) {}
	try {var anyDayBlockouts = providers.findOne({_id: provId, "blockouts.day": "all"}, {fields: {blockouts: 1}}).blockouts;}
	catch (e) {}
	try {var singleDayBlockouts = unusualDays.findOne({date: date, providerID: provId}, {fields: {blockouts: 1}}).blockouts;}
	catch (e) {}
	var ret = _.union(blockouts, anyDayBlockouts, singleDayBlockouts);
	// console.log("today is "+day);
	ret = _.filter(ret, function(block) {
		// console.log("examining")
		// console.log(block);
		// console.log((block.day === day || block.day === "all"));
		if (typeof block !== "undefined" && !block.hasOwnProperty("day")) {
			return true;
		} else if (typeof block !== "undefined") {
			return (block.day === day || block.day === "all");
		}
		return false;
	});
	console.log(ret);
	return ret;
};