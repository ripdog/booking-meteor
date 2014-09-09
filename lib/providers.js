providers =  new Meteor.Collection("providers");
providers.attachSchema(new SimpleSchema({
	name: {
		type: String,
		label: "Name",
		unique: true
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
			};
			if (Meteor.isServer) {
				var appoints = appointmentList.find({providerID: this.docId}).fetch();
				console.log(appoints);
				for (var appointIndex in appoints) {
					console.log(appoints[appointIndex])
					if (moment(appoints[appointIndex].date).hours < this.value) {
						return "wouldPushOutOfBounds"
					}
				}
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
			//need to get server to iterate over all appointments
			//and check they are still valid in new bounds
			if (Meteor.isServer) {
				var appoints = appointmentList.find({providerID: this.docId}).fetch();
				for (var appointIndex in appoints) {
					if (moment(appoints[appointIndex].date).hours > this.value) {
						return "wouldPushOutOfBounds"
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
	}
}));
providers.simpleSchema().messages({
	mod5: "[label] must be a multiple of 5",
	before: "[label] must be before End Time.",
	wouldPushOutOfBounds: "This change would push appointments out of bounds."
})
if (Meteor.isServer){
	if (providers.find({}).fetch().length === 0) {
		providers.insert({name: "Default Provider"})
	}
}

// console.log(providers.find().fetch())
