
require("dotenv").config()
const utilities = require("../utilities/")
const acctModel = require("../models/account-model")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken");
const SECRET_KEY = process.env.JWT_SECRET

/* ****************************************
*  Deliver login view
* *************************************** */
async function buildLoginView(req, res, next) {
    let nav = await utilities.getNav()
    res.render("account/login", {
      title: "Login",
      nav,
      errors: null
    })
  }



/* ****************************************
*  Deliver Register view
* *************************************** */
async function buildRegisterView(req, res, next) {
  let nav = await utilities.getNav()
 //let RegisterForm = await utilities.buildRegisterForm()
  res.render("account/register", {
    title: "Register",
    nav,
    errors: null,
  })
}


/* ****************************************
*  Process Registration
* *************************************** */
async function registerAccount(req, res) {
  let nav = await utilities.getNav()
  const { account_firstname, account_lastname, account_email, account_password } = req.body

     let hashedPassword 
  try {
  // regular password and cost (salt is generated automatically)
    hashedPassword = await bcrypt.hashSync(account_password, 10)
  } catch (error) {
    req.flash("notice", 'Sorry, there was an error processing the registration.')
    res.status(500).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
    })
  }

  const regResult = await acctModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    hashedPassword
  )

  if (regResult) {
    req.flash(
      "notice",
      `Congratulations, you\'re registered ${account_firstname}. Please log in.`
    )
    res.status(201).render("account/login", {
      title: "Login",
      nav,
      errors: null
    })
  } else {
    req.flash("notice", "Sorry, the registration has failed.")
    res.status(501).render("account/register", {
      title: "Registration",
      nav,
      errors: null
    })
  }
}

/* ****************************************
 *  Process login request
 * ************************************ */
async function accountLogin(req, res) {
  let nav = await utilities.getNav()
  const { account_email, account_password } = req.body
  const accountData = await acctModel.getAccountByEmail(account_email)
  if (!accountData) {
    req.flash("notice", "Please check your credentials and try again.")
    res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    })
    return
  }
  try {
    if (await bcrypt.compare(account_password, accountData.account_password)) {
      delete accountData.account_password
      const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 1000 })
      if(process.env.NODE_ENV === 'development') {
        res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
      } else {
        res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 })
      }
      return res.redirect("/account/")
    }
    else {
      req.flash("message notice", "Please check your credentials and try again.")
      res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
      })
    }
  } catch (error) {
    console.log('Login error:', error);
    throw new Error('Access Forbidden')
  }
}



//Logged in view 
async function buildLoggedinView(req, res) {
  try {
    const nav = await utilities.getNav();
    const accountData = res.locals.accountData || null;
    const loggedin = res.locals.loggedin || false;
    res.render("account/loggedin", {
      title: "Home",
      nav,
      loggedin,
      accountData
    });
  } catch (error) {
    console.error("Error building user view:", error);
    req.flash("notice", "An error occurred while trying to access your account.");
    res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: null,
  })}
}


// log out view
const logout = async (req, res) => {
  res.clearCookie("jwt")
  const nav = await utilities.getNav()
  req.flash("notice", "You have successfully logged out.")
  res.render("index", {
    title: "Home",
    nav
  })
}



const buildeditAccount = async (req, res, next) => {
  try {
    const account_id = parseInt(req.params.account_id);
    const nav = await utilities.getNav();
    const accountData = await acctModel.getAccountById(account_id);

    console.log("this is the data to be updated ", accountData)
    const itemName = `${accountData.account_firstname} ${accountData.account_lastname}`

    res.render("account/editaccount", {
      title: "Edit Account" + itemName,
      nav,
      errors: null,
      account_id: accountData.account_id,
      account_firstname: accountData.account_firstname,
      account_lastname: accountData.account_lastname,
      account_email: accountData.account_email,
      account_type: accountData.account_type,
    });
  } catch (error) {
    console.error("Error fetching account data:", error);
    req.flash("notice", "An error occurred while retrieving account details.");
    res.redirect("/account/");
  }
}



/* ***************************
 *  Update Account Information
 * ************************** */
const updateAccount = async (req, res, next)=> {
  const nav = await utilities.getNav();
  const accountData = res.locals.accountData || null;
  const loggedin = res.locals.loggedin || false;
  const {
    account_id,
    account_firstname,
    account_lastname,
    account_email,
  } = req.body;

  try {
    const updateAccountResult = await acctModel.updateAccount(
      account_id,
      account_firstname,
      account_lastname,
      account_email
    );

    if (updateAccountResult) {
      req.flash("notice", "Account information updated successfully.");
      res.status(201).render("account/loggedin", {
      title: "Home",
      nav,
      loggedin,
      accountData
      });
    } else {
      req.flash("notice", "Sorry, the update failed.");
      res.status(501).render("account/editAccount", {
        title: "Edit Account",
        nav,
        errors: null,
        account_id,
        account_firstname,
        account_lastname,
        account_email,
      });
    }
  } catch (error) {
    next(error);
  }
};


//process of fixing the password

/* ***************************
 *  Update Account Password
 * ************************** */
const updatePassword = async (req, res, next) => {
  const { account_id, account_password } = req.body;
  const nav = await utilities.getNav();
    let classificationSelect = await utilities.buildClassificationList()
    const vehicleManagement = await utilities.vehicleManagement()

  try {
    // Hash the new password
    const hashedPassword = await bcrypt.hashSync(account_password, 10);

    // Update password in the database
    const updateResult = await acctModel.updatePassword(account_id, hashedPassword);

    if (updateResult) {
      req.flash("notice", "Password successfully updated.");
      res.status(201).render("inventory/management", {
        title: "Vehicle Management",
        nav,
        classificationSelect,
        vehicleManagement,
        errors: null
      });
    } else {
      console.log("this is the data to be updated ", accountData)
      req.flash("notice", "Failed to update password.");
      res.status(201).render("inventory/management", {
        title: "Vehicle Management",
        nav,
        classificationSelect,
        vehicleManagement,
        errors: null
      });
    }
  } catch (error) {
    console.error("Error updating password:", error);
    req.flash("notice", "An error occurred while updating the password.");
    res.status(201).render("inventory/management", {
      title: "Vehicle Management",
      nav,
      classificationSelect,
      vehicleManagement,
      errors: null
    });
  }
};


module.exports = {buildLoginView, buildRegisterView, registerAccount, accountLogin, buildLoggedinView, logout, buildeditAccount, updateAccount, updatePassword}
