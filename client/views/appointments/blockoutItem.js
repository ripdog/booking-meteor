Template.blockoutItem.helpers({
	blockoutTitle: function() {return this.title;},
	blockoutTime: function() {return this.time;},
	blockoutLength: function() {return this.length;},
	top: function() {
		rerenderDep.depend();
		return tableItemTop(this);
	}
})