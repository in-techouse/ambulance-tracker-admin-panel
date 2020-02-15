var express = require("express");
var router = express.Router();
var firebase = require("firebase");
const firebaseConfig = {
  apiKey: process.env.API_KEY,
  authDomain: process.env.AUTH_DOMAIN,
  databaseURL: process.env.DATABASE_URL,
  projectId: process.env.PROJECT_ID,
  storageBucket: process.env.STORAGE_BUCKET,
  messagingSenderId: process.env.MESSAGING_SENDER_ID,
  appId: process.env.APP_ID,
  measurementId: process.env.MEASURMENT_ID
};
firebase.initializeApp(firebaseConfig);

router.get("/", function(req, res) {
  if (req.session.isAdmin) {
    res.redirect("/admin");
  }
  res.render("pages/auth/login", { error: "" });
});

router.post("/", function(req, res) {
  if (req.session.isAdmin) {
    res.redirect("/admin");
  }
  firebase
    .auth()
    .signInWithEmailAndPassword(req.body.email, req.body.password)
    .then(are => {
      var id = req.body.email.replace("@", "-");
      id = id.replace(/\./g, "_");

      firebase
        .database()
        .ref()
        .child("Admins")
        .child(id)
        .once("value")
        .then(data => {
          if (
            data === null ||
            data === undefined ||
            data.val() === null ||
            data.val === undefined
          ) {
            res.render("pages/auth/login", {
              error: "You are not authorized to login here"
            });
          } else {
            req.session.adminId = data.val().id;
            req.session.name = data.val().name;
            req.session.email = req.body.email;
            req.session.isAdmin = true;
            res.redirect("/admin");
          }
        })
        .catch(e => {
          res.render("pages/auth/login", {
            error: "You are not authorized to login here"
          });
        });
    })
    .catch(e => {
      res.render("pages/auth/login", { error: e.message });
    });
});

router.get("/forgotPassword", function(req, res) {
  if (req.session.isAdmin) {
    res.redirect("/admin");
  }
  res.render("pages/auth/forgotPassword", { error: "", success: "" });
});

router.post("/forgotPassword", function(req, res) {
  if (req.session.isAdmin) {
    res.redirect("/admin");
  }
  firebase
    .auth()
    .sendPasswordResetEmail(req.body.email)
    .then(r => {
      res.render("pages/auth/forgotPassword", {
        error: "",
        success:
          "Instructions to RESET your password has been sent to your email."
      });
    })
    .catch(e => {
      res.render("pages/auth/forgotPassword", {
        error: e.message,
        success: ""
      });
    });
});

router.get("/logout", function(req, res) {
  firebase.auth().signOut();
  req.session.destroy(function(err) {
    if (err) {
      res.negotiate(err);
    }
    res.redirect("/");
  });
});
module.exports = router;
