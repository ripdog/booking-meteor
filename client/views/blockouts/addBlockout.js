
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
		goHome();
	},
	'click #deleteBlockoutButton': function() {
		if (confirm("Are you sure you want to delete this blockout?")) {
			goHome();
			blockouts.remove(Session.get("currentlyEditingDoc"));
		}
	}

});
Template.insertBlockoutForm.rendered = function() {
	console.log("rerendering");
	$('#datetimepicker').on("dp.change", function () {
		if (Router.current().route.getName() === "newBlockoutForm") {
			changeParams({time: moment($('input[name="date"]').val(), "h:mm A").format("h-mm-A")});
		}
	});
};

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
		Session.get("newTime");
		if (Session.get("formForInsert")) {
			var provObject = getProvObject(Session.get("date"), Session.get('selectedProviderName'));
			try {return provObject.appointmentLength}
			catch (e) {
				return 0;
			}//this error doesn't matter, it means the unusualDays
			// and Providers collections aren't filled yet.
			//will be fixed for real when iron router is used for appointment editing
			///creation
		} else {//update, grab length from current doc
			return blockouts.findOne(Session.get("currentlyEditingDoc")).length;
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
			if (!(typeof Session.get("newTime") === "undefined")) {
				return Session.get("newTime");
			} else {
				return "12:00 PM";
			}
		} else {
			return blockouts.findOne(Session.get("currentlyEditingDoc")).time;
		}
	},
	currentDoc: function() {return blockouts.findOne(Session.get("currentlyEditingDoc"));},
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
		formToDoc: function(doc){
			doc.providerName = Session.get("selectedProviderName");
			return doc;
		},
		onSuccess: function(operation, result) {
			if(operation === "update") {
				$('#insertSuccessAlert')[0].innerHTML = "Blockout Successfully Edited.";
			} else {
				$('#insertSuccessAlert')[0].innerHTML = "New Blockout Created.";
			}
			var succAlert = $('#insertSuccessAlert');
			succAlert.removeClass('alert-danger alert-info alert-info alert-success');
			succAlert.addClass('alert-success');
			$('td.rowContent.bg-success').removeClass('bg-success');
			closeTimeout = Meteor.setTimeout(function() {
				goHome();
			}, 3000);
		},
		formToModifier: function(doc) {
			doc.$set.providerName = Session.get("selectedProviderName");
			return doc;
		},
		onError: function(operation, error) {
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
			insert: function(error, result) {
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
