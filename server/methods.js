Meteor.methods({
    newUser: function () {
        if (Roles.userIsInRole(this.userId, 'admin')) {
            return ret = Accounts.createUser({
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
            return Accounts.setPassword(userId, pass);
        }
    },
    getAppointmentById: function (id) {
        //used to get the appointment object when the date is unknown but ID is known
        //specifically, when editing a non-today appointment.
        if (this.userId) {
            return appointmentList.findOne(id);
        }
    },
});

//TODO: Define a method which removes a provider and ALL dependants
