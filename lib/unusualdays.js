checkBounds = function(thisobj) {
	//used for checking whether the new bounds of an unusual day are valid. Used on creation and on edit of hours
	//validity is determined by whether any appointments are currently out of bounds.
	if (Meteor.isServer) {
		try {//existing
			var cleanDate = moment(unusualDays.findOne(thisobj.docId).date);
			var provider = unusualDays.findOne(thisobj.docId).providerID;
		} catch (e) {//new
			cleanDate = moment(thisobj.field("date").value);
			provider = thisobj.field("providerID").value;
		}
	} else {//client
		try {
			cleanDate = moment(unusualDays.findOne({date: Session.get('date')}).date);
		} catch (e) { //new unusual day.
			cleanDate = moment(Session.get('date'));
		}
		provider = Session.get("selectedProviderId");
	}
	//new start and end of working day
	if(thisobj.key ==="startTime") {
		var startDate = cleanDate.clone().tz("Pacific/Auckland").hour(thisobj.value).toDate();
		var endDate = cleanDate.clone().tz("Pacific/Auckland").hour(thisobj.field("endTime").value).toDate();
	} else {
		var startDate = cleanDate.clone().tz("Pacific/Auckland").hour(thisobj.field("startTime").value).toDate();
		var endDate = cleanDate.clone().tz("Pacific/Auckland").hour(thisobj.value).toDate();
	}

	var dayTwix = moment(startDate).twix(endDate);

	//start and end of day for query
	console.log(cleanDate.format());

	var midnight = moment(cleanDate).startOf("day").toDate();
	var midday = moment(cleanDate).endOf("day").toDate();
	var appoints = appointmentList.find({date: {$gte: midnight, $lt: midday},
		providerID: provider}).fetch();
	ret = null;
	_.each(appoints, function(appoint) {
		if(!dayTwix.contains(appoint.date)) {
			console.log("fail")
			ret =  "dateOutOfBounds";
		}
	});
	return ret;
}

unusualDays = new Meteor.Collection("unusualDays");
unusualDays.attachSchema( new SimpleSchema({
	date: {
		type: Date,
		label: "Date",
		autoValue: function(isInsert) {
			if(!isInsert) {
				this.unset();
			}
		}
	},
	providerID: {
		type: String,
		label: "Provider ID",
		// custom:
		//TODO: Make sure provider ID exists
	},
	notes: {
		type: String,
		label: "Notes",
		optional: true
	},
	startTime: {
		type: Number,
		label: "Start Time",
		// autoValue: function() {
		// 	if(!this.isSet) {
		// 		return providers.findOne(this.field("providerID").value)["startTime"];
		// 	}
		// },
		//TODO: When this is set, verify that no
		//current appointments voilate the new boundries
		min:1,
		max:23,
		custom: function() {
			if (this.isSet()) {
				return checkBounds(this);
			}
		}
	},
	endTime: {
		type: Number,
		label: "End Time (24h time)",
		autoValue: function() {
			if(!this.isSet) {
				return providers.findOne(this.field("providerID").value)["endTime"];
			}
		},
		min:2,
		max:24,
		custom: function(){
			if (this.isSet()) {
				if (this.field("startTime").value >= this.value){
					return "startAfterEnd"
				};
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
			if(this.isInsert) {
				// console.log(this)
				// console.log("inserting Appointment Length value of", providers.findOne(this.field("providerID").value)["appointmentLength"])
				return providers.findOne(this.field("providerID").value)["appointmentLength"];
			}
		}
	},
	blockouts: {
		type: [Object],
		optional: true,
	},
	"blockouts.$.title": {
		type: String,
		label: "Title",
	},
	"blockouts.$.time": {
		type: String,
		label: "Start Time - Format: hour:minute AM",
		regEx: /^[0-2]?\d:\d\d [APap]m|M$/,
	},
	"blockouts.$.length": {
		type: Number,
		label: "Length",
		min:5,
		defaultValue: 15,
		custom: function(){
			if (this.value % 5 !== 0){
				return "mod5";
			}
		}
	}
}))
unusualDays.simpleSchema().messages({
	mod5: "[value] must be a multiple of 5.",
	startAfterEnd:"Start Time must be before End Time.",
	endBeforeStart:"End time must be after Before time.",
	dateOutOfBounds: "An Appointment would be put out of bounds by this change."
});
