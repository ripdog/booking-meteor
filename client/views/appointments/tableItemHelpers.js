

tableItemHeight = function(thisobj) {
		if (thisobj.length == Session.get("appntlength"))
		{
			return getRowHeight() +"px";
		}
		var provObject = getProvObject(Session.get("date"), Session.get('selectedProviderName'));
		var defaultHeight = getRowHeight();
		var pxPerMinute = defaultHeight/provObject.appointmentLength;
		return Math.ceil(pxPerMinute * thisobj.length) + "px";
};
tableItemLeft = function(thisobj) {
	return $(".rowHeader").css("width");
};
tableItemTop = function(thisobj) {
	//console.log(thisobj);
	if (!Session.get('timesRendered')) {
		return 0;
	}
	console.log("TableItemTop being run.");
	if (!thisobj.date) {//this is a blockout
		var datestring = moment(Session.get("date")).tz("Pacific/Auckland").format("YYYY-MM-DD ") + thisobj.time;
		var thedate = moment(datestring, "YYYY-MM-DD hh:mm A");
		// console.log(thedate);
	} else {
		thedate = moment(thisobj.date);
	}

	var provObject = getProvObject(Session.get("date"), Session.get('selectedProviderName'));

	//numFromTop is the number of minutes from the beginning of the day this item is
	var numFromTop = (moment(thedate).unix() -
				  moment(Session.get("date")).hours(provObject.startTime).unix())/60;

	if(numFromTop/provObject.appointmentLength === 0){//special case for first item of the day.
		return "37px";
		//return $("thead th").css("height");
	}
	else
	{
		var untouchedAppntsFromTop = (numFromTop/provObject.appointmentLength)+1;
		if (untouchedAppntsFromTop > $(".timeRow").length+1 || //if the appointment is after today, it will
				//be on a row too 'low'
			untouchedAppntsFromTop < 0) { //or too 'high' (above 0)
			//This protects against exceptions when system tries to render appointments
			//on wrong days.
			return 0;
		}

		var appntsFromTop = Math.floor(untouchedAppntsFromTop);
	 		// console.log(this.date + " is  " + untouchedAppntsFromTop + " appoints from the top.");
		//try {
			//var pixelsFromTop = $(".timeRow:nth-child("+appntsFromTop+")")[0].offsetTop;
			var pixelsFromTop = 37*appntsFromTop;
		//}
		//catch (exc) {
		//	//console.log(appntsFromTop);
		////	console.log("exception caught, rendering too early, hold off.");
		//	rerenderDep.changed();
		//}
		// console.log("PixelsFromTop: "+pixelsFromTop);
		if (untouchedAppntsFromTop % 1 !== 0){
//// 				console.log(untouchedAppntsFromTop % 1);
//			//if the appnt doesn't align with standard boundries - i.e, 15 mins
//// 				console.log(extraPixels);
			pixelsFromTop += getRowHeight() *
			(untouchedAppntsFromTop % 1);
		}
		//console.log("Editing: "+Session.get("currentlyEditingDoc"))
		if(Session.equals("currentlyEditingDoc", thisobj._id) && thisobj._id)/*if _id is null we are a blockout*/ {

			Session.set("scrollToPoint", pixelsFromTop);
		}
		return pixelsFromTop + "px";
	}
};