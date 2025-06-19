
// //Needed resources
const express = require("express")
const router = new express.Router()
const accountController = require("../controllers/accountController")
const utilities = require("../utilitiies/")
const regValidate = require('../utilitiies/account-validation')

// //Route to get the login page
router.get("/login", utilities.handleErrors(accountController.buildLoginView))

//Route to get the register page
router.get("/signup", utilities.handleErrors(accountController.buildRegisterView))

//Route to get make registration
router.post(
    "/register",
    regValidate.registationRules(),
    regValidate.checkRegData,
    utilities.handleErrors(accountController.registerAccount)
  )

  //Route to login
router.post("/login", regValidate.loginRules(), regValidate.checkLoginData, utilities.handleErrors(accountController.accountLogin))

//Route to the user's view
router.get("/", utilities.checkLogin, utilities.handleErrors(accountController.buildLoggedinView))

//route to log out
router.get("/logout", utilities.handleErrors(accountController.logout))

// Route to get the account edit view
router.get("/edit/:account_id", utilities.checkLogin, utilities.handleErrors(accountController.buildeditAccount))

// Route to handle account update submission
router.post(
  "/update/",
  utilities.checkLogin, regValidate.updateAccountRules(), regValidate.checkUpdateAccountData, utilities.handleErrors(accountController.updateAccount)
)

router.post('/update-password', utilities.checkLogin, regValidate.updatePasswordRules(), regValidate.checkUpdatePasswordData, accountController.updatePassword);

module.exports = router;
