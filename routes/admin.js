var express = require("express");
var router = express.Router();
var firebase = require("firebase");

// Dashboard Action
router.get("/", function (req, res) {
  if (!req.session.isAdmin) {
    // Check session.
    // If admin is not login, moved to login page.
    res.redirect("/");
  }
  let count = {
    users: 0,
    drivers: 0,
    ambulances: 0,
    bookings: 0,
  };
  // Get all customers, type => Customer
  firebase
    .database()
    .ref()
    .child("Users")
    .orderByChild("type")
    .equalTo(0)
    .once("value") // Android => ValueEventListener, to read data. Web => Once("value"), to read data.
    .then((users) => {
      // Get all customers success case.
      count.users = users.numChildren();
      firebase
        .database()
        .ref()
        .child("Users")
        .orderByChild("type")
        .equalTo(1)
        .once("value")
        .then((drivers) => {
          count.drivers = drivers.numChildren();
          firebase
            .database()
            .ref()
            .child("Ambulances")
            .once("value")
            .then((ambulances) => {
              count.ambulances = ambulances.numChildren();
              firebase
                .database()
                .ref()
                .child("Cases")
                .once("value")
                .then((bookings) => {
                  count.bookings = bookings.numChildren();
                  res.render("pages/admin/dashboard", {
                    count: count,
                    session: req.session,
                    name: "dashboard",
                  });
                });
            });
        });
    })
    .catch((e) => {
      // Get all records failure case.
      res.render("pages/admin/dashboard", { count: count, name: "dashboard" });
    });
});

// Display all users action
router.get("/users", function (req, res) {
  if (!req.session.isAdmin) {
    // Check session.
    // If admin is not login, moved to login page.
    res.redirect("/");
  }
  let users = [];
  firebase
    .database()
    .ref()
    .child("Users")
    .orderByChild("type")
    .equalTo(0)
    .once("value")
    .then((data) => {
      users = data;
      res.render("pages/admin/users", {
        users: users,
        session: req.session,
        name: "users",
      });
    })
    .catch((e) => {
      res.render("pages/admin/users", {
        users: users,
        session: req.session,
        name: "users",
      });
    });
});

router.get("/userDetail", function (req, res) {
  if (!req.session.isAdmin) {
    res.redirect("/");
  }
  let id = req.query.id;
  id = "+" + id;
  id = id.replace(/\s+/g, "");
  firebase
    .database()
    .ref()
    .child("Users")
    .child(id)
    .once("value")
    .then((user) => {
      res.render("pages/admin/userDetail", {
        user: user,
        session: req.session,
        name: "user",
      });
    })
    .catch((e) => {
      res.redirect("/admin/users");
    });
});

router.get("/addDriver", function (req, res) {
  if (!req.session.isAdmin) {
    res.redirect("/");
  }
  res.render("pages/admin/addDriver", {
    error: "",
    session: req.session,
    name: "Add Driver",
  });
});

router.post("/addDriver", function (req, res) {
  if (!req.session.isAdmin) {
    res.redirect("/");
  }
  let driver = {
    email: req.body.driverEmail,
    firstName: req.body.driverFirstName,
    image: "",
    lastName: req.body.driverLastName,
    latitude: 0,
    longitude: 0,
    phone: req.body.driverPhoneNumber,
    licenseNumber: req.body.driverLicenseNumber,
    type: 1,
  };
  firebase
    .database()
    .ref()
    .child("Users")
    .child(driver.phone)
    .set(driver)
    .then((d) => {
      res.redirect("/admin/drivers");
    })
    .catch((e) => {
      res.render("pages/admin/addDriver", {
        error: "Something went wrong. Please try again later",
        session: req.session,
        name: "Add Driver",
      });
    });
});

router.get("/drivers", function (req, res) {
  if (!req.session.isAdmin) {
    res.redirect("/");
  }
  let drivers = [];
  firebase
    .database()
    .ref()
    .child("Users")
    .orderByChild("type")
    .equalTo(1)
    .once("value")
    .then((data) => {
      drivers = data;
      res.render("pages/admin/drivers", {
        drivers: drivers,
        session: req.session,
        name: "drivers",
      });
    })
    .catch((e) => {
      res.render("pages/admin/drivers", {
        drivers: drivers,
        session: req.session,
        name: "drivers",
      });
    });
});

router.get("/driverdetail", function (req, res) {
  if (!req.session.isAdmin) {
    res.redirect("/");
  }
  let id = req.query.id;
  id = "+" + id;
  id = id.replace(/\s+/g, "");
  firebase
    .database()
    .ref()
    .child("Users")
    .child(id)
    .once("value")
    .then((data) => {
      driver = data;
      res.render("pages/admin/driverDetail", {
        driver: driver,
        session: req.session,
        name: "driverDetail",
      });
    })
    .catch((error) => {
      res.redirect("/admin/allDrivers");
    });
});

router.get("/editdriver", function (req, res) {
  if (!req.session.isAdmin) {
    res.redirect("/");
  }
  let id = req.query.id;
  id = "+" + id;
  id = id.replace(/\s+/g, "");
  firebase
    .database()
    .ref()
    .child("Users")
    .child(id)
    .once("value")
    .then((data) => {
      let driver = data;
      res.render("pages/admin/editDriver", {
        driver: driver,
        session: req.session,
        name: "editDriver",
      });
    })
    .catch((error) => {
      res.redirect("/admin/drivers");
    });
});

