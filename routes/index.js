var express = require("express");
var router = express.Router();
var firebase = require("firebase");
// Initialize Firebase
const firebaseConfig = {
  apiKey: process.env.API_KEY,
  authDomain: process.env.AUTH_DOMAIN,
  databaseURL: process.env.DATABASE_URL,
  projectId: process.env.PROJECT_ID,
  storageBucket: process.env.STORAGE_BUCKET,
  messagingSenderId: process.env.MESSAGING_SENDER_ID,
  appId: process.env.APP_ID,
  measurementId: process.env.MEASURMENT_ID,
};
firebase.initializeApp(firebaseConfig);

// Actions => Functions

// First action. Root action.
router.get("/", function (req, res) {
  if (req.session.isAdmin) {
    // Check session.
    // If admin is already login, moved to dashboard.
    res.redirect("/admin");
  }
  // If admin is not logged in, display login page.
  res.render("pages/auth/login", { error: "" });
});

router.post("/", function (req, res) {
  if (req.session.isAdmin) {
    // Check session.
    // If admin is already login, moved to dashboard.
    res.redirect("/admin");
  }
  // Else, do the login working
  firebase
    .auth()
    .signInWithEmailAndPassword(req.body.email, req.body.password)
    .then((are) => {
      // Success function of login
      var id = req.body.email.replace("@", "-");
      id = id.replace(/\./g, "_");
      // Getting admin data from database
      firebase
        .database()
        .ref()
        .child("Admins")
        .child(id)
        .once("value") // Android => ValueEventListener, to read data. Web => Once("value"), to read data.
        .then((data) => {
          // Get admin data success function
          if (
            data === null ||
            data === undefined ||
            data.val() === null ||
            data.val === undefined
          ) {
            res.render("pages/auth/login", {
              error: "You are not authorized to login here.",
            });
          } else {
            req.session.adminId = data.val().id;
            req.session.name = data.val().name;
            req.session.email = req.body.email;
            req.session.isAdmin = true; // Major variable to handle session
            // Move to dashboard. Android => Intent is used to move from one activity to another.
            // Web => res.redirect("pagePath"), is used to move from one page to another.
            res.redirect("/admin");
          }
        })
        .catch((e) => {
          // Get admin data failure function
          res.render("pages/auth/login", {
            error: "You are not authorized to login here.",
          });
        });
    })
    .catch((e) => {
      // Failure function of login, again show login page with error.
      res.render("pages/auth/login", { error: e.message });
    });
});

router.get("/forgotPassword", function (req, res) {
  if (req.session.isAdmin) {
    // Check session.
    // If admin is already login, moved to dashboard.
    res.redirect("/admin");
  }
  // If admin is not logged in, display forgot password page.
  res.render("pages/auth/forgotPassword", { error: "", success: "" });
});

router.post("/forgotPassword", function (req, res) {
  if (req.session.isAdmin) {
    // Check session.
    // If admin is already login, moved to dashboard.
    res.redirect("/admin");
  }
  firebase
    .auth()
    .sendPasswordResetEmail(req.body.email)
    .then((r) => {
      // Success case, password reset instructions are send via email.
      res.render("pages/auth/forgotPassword", {
        error: "",
        success:
          "Instructions to RESET your password has been sent to your email.",
      });
    })
    .catch((e) => {
      // Failure case, No user record found.
      res.render("pages/auth/forgotPassword", {
        error: e.message,
        success: "",
      });
    });
});

router.get("/logout", function (req, res) {
  firebase.auth().signOut(); // Firebase signout
  req.session.destroy(function (err) {
    // Clear website session
    if (err) {
      res.negotiate(err);
    }
    res.redirect("/");
  });
});

module.exports = router;
