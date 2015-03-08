Template.blockoutItem.helpers({
	blockoutTitle: function() {return this.title;},
	blockoutTime: function() {return this.time;},
	blockoutLength: function() {return this.length;},
	top: function() {
		rerenderDep.depend();
		return tableItemTop(this);
	},
	left: function() {
		rerenderDep.depend();
		return tableItemLeft(this);
	},
	height: function() {
		rerenderDep.depend();
		return tableItemHeight(this);
	},
	width: function() {
		return '400px';
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
	itemHighlightClass: function() {
		// console.log(this);
		if(typeof Session.get('currentlyEditingDoc') !== "undefined"
			&& Session.get("currentlyEditingDoc") === this._id) {

			return "being-edited";
		}
	},
	id: function() {
		return this._id;
	}
})