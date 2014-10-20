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
		type: String,
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
		index: true,
		custom: function() {
			//////////////////////////////////////////////////
			/////////////CHECKING DAY BOUNDS
			/////////////////////////////////////////////////
			var cleanDate = moment(this.value).startOf('day');
			var provObject = unusualDays.findOne({date: cleanDate.toDate(), providerID: this.field("providerID").value});
			if (typeof provObject === "undefined") {
				provObject = providers.findOne(this.field("providerID").value);
			}
			//this may fail due to timezone
			console.log("checking "+moment(this.value).format()+" is inside "+ moment(cleanDate).tz("Pacific/Auckland").hours(provObject.startTime).format() + " and "+
				moment(cleanDate).tz("Pacific/Auckland").hours(provObject.endTime).format());
			if(moment(this.value).isValid() === false) {
				return "wtf"
			}

			else if (moment(this.value).isBefore(moment(cleanDate).tz("Pacific/Auckland").hours(provObject.startTime).utc())) {
				return "dateOutOfBounds"
			}
			else if (moment(this.value).isAfter(moment(cleanDate).tz("Pacific/Auckland").hours(provObject.endTime).utc())) {
				return "dateOutOfBounds"
			}
			//////////////////////////////////////////////////
			/////////////CHECKING APPOINTMENT OVERLAP
			/////////////////////////////////////////////////
			var currentAppoint = this.value;
			var currentAppointEnd = moment(currentAppoint).add(parseInt(this.field("length").value), 'minutes');
			var currentRange = moment(currentAppoint).twix(currentAppointEnd);
			var queryStart = moment(this.value).startOf('day').toDate();
			var queryEnd = moment(this.value).endOf('day').toDate();
			console.log(JSON.stringify({date: {$gte: queryStart, $lt:queryEnd},providerID: this.field("providerID").value}));
			var appoints = appointmentList.find({date: {$gte: queryStart, $lt:queryEnd},providerID: this.field("providerID").value}).fetch();
			var ret;
			_.each(appoints, function(comparedAppoint) {
				var comparedRange = moment(comparedAppoint.date)
					.twix(moment(comparedAppoint.date)
						.add(comparedAppoint.length, "minutes"));

				//console.log("Comparing " + currentRange.format() + " with " + comparedRange.format());
				var overlaps = currentRange.overlaps(comparedRange);
				if (overlaps) {
					if (Meteor.isServer) {
						if (!(this.docId === comparedAppoint._id)) {
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
			var blockouts = getBlockouts(moment(cleanDate).format('dddd').toLowerCase(),
				this.field("providerID").value,
				cleanDate.toDate());
			_.each(blockouts, function(comparedBlockout) {
				var blockStartDate = moment(cleanDate.tz('Pacific/Auckland').format('YYYY MM DD ') + comparedBlockout.time,
					"YYYY MM DD HH:mm A");
				var blockEndDate = moment(blockStartDate).add(comparedBlockout.length, 'minutes');
				var blockTwix = moment(blockStartDate).twix(blockEndDate);
				console.log();
				console.log("comparing block " + blockTwix.format() + " with appointment "+ currentRange.format());
				if (blockTwix.overlaps(currentRange)) {
					console.log("dude this overlaps hard");
					ret = "overlappingBlockout";
					return "overlappingBlockout";
				}
			});
			if (typeof ret === "string") {
				return ret;
			}
		}
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
		autoform: {
			value: 15,
		},
		defaultValue: function() {
			console.log("defaultValue called.")
			var cleanDate = moment(this.field("date").value).startOf('day');
			var provObject = unusualDays.findOne({date: cleanDate.toDate(), providerID: this.field("providerID").value});
			if (typeof provObject === "undefined") {
				provObject = providers.findOne(this.field("providerID").value);
			}
			console.log(provObject.appointmentLength)
			return provObject.appointmentLength;
		},
		custom: function(){
			if (this.value % 5 !== 0){
				return "multiple";
			}
		}
	},
	providerID: {
		type: String,
		label: "Provider ID",
		autoform: {
			omit: true
		},
	},
	createdAt: {
		type: Date,
		autoform: {
			omit: true
		},
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
	overlappingBlockout:"That time overlaps a blockout.",
	dateOutOfBounds: "Appointment time must be within [value] o'clock."
});
