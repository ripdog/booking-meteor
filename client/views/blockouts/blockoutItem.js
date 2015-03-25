Template.blockoutItem.helpers({
	blockoutStyle: function() {
		return buildTableItemStyle(this);
	},
	inbetween: function() {
		return inBetween(this);
	},
	itemHighlightClass: function() {
		return highlightItemHelper(this);
	}
});