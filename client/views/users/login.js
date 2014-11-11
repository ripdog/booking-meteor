Template.loginPage.rendered = function() {

};

AccountsTemplates.configure({
	// homeRoutePath: function() {
 //    // if(typeof Session.get("loginRedirect") !== "undefined") {
 //    //   return '/' + Session.get("loginRedirect");
 //    // } else {
 //      return '/';
 //    // }
 //  },
	redirectTimeout: 1000,
	forbidClientAccountCreation: true,
	showForgotPasswordLink: false
});
//AccountsTemplates.configureRoute('signIn', {
//	redirect: function() {
//    if(typeof Session.get("loginRedirect") !== "undefined") {
//      console.log("redirecting to /" + Session.get("loginRedirect"));
//      Router.go('/' + Session.get("loginRedirect"));
//    } else {
//      Router.go('/');
//    }
//  },
//	name: 'login',
//	path: '/login/:redirect?',
//  template: "login"
//});
// AccountsTemplates.configureRoute('forgotPwd');
AccountsTemplates.removeField('email');
AccountsTemplates.removeField('password');
AccountsTemplates.addFields([
    {
        _id: "username",
        type: "text",
        displayName: "username",
        required: true,
        minLength: 4
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

// Accounts.ui.config({
// 	passwordSignupFields: "USERNAME_ONLY",
// })