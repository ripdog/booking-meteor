Template.login.rendered = function() {

}

AccountsTemplates.configure({
	homeRoutePath: '/',
	redirectTimeout: 1000,
	forbidClientAccountCreation: false,
	showForgotPasswordLink: false

})
AccountsTemplates.configureRoute('signIn', {
	redirect: '/',
	name: 'login',
	path: '/login',
});
// AccountsTemplates.configureRoute('forgotPwd');
// AccountsTemplates.removeField('email');
AccountsTemplates.removeField('password');
AccountsTemplates.addFields([
  {
      _id: "username",
      type: "text",
      displayName: "username",
      required: true,
      minLength: 4,
  },
  {
  	_id: "password",
  	type: "password",
  	displayName: "password",
  	required: true,
  	minLength:4
  }
  ]);
AccountsTemplates.init();

Accounts.ui.config({
	passwordSignupFields: "USERNAME_ONLY",
})