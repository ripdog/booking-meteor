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
			console.log(this);
			console.log(this.field("providerID").value)
			Meteor.call("checkTimes", this.field("date").value, this.field("providerID").value, function(error, response) {
				console.log(error);
				console.log(response);
			})
// 			var minComparison = moment().zone(-12).hours(
// 				providers.findOne(this.field("providerID").value)
// 				.defaultStartTime).toDate();
		}
// 		for Max/min, query the providers collection first
		//for an unusual day start/end time,
		//if none, just grab said providers normal start and end
	},
	time: {
		type: String,
		label: "Time",
 		//regEx: /^[0-2]?\d:\d\d [APap]m|M$/,
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
appointmentList.simpleSchema().messages({multiple: "[value] must be a multiple of 5."});