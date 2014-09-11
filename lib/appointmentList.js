appointmentList = new Meteor.Collection("appointmentList");
appointmentList.attachSchema(new SimpleSchema({
	firstname: {
		type: String,
		label: "First Name",
		max: 100
	},
	lastname: {
		type: String,
		label: "Last Name",
		max: 100
	},
	phone: {
		type: Number,
		label: "Phone Number",
		optional: true
	},
	notes: {
		type: String,
		label: "Notes",
		optional: true
	},
	date: {
		type: Date,
		label: "Date",
		custom: function() {
			var cleanDate = moment(this.value).startOf('day');
			var provObject = unusualDays.findOne({date: cleanDate.toDate(), providerID: this.field("providerID").value});
			// console.log(provObject);
			if (typeof provObject === "undefined") {
				provObject = providers.findOne(this.field("providerID").value);
			}
			//this may fail due to timezone? try on nz timezone server.
			if(moment(this.value).isValid() === false) {
				return "wtf"
			}

			else if (moment(this.value).isBefore(cleanDate.zone(-12).hours(provObject.startTime).utc())) {
				return "dateOutOfBounds"
			}
			else if (moment(this.value).isAfter(cleanDate.zone(-12).hours(provObject.endTime).utc())) {
				return "dateOutOfBounds"
			}
			var currentAppoint = this.value;
			var currentAppointEnd = moment(currentAppoint).add(parseInt(this.field("length").value), 'minutes');
			var currentRange = moment(currentAppoint).twix(currentAppointEnd);
			var appoints = appointmentList.find().fetch();
			for (var appointIndex in appoints) {
				var comparedAppoint = appoints[appointIndex];
				var comparedRange = moment(comparedAppoint.date).twix(moment(comparedAppoint.date).add(comparedAppoint.length, "minutes"))
				// console.log("Comparing " + currentRange.format() + " with " + comparedRange.format());
				var overlaps = currentRange.overlaps(comparedRange);
				// console.log(overlaps);

				if (overlaps) {
					if (Meteor.isServer) {
						if (!(this.docId === comparedAppoint._id)) {
							console.log("different appointments clashing");
							return "overlappingDates";
						}
					}
					else if (Meteor.isClient) {
						if (!(Session.get("currentlyEditingAppointment") === comparedAppoint._id)) {
							console.log("different appointments clashing");
							return "overlappingDates";
						}
					}
				}
			} 
		}
		
// 		for Max/min, query the providers collection first
		//for an unusual day start/end time,
		//if none, just grab said providers normal start and end
	},
	time: {
		type: String,
		label: "Time",
 		regEx: /^[0-2]?\d:\d\d [APap]m|M$/,
	},
	length: {
		type: Number,
		label: "Appointment length",
		min: 5,
// 		defaultValue: function() {
// 			return Session.get("appntlength")
// 		},
		custom: function(){
			if (this.value % 5 !== 0){
				return "multiple";
			}
		}
	},
	providerID: {
		type: String,
		label: "Provider ID",
	},
	createdAt: {
		type: Date,
		autoValue: function() {
			if (this.isInsert) {
				return new Date();
			} else if (this.isUpsert) {
				return {$setOnInsert: new Date()};
			} else {
				this.unset();
			}
		}
	},
}));
appointmentList.simpleSchema().messages({
	multiple: "[value] must be a multiple of 5.", 
	overlappingDates:"That time overlaps another appointment.",
	dateOutOfBounds: "Appointment time must be within [value] o'clock."
});
