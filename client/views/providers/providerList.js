Template.providerList.helpers({
	providerList: function() {return providers.find();}
});
Template.providerList.events({
	'click .providerName': function(event){
		try {
			AutoForm.resetForm("updateProviderForm")
		} catch (e) {}
		Session.set("selectedProviderName", $(event.currentTarget).data("name"));
	},
	'click .providerDeleteButton': function(event){
		if (confirm("Are you absolutely sure? This will delete *ALL* this providers data and appointments!"))
			{
				if (confirm("ALL appointments and data related to this provider will be deleted. Are you totally, complete, utterly sure?")){
					providers.remove($(event.currentTarget).parent().data("id"), function(err, result) {
						console.log(err);
						console.log(result);
					});
				}
			}
	},
	'click #newProviderButton': function(event){
		providers.insert({name: "New Provider"}, function(error, id) {
			Session.set("selectedProviderName", providers.findOne(id).name);
		});
	}
});
