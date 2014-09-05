Template.providerEdit.helpers({
	editingProvider: function(){
		return providers.findOne({_id: Session.get("selectedProviderId")})
	}
})