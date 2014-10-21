
function dayDelta(date) {
	var diff = moment(date).diff(moment().startOf('day'), "days");
	if (diff===1){
		return " tomorrow";
	}
	else if (diff===-1) {
		return " yesterday";
	}
	else if (diff === 0)
	{
		return " today"
	}
	else if (diff > 1)
	{
		return " in " +Math.abs(diff)+ " days"
	}
	else
	{
		return " "+Math.abs(diff)+" days ago"
	}
}
Template.insertBlockoutForm.events({
	'click #closeBlockoutEditor': function() {
		$('td.rowContent.bg-success').removeClass('bg-success');
		Router.go('/');
	},
	'click #deleteBlockoutButton': function() {
		if (confirm("Are you sure you want to delete this blockout?")) {
			// appointmentList.remove(Session.get("currentlyEditingDoc"));
			//TODO: How?
			Router.go('/');
		}
	}

})

Template.insertBlockoutForm.helpers({
	title: function(){
		if (Session.get("formForInsert")) {
			return "Add New Blockout"
		} else {
			return "Editing Blockout";
		}
		
	},
	subtitle: function() {
		if (Session.get("formForInsert")) {
			var momentobj = moment(Session.get("date"));
			var ret = momentobj.format("dddd, MMMM Do GGGG");
			return "New Blockout for " + ret + " -"+ dayDelta(Session.get("date"));
		} else {}
	},
	savebuttontext: function() {
		if (Session.get("formForInsert")) {
			return "Create New Blockout"
		} else {
			return "Update Blockout"
		}
	},
	sessionDate: function(){return Session.get("date")},
	length: function() {
		var lol = Session.get("newTime");
		if (Session.get("formForInsert")) {
			var provObject = unusualDays.findOne({date: Session.get("date"), providerID: Session.get("selectedProviderId")})
			if (typeof provObject === "undefined") {
				provObject = providers.findOne(Session.get("selectedProviderId"))
			}
			try {return provObject.appointmentLength}
			catch (e) {
				// console.log("looking for appointment length too early.")
				return 0;
			}//this error doesn't matter, it means the unusualDays
			// and Providers collections aren't filled yet.
			//will be fixed for real when iron router is used for appointment editing
			///creation
		} else {//update, grab length from current doc
			return unusualDays.findOne(Session.get("currentlyEditingDoc")).length;
		}
	},
	currentType: function() {
		if(Session.get("formForInsert")) {
			return "insert"
		}
		else {
			return "update"
		}
	},
	timePreset: function() {//FIXME
		if (Session.get("formForInsert")) {
			if (!(Session.get("newTime") === "undefined")) {
				return Session.get("newTime");
			} else {
				return "12:00 PM";
			}
		} else {
			return unusualDays.findOne(Session.get("currentlyEditingDoc")).time;
		}
	},
	currentDoc: function() {return unusualDays.findOne({date: Session.get("date")});},
	deleteButtonClass: function() {if (Session.get("formForInsert")) {
		return "hidden";
	}}

});
AutoForm.hooks({
	insertBlockoutFormInner: {
		beginSubmit: function(fieldId, template) {
			var succAlert = $('#insertSuccessAlert');
			succAlert[0].innerHTML = "Submitting...";
			succAlert.show("fast");//possible race condition? If error occours and form is correctly submitted within 3000ms
			$('#saveAppointChanges').attr("disabled", true);
		},
		endSubmit: function(fieldId, template) {
			console.log("endSubmit run!");
			console.log(template)
		},
		docToForm: function(doc){
			if (doc.date instanceof Date) {
				doc.time = moment(doc.date).format("h:mm A");
			}
			try {
				$('#datetimepicker4').data("DateTimePicker").setDate(moment(doc.date));
			} catch (e) {
				$('#datetimepicker4 > input').val(moment(doc.date).format("h:mm A"))
				//TODO: Fallback date setting
			}
			return doc;
		},
		formToDoc: function(doc){
			if (typeof doc.time === "string") {
				var datestring = moment(Session.get("date")).tz("Pacific/Auckland").format("YYYY-MM-DD ") + doc.time;
				//the time is localtime, the date is utc. Set the date to localtime, add the time
				//then convert back to utc.
				doc.date = moment(datestring, "YYYY-MM-DD hh:mm A").utc().toDate();
			}
			doc.providerID = Session.get("selectedProviderId");
			return doc;
		},
		onSuccess: function(operation, result, template) {
			if(template.data.type === "update") {
				$('#insertSuccessAlert')[0].innerHTML = "Blockout Successfully Edited.";
			} else {
				$('#insertSuccessAlert')[0].innerHTML = "New Blockout Created.";
			}
			var succAlert = $('#insertSuccessAlert');
			succAlert.removeClass('alert-danger alert-info alert-info alert-success');
			succAlert.addClass('alert-success');
			$('td.rowContent.bg-success').removeClass('bg-success');
			closeTimeout = Meteor.setTimeout(function() {
				Router.go('bookingTable');
			}, 3000);
		},
		onError: function(operation, error, template) {
			$('#saveAppointChanges').attr("disabled", false);
			var alert = $('#insertSuccessAlert');
			alert.removeClass('alert-danger alert-info alert-info alert-success');
			alert.addClass('alert-danger');
			alert[0].innerHTML = "Uh-oh, something went wrong!";
			alert.show("fast");
			Meteor.setTimeout(function() {
				$('#insertSuccessAlert').hide("slow");
			}, 3000);
		},
		after: {
			insert: function(error, result) {//TODO: When appointment is made, use the data-id var
				//to find it in the appointment list and bounce it!
				if (error) {
					console.log("Insert Error:", error);
					$("#insertSuccessAlert").alert();
				} else {
					console.log("Insert Result:", result);
				}
			}
		}
	}
});
