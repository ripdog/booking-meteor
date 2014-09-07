providers =  new Meteor.Collection("providers");
providers.attachSchema(new SimpleSchema({
	name: {
		type: String,
		label: "Name"
	},
	startTime: {
		type: Number,
		label: "Usual Start Hour",
		min: 0,
		max: 22,
		//TODO: When this is set, verify that no
		//current appointments voilate the new boundries
		defaultValue: 9,
		custom: function(){
			if (this.field("endTime").value <= this.value){
				return "Start Time must be before End Time."
			};
		}
	},
	endTime: {
		type: Number,
		label: "Usual End Hour (24h)",
		min: 1,
		max: 23,
		defaultValue: 17,
		custom: function(){
			if (this.field("startTime").value >= this.value){
				return "Default Start Time must be before Default End Time."
			};
		}
	},
	appointmentLength: {
		type: Number,
		label: "Usual Appointment Length",
		min: 5,
		max: 120,
		defaultValue: 15,
		custom: function(){
			if (this.value % 5 !== 0){
				return "Usual Appointment Length must be a multiple of 5";
			}
		}
	},
	// unusualDays: {
	// 	type: [Object],
	// 	label: "Days with unusual Start or End times",
	// 	optional: true
	// },
// 	"unusualDays.$.date": {
// 		type: Date,
// // 		unique: true
// 	},
// 	"unusualDays.$.startTime": {
// 		type:Number,
// 		min: 0,
// 		max: 23,
// 		defaultValue: 9,
// 	},
// 	"unusualDays.$.endTime": {
// 		type:Number,
// 		min: 1,
// 		max: 24,
// 		defaultValue: 17,
// 		custom: function(){
// 			if (this.siblingField("startTime").value >= this.value){
// 				return "Start Time must be before End Time."
// 			};
// 		}
// 	}
}));
if (Meteor.isServer){
	if (providers.find({}).fetch().length === 0) {
		providers.insert({name: "Default Provider"})
	}
}

// console.log(providers.find().fetch())
