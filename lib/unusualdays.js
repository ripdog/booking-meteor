checkBounds = function(thisobj) {
	//used for checking whether the new bounds of an unusual day are valid. Used on creation and on edit of hours
	//validity is determined by whether any appointments are currently out of bounds.
	if (Meteor.isServer) {
		try {//existing
			var cleanDate = moment(unusualDays.findOne(thisobj.docId).date);
			var provider = unusualDays.findOne(thisobj.docId).providerName;
		} catch (e) {//new
			cleanDate = moment(thisobj.field("date").value);
			provider = thisobj.field("providerName").value;
		}
	} else {//client
		try {
			cleanDate = moment(unusualDays.findOne({date: Session.get('date')}).date);
		} catch (e) { //new unusual day.
			cleanDate = moment(Session.get('date'));
		}
		provider = Session.get("selectedProviderName");
	}
	//new start and end of working day
	var providerObj = providers.findOne({name: provider});
	if(thisobj.key ==="startTime") {
		var startDate = cleanDate.clone().tz("Pacific/Auckland").hour(thisobj.value).toDate();
		var endDate = cleanDate.
		clone().
		tz("Pacific/Auckland").
		hour(thisobj.field("endTime").value).
		add(providerObj.appointmentLength, "minutes").
		toDate();
	} else {
		startDate = cleanDate.clone().tz("Pacific/Auckland").hour(thisobj.field("startTime").value).toDate();
		endDate = cleanDate.clone().tz("Pacific/Auckland").hour(thisobj.value).add(providerObj.appointmentLength, "minutes").toDate();
	}

	var dayTwix = moment(startDate).twix(endDate);

	//start and end of day for query
	//console.log(cleanDate.format());

	var midnight = moment(cleanDate).startOf("day").toDate();
	var midday = moment(cleanDate).endOf("day").toDate();//it's not actually midday but fuck the police
	var appoints = appointmentList.find({date: {$gte: midnight, $lt: midday},
		providerName: provider}).fetch();
	var theblockouts = getBlockouts();
	var ret = null;
	_.each(_.union(appoints,theblockouts), function(appoint) {//check each appointment and blockout still fits
		console.log("comparing "+appoint.time+" to "+dayTwix.format());
		//console.log(appoint);
		if (appoint.hasOwnProperty("date")) {
			if(!dayTwix.engulfs(moment(appoint.date).twix(moment(appoint.date).add(appoint.length, 'minutes')))) {
				console.log("fail");
				ret =  "dateOutOfBounds";
			}
		} else { //this is a blockout from the provider
			var blockStartDate = moment(cleanDate.tz('Pacific/Auckland').format('YYYY MM DD ') + appoint.time,
				"YYYY MM DD HH:mm A");
			var blockTwix = moment(blockStartDate).twix(moment(blockStartDate).add(appoint.length, "minutes"));
			if (!(dayTwix.engulfs(blockTwix))) {
				console.log("fail");
				ret =  "dateOutOfBounds";
			}
		}

	});
	return ret;
};
unusualDays = new Meteor.Collection("unusualDays");
unusualDays.attachSchema( new SimpleSchema({
	date: {
		type: Date,
		label: "Date",
		index: 1,
		autoValue: function(isInsert) {
			if(!isInsert) {
				this.unset();
			}
		}
	},
	providerName: {
		type: String,
		label: "Provider Name"
		// custom:
		//TODO: Make sure provider Name exists
	},
	notes: {
		type: String,
		label: "Notes",
		optional: true
	},
	startTime: {
		type: Number,
		label: "Start Time",
		min:1,
		max:23,
		custom: function() {
			if (this.isSet) {
				return checkBounds(this);
			}
		}
	},
	endTime: {
		type: Number,
		label: "End Time (24h time)",
		autoValue: function() {
			if(!this.isSet && this.isInsert && this.field("providerName").isSet) {
				return providers.findOne({name: this.field("providerName").value})["endTime"];
			}
		},
		min:2,
		max:24,
		custom: function(){
			if (this.isSet) {
				if (this.field("startTime").value >= this.value){
					return "startAfterEnd"
				}
				return checkBounds(this);
			}

		}
	},
	appointmentLength: {
		type: Number,
		label: "Appointment Length",
		min: 1,
		max: 60,
		custom: function(){
			if (this.value % 5 !== 0){
				return "mod5";
			}
		},
		autoValue: function() {
			if(this.isInsert && this.field("providerName").isSet) {
				return providers.findOne({name: this.field("providerName").value})["appointmentLength"];
			}
		}
	}
}));
unusualDays.simpleSchema().messages({
	mod5: "[value] must be a multiple of 5.",
	startAfterEnd:"Start Time must be before End Time.",
	endBeforeStart:"End time must be after Before time.",
	dateOutOfBounds: "An Appointment or Blockout would be put out of bounds by this change."
});
