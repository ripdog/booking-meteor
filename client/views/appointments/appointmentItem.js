Template.appointmentItem.helpers({
	appointmentName: function () {
		return this.firstname + " " + this.lastname;
	},
	appointmentTime: function() {
		return this.time;
	},
	appointmentPhone: function() {
		return this.phone;
	},
	appointmentLength: function() {
		return this.length;
	},
	inbetween: function() {
		//WARNING DIRTY HACK
		//WILL FAIL IF DEFAULT APPNT LENGTH CHANGED
		//TODO: Calculate if the height of 3 internal data blocks
		//will fit inside the container - 10px for padding or so
		//dont forget to depend on rerenderDep!
		if (this.length >= 45) {
			return '<br/>'
		}
		else {
			return " - "
		}
	},
	width: function() {
		// rerenderDep.depend();
		// return $(".rowContent").css("width");
		return "auto";
	},
	height: function() {
		rerenderDep.depend();
		return tableItemHeight(this);
	},
	left: function() {
		rerenderDep.depend();
		return tableItemLeft(this);
	},
	top: function() {
		// rerenderDep.depend();
		return tableItemTop(this);
	},
	itemHighlightClass: function() {
		// console.log(this);
		if(typeof Session.get('currentlyEditingAppointment') !== "undefined" 
			&& Session.get("currentlyEditingAppointment") === this._id) {

			return "being-edited";
		}
	}
});

