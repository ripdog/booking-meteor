providers =  new Meteor.Collection("providers");
// blockoutSchema = new SimpleSchema({

// });
// providers.attachSchema(blockoutSchema);
providers.attachSchema(new SimpleSchema({
	name: {
		type: String,
		label: "Name",
		unique: true,
		index: true
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
				return "before"
			}
			if (Meteor.isServer) {
				var appoints = appointmentList.find({providerName: this.field('name').value}).fetch();
				//console.log(appoints);
				for (var appointIndex in appoints) {
					if (appoints.hasOwnProperty(appointIndex)) {
						console.log("comparing " + moment(appoints[appointIndex].date).hours() + " with new hour: "+this.value);
						if (moment(appoints[appointIndex].date).hours() < this.value) {
							return "wouldPushOutOfBounds";
						}
					}
				}
			}
		}
	},
	endTime: {
		type: Number,
		label: "Usual End Hour (24h)",
		min: 1,
		max: 23,
		defaultValue: 17,
		custom: function(){
			//need to get server to iterate over all appointments
			//and check they are still valid in new bounds
			if (Meteor.isServer) {
				var appoints = appointmentList.find({providerName: this.field('name').value}).fetch();
				for (var appointIndex in appoints) {
					if (appoints.hasOwnProperty(appointIndex)) {
						if (moment(appoints[appointIndex].date).hours() > this.value) {
							return "wouldPushOutOfBounds";
						}
					}
				}
			}
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
				return "mod5";
			}
		}
	},
	blockouts: {
		type: [Object],
		// maxCount: 7,
		optional: true
	},
	"blockouts.$.day": {
		type: String,
		label: "Day of week",
		allowedValues: [
		"monday",
		"tuesday",
		"wednesday",
		"thursday",
		"friday",
		"saturday",
		"sunday",
		"all" ]
	},
	"blockouts.$.title": {
		type: String,
		label: "Title"
	},
	"blockouts.$.time": {
		type: String,
		label: "Start Time",
		regEx: /^[0-2]?\d:\d\d [APap]m|M$/,
		autoform: {
			type: "timePicker"
		},
		custom: function() {
			var dateObj = moment(this.value, "h:mm A");
			var compareTwix = moment(dateObj).twix(moment(dateObj).add(this.siblingField('length').value, "minutes"));
			var provObject = providers.findOne(this.docId);
			var exampleTwix = moment().startOf('day').hour(provObject.startTime).twix(
				moment().startOf('day').hour(provObject.endTime));
			if (!exampleTwix.engulfs(compareTwix)) {
				return "dateOutOfBounds"
			}
		}
	},
	"blockouts.$.length": {
		type: Number,
		label: "Length",
		min:5,
		defaultValue: 15,
		autoform: {
			step: 5
		},
		custom: function(){
			if (this.value % 5 !== 0){
				return "mod5";
			}
		}
	}
}));

// blockoutSchema.simpleSchema().messages({
// 	mod5: "[label] must be a multiple of 5",
// })
providers.simpleSchema().messages({
	mod5: "[label] must be a multiple of 5",
	before: "[label] must be before End Time.",
	wouldPushOutOfBounds: "This change would push appointments out of bounds.",
	dateOutOfBounds: "This repeating blockout is out of the usual day for this provider."
});
if (Meteor.isServer){
	if (providers.find({}).fetch().length === 0) {
		providers.insert({name: "Default Provider"})
	}
}

// console.log(providers.find().fetch())
