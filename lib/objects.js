// Appointment = function() {
// 	//firstName, lastName, date, starttime, length
// // 	this.type = type;
// 	this.firstName = "firstName";
// 	this.lastName = "lastName";
// 	this.date = new Date();
// 	this.starttime =  new Date();
// 	this.length =  15;
// 	this._id = new Meteor.Collection.ObjectID();
// 	return this;
// }
// Time = function time(timestr) {
// 	if (timestr._dateobj){
// 		self._dateobj = timestr._dateobj;
// 	}
// 	else if (timestr instanceof Date) {
// 		self._dateobj = timestr;
// 	}
// 	else {
// 		console.log("Time string given: " +timestr);
// 		var re = /^[0-2]?\d:\d\d [APap]M|m$/;
// 		if (!re.exec(timestr)){throw "invalid time format: " + timestr};
// 		var thetimestr = "2001-09-11 " + timestr;
// 		this._dateobj = moment(thetimestr, "YYYY-MM-DD hh:mm a");
// 		if (!this._dateobj.isValid()) {throw "invalid time format: " + timestr};
// 	}
// }
// Time.prototype = {
// 	constructor: Time,
// 	clone: function() {
// 		return new Time(this.toString())
// 	},
// 	equals: function(other) {
// 		if (!(other instanceof Address))
// 			return false;
// 		return this.toString() === other.toString();
// 	},
// 	typeName: function(){
// 		return "Time";
// 	},
// 	setTime: function (timestr){
// 		var re = /^[0-2]?\d:\d\d [APap]M|m$/;
// 		if (!re.exec(timestr)){throw "invalid time format: " + timestr + this};
// 		var thetimestr = "2001-09-11 " + timestr;
// 		this._dateobj = moment(thetimestr, "YYYY-MM-DD hh:mm a");
// 		if (!this._dateobj.isValid()) {throw "invalid time format: " + timestr};
// 	},
// 	getTime: function (){
// 		return this._dateobj.format("hh:mm a");
// 	},
// 	toString: function (){
// 		return this._dateobj.format("hh:mm a");
// 	},
// 	toJSONValue: function (){
// 		return this.toString();
// 	}
// }
