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
		custom: function(){
			if (Meteor.isServer) {
				var cleanDate = moment(unusualDays.findOne(this.docId).date);
				var startDate = cleanDate.zone(-12).hour(this.value)
				var endDate = cleanDate.zone(-12).hour(this.field("endTime").value)
				console.log(startDate.format());
				console.log(endDate.format());
				var dayTwix = startDate.twix(endDate);
				console.log(dayTwix);
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
