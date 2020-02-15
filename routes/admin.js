var express = require("express");
var router = express.Router();
var firebase = require("firebase");

router.get("/", function(req, res) {
  if (!req.session.isAdmin) {
    res.redirect("/");
  }
  let count = {
    users: 0,
    drivers: 0,
    trucks: 0,
    bookings: 0
  };
  firebase
    .database()
    .ref()
    .child("Users")
    .orderByChild("type")
    .equalTo(0)
    .once("value")
    .then(users => {
      count.users = users.numChildren();
      firebase
        .database()
        .ref()
        .child("Users")
        .orderByChild("type")
        .equalTo(1)
        .once("value")
        .then(drivers => {
          count.drivers = drivers.numChildren();
          firebase
            .database()
            .ref()
            .child("Trucks")
            .once("value")
            .then(trucks => {
              count.trucks = trucks.numChildren();
              firebase
                .database()
                .ref()
                .child("Bookings")
                .once("value")
                .then(bookings => {
                  count.bookings = bookings.numChildren();
                  res.render("pages/index", {
                    count: count,
                    session: req.session
                  });
                });
            });
        });
    })
    .catch(e => {
      res.render("pages/index", { count: count });
    });
});

router.get("/addDriver", function(req, res) {
  if (!req.session.isAdmin) {
    res.redirect("/");
  }
  res.render("pages/addDriver", { error: "", session: req.session });
});

router.post("/addDriver", function(req, res) {
  if (!req.session.isAdmin) {
    res.redirect("/");
  }
  if (req.body.driverPassword === req.body.driverPasswordConfirmation) {
    let driver = {
      id: req.body.driverEmail,
      email: req.body.driverEmail,
      licenseNumber: req.body.driverLicenseNumber,
      firstName: req.body.driverFirstName,
      lastName: req.body.driverLastName,
      image: "",
      phoneNumber: req.body.driverPhoneNumber,
      type: 1
    };
    firebase
      .auth()
      .createUserWithEmailAndPassword(
        req.body.driverEmail,
        req.body.driverPassword
      )
      .then(user => {
        var id = req.body.driverEmail.replace("@", "-");
        id = id.replace(/\./g, "_");
        driver.id = id;
        firebase
          .database()
          .ref()
          .child("Users")
          .child(driver.id)
          .set(driver)
          .then(d => {
            res.redirect("/admin/allDrivers");
          });
      })
      .catch(error => {
        res.render("pages/addDriver", {
          error: error.message,
          session: req.session
        });
      });
  } else {
    res.render("pages/addDriver", {
      error: "Password does not match",
      session: req.session
    });
  }
});

router.get("/allDrivers", function(req, res) {
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
    .then(data => {
      drivers = data;
      res.render("pages/allDrivers", {
        drivers: drivers,
        session: req.session
      });
    })
    .catch(e => {
      res.render("pages/allDrivers", {
        drivers: drivers,
        session: req.session
      });
    });
});

router.get("/driverdetail", function(req, res) {
  if (!req.session.isAdmin) {
    res.redirect("/");
  }
  let driver;
  let id = req.query.id;
  firebase
    .database()
    .ref()
    .child("Users")
    .child(id)
    .once("value")
    .then(data => {
      driver = data;
      res.render("pages/driverDetail", {
        driver: driver,
        session: req.session
      });
    })
    .catch(error => {
      res.redirect("/admin/allDrivers");
    });
});

router.get("/editdriver", function(req, res) {
  if (!req.session.isAdmin) {
    res.redirect("/");
  }
  let id = req.query.id;
  firebase
    .database()
    .ref()
    .child("Users")
    .child(id)
    .once("value")
    .then(data => {
      let driver = data;
      res.render("pages/editDriver", { driver: driver, session: req.session });
    })
    .catch(error => {
      res.redirect("/admin/allDrivers");
    });
});
router.post("/editdriver", function(req, res) {
  if (!req.session.isAdmin) {
    res.redirect("/");
  }
  let updatedDriver = {
    id: req.body.id,
    email: req.body.driverEmail,
    licenseNumber: req.body.driverLicenseNumber,
    firstName: req.body.driverFirstName,
    lastName: req.body.driverLastName,
    phoneNumber: req.body.driverPhoneNumber
  };
  firebase
    .database()
    .ref()
    .child("Users")
    .child(updatedDriver.id)
    .once("value")
    .then(data => {
      let driver = data.val();
      driver.email = updatedDriver.email;
      driver.licenseNumber = updatedDriver.licenseNumber;
      driver.firstName = updatedDriver.firstName;
      driver.lastName = updatedDriver.lastName;
      driver.phoneNumber = updatedDriver.phoneNumber;
      firebase
        .database()
        .ref()
        .child("Users")
        .child(driver.id)
        .set(driver)
        .then(function() {
          res.redirect("/admin/allDrivers");
        });
    })
    .catch(error => {
      res.redirect("/admin/allDrivers");
    });
});