router.post("/editdriver", function (req, res) {
  if (!req.session.isAdmin) {
    res.redirect("/");
  }
  let updatedDriver = {
    email: req.body.driverEmail,
    firstName: req.body.driverFirstName,
    lastName: req.body.driverLastName,
    licenseNumber: req.body.driverLicenseNumber,
    phone: req.body.driverPhoneNumber,
  };
  firebase
    .database()
    .ref()
    .child("Users")
    .child(updatedDriver.phone)
    .once("value")
    .then((data) => {
      let driver = data.val();
      driver.email = updatedDriver.email;
      driver.licenseNumber = updatedDriver.licenseNumber;
      driver.firstName = updatedDriver.firstName;
      driver.lastName = updatedDriver.lastName;
      firebase
        .database()
        .ref()
        .child("Users")
        .child(driver.phone)
        .set(driver)
        .then(function () {
          res.redirect("/admin/drivers");
        });
    })
    .catch((error) => {
      res.redirect("/admin/drivers");
    });
});

router.get("/addAmbulance", function (req, res) {
  if (!req.session.isAdmin) {
    res.redirect("/");
  }
  let drivers = [];
  firebase
    .database()
    .ref()
    .child("Users")
    .orderByChild("type")
    .equalTo(1)
    .once("value")
    .then((data) => {
      drivers = data;
      res.render("pages/admin/addAmbulance", {
        drivers: drivers,
        session: req.session,
        name: "addAmbulance",
      });
    })
    .catch((e) => {
      res.redirect("/admin/ambulances");
    });
});

router.post("/addAmbulance", function (req, res) {
  if (!req.session.isAdmin) {
    res.redirect("/");
  }
  let id = firebase.database().ref().child("Trucks").push().key;
  let ambulance = {
    id: id,
    driverId: req.body.driver,
    ambulanceModel: req.body.ambulanceModel,
    registrationNumber: req.body.ambulanceRegistrationNumber,
  };
  firebase
    .database()
    .ref()
    .child("Ambulances")
    .child(ambulance.id)
    .set(ambulance)
    .then(function () {
      res.redirect("/admin/ambulances");
    })
    .catch(function (error) {
      res.redirect("/admin/ambulances");
    });
});

router.get("/ambulances", function (req, res) {
  if (!req.session.isAdmin) {
    res.redirect("/");
  }
  let trucks = [];
  firebase
    .database()
    .ref()
    .child("Ambulances")
    .once("value")
    .then((data) => {
      ambulances = data;
      res.render("pages/admin/ambulances", {
        ambulances: ambulances,
        session: req.session,
        name: "ambulances",
      });
    })
    .catch((e) => {
      res.render("pages/admin/ambulances", {
        trucks: trucks,
        session: req.session,
        name: "ambulances",
      });
    });
});

router.get("/ambulanceDetail", function (req, res) {
  if (!req.session.isAdmin) {
    res.redirect("/");
  }
  let id = req.query.id;
  firebase
    .database()
    .ref()
    .child("Ambulances")
    .child(id)
    .once("value")
    .then((data) => {
      let ambulance = data;
      let did = ambulance.val().driverId;
      firebase
        .database()
        .ref()
        .child("Users")
        .child(did)
        .once("value")
        .then((driverData) => {
          let driver = driverData;
          res.render("pages/admin/ambulanceDetail", {
            ambulance: ambulance,
            driver: driver,
            session: req.session,
            name: "ambulanceDetail",
          });
        });
    })
    .catch((error) => {
      res.redirect("/admin/ambulances");
    });
});

router.get("/editAmbulance", function (req, res) {
  if (!req.session.isAdmin) {
    res.redirect("/");
  }
  let id = req.query.id;
  let drivers = [];
  firebase
    .database()
    .ref()
    .child("Ambulances")
    .child(id)
    .once("value")
    .then((data) => {
      let ambulance = data;
      firebase
        .database()
        .ref()
        .child("Users")
        .orderByChild("type")
        .equalTo(1)
        .once("value")
        .then((driverData) => {
          drivers = driverData;
          res.render("pages/admin/editAmbulance", {
            ambulance: ambulance,
            drivers: drivers,
            session: req.session,
            name: "editAmbulance",
          });
        });
    })
    .catch((error) => {
      res.redirect("/admin/ambulances");
    });
});

router.post("/editAmbulance", function (req, res) {
  if (!req.session.isAdmin) {
    res.redirect("/");
  }
  let ambulance = {
    id: req.body.id,
    driverId: req.body.driver,
    ambulanceModel: req.body.ambulanceModel,
    registrationNumber: req.body.ambulanceRegistrationNumber,
  };
  firebase
    .database()
    .ref()
    .child("Ambulances")
    .child(ambulance.id)
    .set(ambulance)
    .then(function () {
      res.redirect("/admin/ambulances");
    })
    .catch((error) => {
      res.redirect("/admin/ambulances");
    });
});

module.exports = router;
