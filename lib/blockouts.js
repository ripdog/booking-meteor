blockouts = new Meteor.Collection('blockouts');

blockouts.attachSchema(new SimpleSchema({
	title: {
		type: String,
		label: "Title",
	},
	time: {
		type: String,
		label: "Start Time",
		regEx: /^[0-2]?\d:\d\d [APap]m|M$/,
	},
	date: {
		type: Date,
		label: "Blockout Date",
		custom: function() {
			return checkDate(this);
		}
	},
	length: {
		type: Number,
		label: "Length",
		min:5,
		defaultValue: 15,
		custom: function(){
			if (this.value % 5 !== 0){
				return "mod5";
			}
		}
	},
	providerName: {
		type: String,
		label: "Provider Name"
	}
}));
blockouts.simpleSchema().messages({
	wtf: "What did you do to that poor date oh god",
	multiple: "[value] must be a multiple of 5.",
	overlappingDates:"That time overlaps an appointment.",
	overlappingBlockout:"That time overlaps another blockout.",
	dateOutOfBounds: "Blockout time must be within [value] o'clock."
});
