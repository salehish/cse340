const express = require('express');
const router = express.Router();
const utilities = require('../utilities/')
// Static Routes
// Set up "public" folder / subfolders for static files
router.use(express.static("public"));
router.use("/css", express.static(__dirname + "public/css"));
router.use("/js", express.static(__dirname + "public/js"));
router.use("/images", express.static(__dirname + "public/images"));

// GET contact page
router.get("/contact", async (req, res) => {
  const nav = await utilities.getNav()
  res.render("contact", {
    title: "Contact Dealer",
    nav,
    successMessage: null,
    errorMessage: null,
    email: "",
    phone: "",
    message: ""
  })
})

// POST contact form submission
router.post("/contact", async (req, res) => {
  const { email, phone, message } = req.body
  const nav = await utilities.getNav()

  // Sample validation
  if (!email || !phone || !message) {
    return res.render("contact", {
      title: "Contact Dealer",
      nav,
      successMessage: null,
      errorMessage: "All fields are required.",
      email,
      phone,
      message
    })
  }

  // Placeholder: normally you'd store or send this data
  return res.render("contact", {
    title: "Contact Dealer",
    nav,
    successMessage: "Your message was successfully sent!",
    errorMessage: null,
    email: "",
    phone: "",
    message: ""
  })
})

module.exports = router;



