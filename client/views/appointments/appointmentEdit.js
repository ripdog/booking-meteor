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
		goHome();
	},
	'click #deleteAppointment': function() {
		if (confirm("Are you sure you want to delete this appointment?")) {
			appointmentList.remove(Session.get("currentlyEditingDoc"));
			goHome();
		}
	}

});
Template.insertAppointmentForm.rendered = function() {
	console.log("appointment edit rendered");
	$('input[name="time"]').change(function() {
		if (Router.current().route.getName() === "newAppointment" ||
			Router.current().route.getName() === "bookingTable") {
			newAppointment($('input[name="time"]').val());
		}
	});
	$('#datetimepicke4').on("dp.change", function () {
		if (Router.current().route.getName() === "newAppointment" ||
			Router.current().route.getName() === "bookingTable") {
			newAppointment($('input[name="time"]').val());
		}
	});
	//if(Session.get('formForInsert')) {
	//	AutoForm.resetForm("insertAppointmentFormInner");
	//}
	// $('tr.timeRow.bg-success').removeClass('bg-success');
	// $("td:contains("+$('input[name="time"]').val()+")").parent().addClass('bg-success');
};
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
			var provObject = getProvObject(Session.get("date"), Session.get('selectedProviderName'));
			try {return provObject.appointmentLength}
			catch (e) {
				console.log("looking for appointment length too early.");
				return 15;
			}//this error doesn't matter, it means the unusualDays
			// and Providers collections aren't filled yet.
			//will be fixed for real when iron router is used for appointment editing
			///creation
		} else {//update, grab length from current doc
			return appointmentList.findOne(Session.get("currentlyEditingDoc")).length;
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
			if (Session.get('newTime') && typeof Session.get('newTime') !== "undefined") {
				return Session.get("newTime");
			} else {
				return "12:00 PM";
			}
		} else {
			return appointmentList.findOne(Session.get("currentlyEditingDoc")).time;
		}
	},
	currentDoc: function() {return appointmentList.findOne(Session.get("currentlyEditingDoc"))},
	deleteButtonClass: function() {if (Session.get("formForInsert")) {
		return "hidden";
	}}

});
AutoForm.hooks({
	insertAppointmentFormInner: {
		beginSubmit: function(fieldId, template) {
			var thealert = $('#insertSuccessAlert');
			thealert[0].innerHTML = "Submitting...";
			thealert.show("fast");
			thealert.attr("disabled", true);
		},

		onSuccess: function(formType, result) {
			var thealert = $('#insertSuccessAlert');
			if(formType === "update") {
				thealert[0].innerHTML = "Appointment Successfully Edited.";
			} else {
				thealert[0].innerHTML = "New Appointment Created.";
			}
			thealert.removeClass('alert-danger alert-info alert-info alert-success');
			thealert.addClass('alert-success');
			thealert.removeClass('bg-success');
			this.resetForm();
			closeTimeout = Meteor.setTimeout(function() {
				$('#insertSuccessAlert').hide("slow");
				goHome();
			}, 3000);
		},
		docToForm: function(doc){
			console.log('running docToForm on route: '+Router.current().route.getName());
			if (doc.date instanceof Date) {
				doc.time = moment(doc.date).format("h:mm A");
			}
			return doc;
		},
		formToDoc: function(doc) {
			if (typeof doc.time === "string") {
				var datestring = moment(Session.get("date")).tz("Pacific/Auckland").format("YYYY-MM-DD ") + doc.time;
				//the time is localtime, the date is utc. Set the date to localtime, add the time
				//then convert back to utc.
				doc.date = moment(datestring, "YYYY-MM-DD hh:mm A").utc().toDate();
			}
			doc.providerName = Session.get("selectedProviderName");
			return doc;
		},
		formToModifier: function(doc) {
			if (typeof doc.$set.time === "string") {
				var datestring = moment(Session.get("date")).tz("Pacific/Auckland").format("YYYY-MM-DD ").concat(doc.$set.time);
				//the time is localtime, the date is utc. Set the date to localtime, add the time
				//then convert back to utc.
				doc.$set.date = moment(datestring, "YYYY-MM-DD hh:mm A").utc().toDate();
			}
			doc.$set.providerName = Session.get("selectedProviderName");
			return doc;
		},
		onError: function(formtype, error) {
			//console.log('running onError!');
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
			_.each(error.invalidKeys, function(invalidKey) {
				if (invalidKey.type === "overlappingDates") {
					appointmentList.simpleSchema().namedContext("insertAppointmentFormInner").addInvalidKeys([{
						name: "time",
						type: invalidKey.type,
						value: moment(invalidKey.value).format("h:mm A")
					}])
				}
				else if (invalidKey.type === "dateOutOfBounds") {
					var provObject;
					try {
						//var cleanDate = moment(template.data.doc.date).startOf("day");
						provObject = getProvObject(Session.get("date"), Session.get('selectedProviderName'));
					} catch (e) {
						//cleanDate = moment(Session.get('date')).startOf('day');
						provObject = getProvObject(Session.get("date"), Session.get('selectedProviderName'));
					}

					appointmentList.simpleSchema().namedContext("insertAppointmentFormInner").addInvalidKeys([{
						name: "time",
						type: invalidKey.type,
						value: provObject.startTime + " and " + provObject.endTime
					}])
				}
				else if (invalidKey.type === "overlappingBlockout") {
					appointmentList.simpleSchema().namedContext("insertAppointmentFormInner").addInvalidKeys([{
						name: "time",
						type: invalidKey.type
						//value: moment(invalidKey.value).format("h:mm A")
					}])
				}
			});
		},
		after: {
			insert: function(error, result) {//TODO: When appointment is made, use the data-id var
				//console.log('running after insert!');
				//to find it in the appointment list and bounce it!
				if (error) {
					console.log("Insert Error:", error);
					//$("#insertSuccessAlert").alert();
				} else {
					console.log("Insert Result:", result);
				}
			},
			update: function(error, result) {
				//console.log('running after insert!');
				//to find it in the appointment list and bounce it!
				if (error) {
					console.log("update Error:", error);
					//$("#insertSuccessAlert").alert();
				} else {
					console.log("update Result:", result);
				}
			}
		}
	}
});