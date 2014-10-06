
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
Template.insertAppointmentForm.events({
	'click #closeBookingEditor': function() {
		$('td.rowContent.bg-success').removeClass('bg-success');
		Router.go('/');
	},
	'click #deleteAppointment': function() {
		if (confirm("Are you sure you want to delete this appointment?")) {
			appointmentList.remove(Session.get("currentlyEditingAppointment"));
			Router.go('/');
		}
	}

})
Template.insertAppointmentForm.rendered = function() {
	console.log("appointment edit rendered");
	$('input[name="time"]').change(function() {
		if (Router.current().route.name === "newAppointment" || 
			Router.current().route.name === "bookingTable") {
			Router.go("newAppointment", {time: $('input[name="time"]').val()});
		};
	});
	$('#datetimepicker4').on("dp.change", function(e) {
		if (Router.current().route.name === "newAppointment" || 
			Router.current().route.name === "bookingTable") {
			Router.go("newAppointment", {time: $('input[name="time"]').val()});
		};
	})
	// $('tr.timeRow.bg-success').removeClass('bg-success');
	// $("td:contains("+$('input[name="time"]').val()+")").parent().addClass('bg-success');
}
Template.insertAppointmentForm.helpers({
	appointmentList: appointmentList,
	title: function(){
		if (Session.get("formForInsert")) {
			return "Add New Appointment"
		} else {
			return "Editing Appointment";
		}
		
	},
	subtitle: function() {
		if (Session.get("formForInsert")) {
			var momentobj = moment(Session.get("date"));
			var ret = momentobj.format("dddd, MMMM Do GGGG");
			return "New Appointment for " + ret + " -"+ dayDelta(Session.get("date"));
		} else {}
	},
	savebuttontext: function() {
		if (Session.get("formForInsert")) {
			return "Create New Appointment"
		} else {
			return "Update Appointment"
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
				console.log("looking for appointment length too early.")
				return 0;
			}//this error doesn't matter, it means the unusualDays
			// and Providers collections aren't filled yet.
			//will be fixed for real when iron router is used for appointment editing
			///creation
		} else {//update, grab length from current doc
			appointmentList.findOne(Session.get("currentlyEditingAppointment")).length
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
	timePreset: function() {
		if (Session.get("formForInsert")) {
			// $('#datetimepicker4').data("DateTimePicker").setDate(moment().local().startOf('day').hours(12));
			if (!(Session.get("newTime") === "undefined")) {
				return Session.get("newTime");
			} else {
				return "12:00 PM";
			}
		} else {
			// $('#datetimepicker4').data("DateTimePicker").setDate(appointmentList.findOne(Session.get("currentlyEditingAppointment")).date);
			return appointmentList.findOne(Session.get("currentlyEditingAppointment")).time;
		}
	},
	currentDoc: function() {return appointmentList.findOne(Session.get("currentlyEditingAppointment"))},
	deleteButtonClass: function() {if (Session.get("formForInsert")) {
		return "hidden";
	}}

});
AutoForm.hooks({
	insertAppointmentFormInner: {
		beginSubmit: function(fieldId, template) {
			$('#insertSuccessAlert')[0].innerHTML = "Submitting...";
			$('#insertSuccessAlert').show("fast");
			$('#saveAppointChanges').attr("disabled", true);
		},
		endSubmit: function(fieldId, template) {
			// 
		},
		onSubmit: function(doc) {
			//cleaning the form early ensures defaultValues are added. Why is this needed?
			appointmentList.simpleSchema().clean(doc);//DOESNT ACTUALLY WORK LOL
		},
		onSuccess: function(operation, result, template) {
			if(template.data.type === "update") {
				$('#insertSuccessAlert')[0].innerHTML = "Appointment Successfully Edited.";
			} else {
				$('#insertSuccessAlert')[0].innerHTML = "New Appointment Created.";
			}
			$('#insertSuccessAlert').removeClass('alert-danger alert-info alert-info alert-success');
			$('#insertSuccessAlert').addClass('alert-success');
			$('td.rowContent.bg-success').removeClass('bg-success');
			closeTimeout = Meteor.setTimeout(function() {
				Router.go('bookingTable');
			}, 3000);
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
			//	console.log(appointmentList.simpleSchema().namedContext("insertAppointmentFormInner").invalidKeys())
			//This is hacky code to transfer error from the date, where they are detected, to the time, where they are displayed
			//for the user.
			for (var invalidKey in error.invalidKeys) {
				if (error.invalidKeys[invalidKey].type === "overlappingDates") {
					appointmentList.simpleSchema().namedContext("insertAppointmentFormInner").addInvalidKeys([{
						name: "time", 
						type: error.invalidKeys[invalidKey].type, 
						value: moment(error.invalidKeys[invalidKey].value).format("h:mm A")
					}])
				}
				else if (error.invalidKeys[invalidKey].type === "dateOutOfBounds") {
					try {
						var cleanDate = moment(template.data.doc.date).startOf("day");
						var provObject = unusualDays.findOne({date: cleanDate.toDate(), providerID: template.data.doc.providerID});
						if (typeof provObject === "undefined") {
							provObject = providers.findOne(template.data.doc.providerID);
						}
					} catch (e) {
						cleanDate = moment(Session.get('date')).startOf('day');
						provObject = unusualDays.findOne({date: cleanDate.toDate(), providerID: Session.get("selectedProviderId")});
						if (typeof provObject === "undefined") {
							provObject = providers.findOne(Session.get("selectedProviderId"));
						}
					}

					appointmentList.simpleSchema().namedContext("insertAppointmentFormInner").addInvalidKeys([{
						name: "time", 
						type: error.invalidKeys[invalidKey].type, 
						value: provObject.startTime + " and " + provObject.endTime
					}])
				}
			}
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
