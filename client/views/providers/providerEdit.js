Template.providerEdit.helpers({
	editingProvider: function(){
		return providers.findOne({name: Session.get("selectedProviderName")})
	}
})