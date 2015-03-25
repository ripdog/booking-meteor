jquerycache = {};//cache the jquery calls because they're slow. do em once per route, clearing on every new route.
fillJqueryCache = function() {
	Tracker.autorun (function() {
		Session.get("date");
		Session.get('selectedProviderName');
		console.log('filling the jquery cache');
		jquerycache.theadth = $("thead th").css("height");//table header height
		jquerycache.rowHeight = $(".timeRow")[1].clientHeight;//the first row is different height between browsers.
		jquerycache.headerWidth = parseInt($(".rowHeader").css("width"));
		jquerycache.tableItemHeight = parseInt($('.tableItemData').css('height'));
		// see https://github.com/twbs/bootstrap/issues/16149
	});
};

buildTableItemStyle = function(thisobj) {//centralizing this function improves DRY and
	//allows us to avoid doing any of this expensive stuff until the times table is rendered
	if (!Session.get('timesRendered')) {
		return 0;
	}
	if (typeof jquerycache.theadth === "undefined") {
		fillJqueryCache();
	}
	var height = tableItemHeight(thisobj);
	return "style=\"" +
		"width:auto;max-height:" +height+
		";height:" + height +
		";left:" + tableItemLeft(thisobj) +
		";top:" + tableItemTop(thisobj) +
		";\""
};

highlightItemHelper = function(thisobj) {
	if(typeof Session.get('currentlyEditingDoc') !== "undefined"
		&& Session.get("currentlyEditingDoc") === thisobj._id) {

		return "being-edited";
	}
};

inBetween = function(thisobj) {
	if (!Session.get('timesRendered')) {
		return 0;
	}
	if (typeof jquerycache.theadth === "undefined") {
		fillJqueryCache();
	}
	var provObj = getProvObject(Session.get("date"), Session.get('selectedProviderName'));
	if (((jquerycache.rowHeight/provObj.appointmentLength)*thisobj.length) >= (jquerycache.tableItemHeight * 4)) {
		return '<br/>'
	}
	else {
		return " - "
	}
};

tableItemHeight = function(thisobj) {
		if (thisobj.length == Session.get("appntlength"))
		{
			return jquerycache.rowHeight +"px";
		}
		var provObject = getProvObject(Session.get("date"), Session.get('selectedProviderName'));
		var defaultHeight = jquerycache.rowHeight;
		var pxPerMinute = defaultHeight/provObject.appointmentLength;
		return Math.ceil(pxPerMinute * thisobj.length) + "px";
};
tableItemLeft = function(thisobj) {
	return jquerycache.headerWidth + "px";
};
tableItemTop = function(thisobj) {
	console.log("TableItemTop being run.");
	if (!thisobj.date) {//this is a blockout
		var datestring = moment(Session.get("date")).tz("Pacific/Auckland").format("YYYY-MM-DD ") + thisobj.time;
		var thedate = moment(datestring, "YYYY-MM-DD hh:mm A").toDate();
		// console.log(thedate);
	} else {
		thedate = thisobj.date
	}
	var provObject = getProvObject(Session.get("date"), Session.get('selectedProviderName'));

	var startTime = Session.get("date");
	startTime.setHours(provObject.startTime);
	//numFromTop is the number of minutes from the beginning of the day this item is
	var numFromTop = (thedate.getTime() -
				  startTime.getTime())/1000/60;


	if(numFromTop/provObject.appointmentLength === 0){//special case for first item of the day.
		return jquerycache.theadth;
	}
	else
	{
		var untouchedAppntsFromTop = (numFromTop/provObject.appointmentLength)+1;

		var appntsFromTop = Math.floor(untouchedAppntsFromTop);
		var pixelsFromTop = jquerycache.rowHeight*appntsFromTop;

		if (untouchedAppntsFromTop % 1 !== 0){
//			//if the appnt doesn't align with standard boundries - i.e, 15 mins
			pixelsFromTop += jquerycache.rowHeight *
			(untouchedAppntsFromTop % 1);
		}
		//console.log("Editing: "+Session.get("currentlyEditingDoc"))
		if(Session.equals("currentlyEditingDoc", thisobj._id) && thisobj._id)/*if _id is null we are a blockout*/ {

			Session.set("scrollToPoint", pixelsFromTop);
		}
		return pixelsFromTop + "px";
	}
};