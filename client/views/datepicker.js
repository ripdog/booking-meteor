/**
 * Created by Mitchell on 3/12/2015.
 */
Template.datepicker.rendered = function() {

	if($("#datetimepicker1").is(":visible")) {
		$('#datetimepicker1').datetimepicker({
			format: "YYYY-MM-DD"
		});
		Tracker.autorun(function (comp) {
			try {
				$('#datetimepicker1').data("DateTimePicker").date(moment(Session.get("date")));
			} catch (e) {
				//comp.invalidated = true;
				//comp.stopped = false;
			}
		});
		$('#datetimepicker1').on("dp.change", function(e) {
			changeParams({date: e.date.format("YYYY-MM-DD")});
		})
	}
};

