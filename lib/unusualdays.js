checkBounds = function() {//ensure no appointments are outside new boundries
	if (Meteor.isServer) {
		try {//existing
			var cleanDate = moment(unusualDays.findOne(this.docId).date);
			var provider = unusualDays.findOne(this.docId).providerID;
		} catch (e) {//new
			cleanDate = moment(this.field("date").value);
			provider = this.field("providerID").value;
		}
		//new start and end of working day
		var startDate = cleanDate.clone().zone(-12).hour(this.value).toDate();
		var endDate = cleanDate.clone().zone(-12).hour(this.field("endTime").value).toDate();
		var dayTwix = moment(startDate).twix(endDate);

		//start and end of day for query
		console.log(cleanDate.format());

		var midnight = moment(cleanDate).startOf("day").toDate();
		var midday = moment(cleanDate).endOf("day").toDate();
		var appoints = appointmentList.find({date: {$gte: midnight, $lt: midday},
			providerID: provider}).fetch();
		_.each(appoints, function(appoint) {
			if(!dayTwix.contains(appoint.date)) {
				return "dateOutOfBounds";
			}
		})
	} else {//client
		try {
			var unusualDay = unusualDays.findOne({date: Session.get('date')}).date;
		} catch (e) { //new unusual day.
			unusualDay = Session.get('date');
		}
		var cleanDate = moment(unusualDay);
		var startDate = cleanDate.zone(-12).hour(this.value).toDate();
		var endDate = cleanDate.zone(-12).hour(this.field("endTime").value).toDate();
		console.log(startDate);
		console.log(endDate);
		var dayTwix = moment(startDate).twix(endDate);
		console.log(dayTwix.format());
	}
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
		autoValue: function() {
			if(!this.isSet) {
				return providers.findOne(this.field("providerID").value)["startTime"];
			}
		},
		//TODO: When this is set, verify that no
		//current appointments voilate the new boundries
		min:1,
		max:23,
		custom: checkBounds
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
			if (this.field("startTime").value >= this.value){
				return "startAfterEnd"
			};
		}
	},
	appointmentLength: {
		type: Number,
		label: "Appointment Length",
		min: 1,
		max: 60,
		custom: function(){
			if (this.value % 5 !== 0){
				return "multiple";
			}
		},
		autoValue: function() {
			if(this.isInsert) {
				// console.log(this)
				// console.log("inserting Appointment Length value of", providers.findOne(this.field("providerID").value)["appointmentLength"])
				return providers.findOne(this.field("providerID").value)["appointmentLength"];
			}
		}
	}
}))
unusualDays.simpleSchema().messages({
	multiple: "[value] must be a multiple of 5.",
	startAfterEnd:"Start Time must be before End Time.",
	endBeforeStart:"End time must be after Before time."
});
