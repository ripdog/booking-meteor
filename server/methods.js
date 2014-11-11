Meteor.methods({
    newUser: function () {
        if (Roles.userIsInRole(this.userId, 'admin')) {
            return Accounts.createUser({
                username: "newuser",
                email: "fakeEmail@example.com",
                roles: ["booker"]
                // password:"newpass"
            })
        }
    },
    deleteUser: function (id) {
        if (Roles.userIsInRole(this.userId, 'admin')) {
            return Meteor.users.remove(id);
        }
    },
    forcePassword: function (userID, pass) {
        if (Roles.userIsInRole(this.userId, 'admin')) {
            return Accounts.setPassword(userID, pass);
        }
    }
});

//TODO: Define a method which removes a provider and ALL dependants