router.get("/allusers", function(req, res) {
  if (!req.session.isAdmin) {
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
    .then(data => {
      users = data;
      res.render("pages/allUsers", { users: users, session: req.session });
    })
    .catch(e => {
      res.render("pages/allUsers", { users: users, session: req.session });
    });
});

router.get("/userinfo", function(req, res) {
  if (!req.session.isAdmin) {
    res.redirect("/");
  }
  let id = req.query.id;
  firebase
    .database()
    .ref()
    .child("Users")
    .child(id)
    .once("value")
    .then(data => {
      let user = data;
      res.render("pages/userinfo", { user: user, session: req.session });
    })
    .catch(error => {
      res.redirect("/admin/allusers");
    });
});

router.get("/addTruck", function(req, res) {
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
    .then(data => {
      drivers = data;
      res.render("pages/addTruck", { drivers: drivers, session: req.session });
    })
    .catch(e => {
      res.redirect("/admin/allTrucks");
    });
});

router.post("/addTruck", function(req, res) {
  if (!req.session.isAdmin) {
    res.redirect("/");
  }
  let id = firebase
    .database()
    .ref()
    .child("Trucks")
    .push().key;
  let truck = {
    id: id,
    driverId: req.body.driver,
    truckModel: req.body.truckmodel,
    registrationNumber: req.body.TruckRegistrationNumber,
    truckCapacity: req.body.truckCapacity
  };
  firebase
    .database()
    .ref()
    .child("Trucks")
    .child(truck.id)
    .set(truck)
    .then(function() {
      res.redirect("/admin/allTrucks");
    })
    .catch(function(error) {
      res.redirect("/admin/allTrucks");
    });
});

router.get("/allTrucks", function(req, res) {
  if (!req.session.isAdmin) {
    res.redirect("/");
  }
  let trucks = [];
  firebase
    .database()
    .ref()
    .child("Trucks")
    .once("value")
    .then(data => {
      trucks = data;
      res.render("pages/allTrucks", { trucks: trucks, session: req.session });
    })
    .catch(e => {
      res.render("pages/allTrucks", { trucks: trucks, session: req.session });
    });
});

router.get("/truckdetail", function(req, res) {
  if (!req.session.isAdmin) {
    res.redirect("/");
  }
  let truck = [];
  let driver = [];
  let id = req.query.id;
  firebase
    .database()
    .ref()
    .child("Trucks")
    .child(id)
    .once("value")
    .then(data => {
      truck = data;
      let did = truck.val().driverId;
      firebase
        .database()
        .ref()
        .child("Users")
        .child(did)
        .once("value")
        .then(driverData => {
          driver = driverData;
          res.render("pages/trucksDetail", {
            truck: truck,
            driver: driver,
            session: req.session
          });
        });
    })
    .catch(error => {
      res.redirect("/admin/allTrucks");
    });
});

router.get("/edittruck", function(req, res) {
  if (!req.session.isAdmin) {
    res.redirect("/");
  }
  let id = 0;
  let truck = [];
  let drivers = [];
  (id = req.query.id),
    firebase
      .database()
      .ref()
      .child("Trucks")
      .child(id)
      .once("value")
      .then(data => {
        truck = data;
        let did = truck.val().driverId;
        firebase
          .database()
          .ref()
          .child("Users")
          .orderByChild("type")
          .equalTo(1)
          .once("value")
          .then(driverData => {
            drivers = driverData;
            res.render("pages/editTruck", {
              truck: truck,
              drivers: drivers,
              session: req.session
            });
          });
      })
      .catch(error => {
        res.json(error);
      });
});

router.post("/edittruck", function(req, res) {
  if (!req.session.isAdmin) {
    res.redirect("/");
  }
  let id = 0;
  id = req.body.id;
  let trucks = {
    id: id,
    truckCapacity: req.body.capacity,
    registrationNumber: req.body.registration,
    truckModel: req.body.model,
    driverId: req.body.driver
  };
  firebase
    .database()
    .ref()
    .child("Trucks")
    .child(id)
    .set(trucks)
    .then(function() {
      res.redirect("/admin/allTrucks");
      //   res.redirect("/admin/alltrucks");
    })
    .catch(error => {
      //   res.json(error);
      res.redirect("/admin/allTrucks");
    });
});

module.exports = router;
