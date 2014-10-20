tableItemHeight = function(thisobj) {
		if (thisobj.length == Session.get("appntlength"))
		{
			return getRowHeight() +"px";
		}
		var provObject = unusualDays.findOne({date: Session.get("date"), providerID: Session.get("selectedProviderId")});
		if (!provObject) {
			provObject = providers.findOne(Session.get("selectedProviderId"));
		}
		var defaultHeight = getRowHeight();
		var pxPerMinute = defaultHeight/provObject.appointmentLength;
		return Math.ceil(pxPerMinute * thisobj.length) + "px";
}
tableItemLeft = function(thisobj) {
	return $(".rowHeader").css("width");
}
tableItemTop = function(thisobj) {
	if (!thisobj.date) {//this is a blockout
		var datestring = moment(Session.get("date")).tz("Pacific/Auckland").format("YYYY-MM-DD ") + thisobj.time;
		var thedate = moment(datestring);
		// console.log(thedate);
	} else {
		thedate = thisobj.date;
	}
	var provObject = unusualDays.findOne({date: Session.get("date"), providerID: Session.get("selectedProviderId")})
	if (!provObject) {
		provObject = providers.findOne(Session.get("selectedProviderId"))
	}
	var numFromTop = (moment(thedate).unix() -
				  moment(getDate()).hours(provObject.startTime).unix())/60;

	//getDate is used to avoid a dependence upon the date var. Don't want to attempt
	//to rerender this template when it no longer exists.
	if(numFromTop/provObject.appointmentLength === 0){
		return $("thead th").css("height")
	}
	else
	{
		var untouchedAppntsFromTop = (numFromTop/provObject.appointmentLength)+1;
		if (untouchedAppntsFromTop > $(".timeRow").length+1 ||
		 	untouchedAppntsFromTop < 0) {
			//Protect against exceptions when system tries to render appointments
			//on wrong days.
			console.log(untouchedAppntsFromTop);
			console.log("appointment item out of bounds, return 0 for top")
			return 0;
		}
		var appntsFromTop = Math.floor(untouchedAppntsFromTop);
	 		// console.log(this.date + " is  " + untouchedAppntsFromTop + " appoints from the top.");
		try {
			var pixelsFromTop = $(".timeRow:nth-child("+appntsFromTop+")")[0].offsetTop
		}
		catch (exc) {
			console.log(appntsFromTop);
			console.log("exception caught, rendering too early, hold off.");
			rerenderDep.changed();
		}
		// console.log("PixelsFromTop: "+pixelsFromTop);
		if (untouchedAppntsFromTop % 1 !== 0){
// 				console.log(untouchedAppntsFromTop % 1);
			//if the appnt doesn't align with standard boundries - i.e, 15 mins
// 				console.log(extraPixels);
			pixelsFromTop += getRowHeight() *
			(untouchedAppntsFromTop % 1);
		}
		console.log("Editing: "+Session.get("currentlyEditingDoc"))
		if(Session.equals("currentlyEditingDoc", thisobj._id) && thisobj._id)/*if _id is null we are a blockout*/ {
			console.log("This is me, setting scrollToPoint");
			Session.set("scrollToPoint", pixelsFromTop);
		}
		return pixelsFromTop + "px";
	}
}