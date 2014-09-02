Appointment = function() {
	//firstName, lastName, date, starttime, length
// 	this.type = type;
	this.firstName = "firstName";
	this.lastName = "lastName";
	this.date = new Date();
	this.starttime =  new Date();
	this.length =  15;
	this._id = new Meteor.Collection.ObjectID();
	return this;
}
Time = function time(timestr) {
	if (timestr._dateobj){
		self._dateobj = timestr._dateobj;
	}
	else if (timestr instanceof Date) {
		self._dateobj = timestr;
	}
	else {
		console.log("Time string given: " +timestr);
		var re = /^[0-2]?\d:\d\d [APap]M|m$/;
		if (!re.exec(timestr)){throw "invalid time format: " + timestr};
		var thetimestr = "2001-09-11 " + timestr;
		this._dateobj = moment(thetimestr, "YYYY-MM-DD hh:mm a");
		if (!this._dateobj.isValid()) {throw "invalid time format: " + timestr};
	}
}
Time.prototype = {
	constructor: Time,
	clone: function() {
		return new Time(this.toString())
	},
	equals: function(other) {
		if (!(other instanceof Address))
			return false;
		return this.toString() === other.toString();
	},
	typeName: function(){
		return "Time";
	},
	setTime: function (timestr){
		var re = /^[0-2]?\d:\d\d [APap]M|m$/;
		if (!re.exec(timestr)){throw "invalid time format: " + timestr + this};
		var thetimestr = "2001-09-11 " + timestr;
		this._dateobj = moment(thetimestr, "YYYY-MM-DD hh:mm a");
		if (!this._dateobj.isValid()) {throw "invalid time format: " + timestr};
	},
	getTime: function (){
		return this._dateobj.format("hh:mm a");
	},
	toString: function (){
		return this._dateobj.format("hh:mm a");
	},
	toJSONValue: function (){
		return this.toString();
	}
}
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
		max: 100,
		optional: true
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
	},
	time: {
		type: String,//TODO: For greater flexibility, store these as a date.
		//in formToDoc, slap the time together with the date.
		label: "Time",
	//	optional: true,
 		//regEx: /^[0-2]?\d:\d\d [APap]m|M$/,
// 		custom: function(){ //TODO: Custom Max and Min
// 			console.log('Doing validation of time.');
// 			console.log(this.key, this.genericKey, this.definition, this.isSet, this.value);
// 			return true;
// 		}
	},
	length: {
		type: Number,
		label: "Appointment length",
		min: 5,
		defaultValue: function() {
			return Session.get("appntlength")
		}
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

classes = {appointment: Appointment, time: Time};
collections = {apptList: appointmentList}