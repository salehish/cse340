const invModel = require("../models/inventory-model")
const jwt = require("jsonwebtoken")
require("dotenv").config()
const Util = {}

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function () {
  let data = await invModel.getClassifications()
  let list = "<ul>"
  list += '<li><a href="/" title="Home page">Home</a></li>'
  data.rows.forEach((row) => {
    list += "<li>"
    list +=
      '<a href="/inv/type/' +
      row.classification_id +
      '" title="See our inventory of ' +
      row.classification_name +
      ' vehicles">' +
      row.classification_name +
      "</a>"
    list += "</li>"
  })
  list += "</ul>"
  return list
}


/* **************************************
* Build the classification view HTML
* ************************************ */
Util.buildClassificationGrid = async function(data){
    let grid
    if(data.length > 0){
      grid = '<ul id="inv-display">'
      data.forEach(vehicle => { 
        grid += '<li>'
        grid +=  '<a href="../../inv/detail/'+ vehicle.inv_id 
        + '" title="View ' + vehicle.inv_make + ' '+ vehicle.inv_model 
        + 'details"><img src="' + vehicle.inv_thumbnail 
        +'" alt="Image of '+ vehicle.inv_make + ' ' + vehicle.inv_model 
        +' on CSE Motors" /></a>'
        grid += '<div class="namePrice">'
        grid += '<hr />'
        grid += '<h2>'
        grid += '<a href="../../inv/detail/' + vehicle.inv_id +'" title="View ' 
        + vehicle.inv_make + ' ' + vehicle.inv_model + ' details">' 
        + vehicle.inv_make + ' ' + vehicle.inv_model + '</a>'
        grid += '</h2>'
        grid += '<span>$' 
        + new Intl.NumberFormat('en-US').format(vehicle.inv_price) + '</span>'
        grid += '</div>'
        grid += '</li>'
      })
      grid += '</ul>'
    } else { 
      grid += '<p class="notice">Sorry, no matching vehicles could be found.</p>'
    }
    return grid
  }






  Util.buildCarDetailsDisplay = async function(data) {
    console.log(data)
    return `
      <div class="inventory-details">
        <div class="first-details">
          <img src="${data.inv_image}" alt="image of ${data.inv_make}" title="details of ${data.inv_make}" class="inventory-image">
            <p class="description">${data.inv_description}</p>
        </div>
        <div class="second-details">
          <h2 class="details-title">${data.inv_year} ${data.inv_make} ${data.inv_model}</h2>
          <div class="third-details">
            <div class="price">
              <h3>Price</h3>
              <p>$${new Intl.NumberFormat('en-US').format(Number(data.inv_price))}</p>
            </div>
            <div class="miles">
              <h3>Miles</h3>
              <p>${new Intl.NumberFormat('en-US').format(Number(data.inv_miles))}</p>
            </div>
            <div class="color">
              <h3>Color</h3>
              <p>${data.inv_color}</p>
            </div>
            <div class="contact">
              <h3>Contact us at +256758116304</h3>
              <a class="dealer" href="/inv/dealer/${data.inv_id}">Start Inquiry</a>
              <button class="purchase">Start-Purchase</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

/******** Build the management page component
                                     * 
                                        */

  Util.vehicleManagement = async function() {
    return `
          <div id="vehicle-management">
              <a href="/newclassification">Add New Classification</a><br>
              <a href="/newcar">Add New Vehicle</a>
          </div>
          <h2>Manage Inventory</h2>
          <p>Select A classification from the List to see the items belonging to the classification</p>
    `  
  }



  Util.buildClassificationList = async function (classification_id = null) {
    let data = await invModel.getClassifications()
    let classificationList =
      '<select name="classification_id" id="classificationList" required>'
    classificationList += "<option value=''>Choose a Classification</option>"
    data.rows.forEach((row) => {
      classificationList += '<option value="' + row.classification_id + '"'
      if (
        classification_id != null &&
        row.classification_id == classification_id
      ) {
        classificationList += " selected "
      }
      classificationList += ">" + row.classification_name + "</option>"
    })
    classificationList += "</select>"
    return classificationList
  }



/* ****************************************
* Middleware to check token validity
**************************************** */
Util.checkJWTToken = (req, res, next) => {
  if (req.cookies.jwt) {
   jwt.verify(
    req.cookies.jwt,
    process.env.ACCESS_TOKEN_SECRET,
    function (err, accountData) {
     if (err) {
      req.flash("Please log in")
      res.clearCookie("jwt")
      return res.redirect("/account/login")
     }
     res.locals.accountData = accountData
     res.locals.loggedin = 1
     next()
    })
  } else {
   next()
  }
 }



 
 /* ****************************************
 *  Check Login
 * ************************************ */
 Util.checkLogin = (req, res, next) => {
  if (res.locals.loggedin) {
    next()
  } else {
    req.flash("notice", "Please log in.")
    return res.redirect("/account/login")
  }
 }


Util.checkEmployeeOrAdmin = (req, res, next) => {
  const token = req.cookies.jwt

  if (!token) {
    req.flash("notice", "You must be logged in to access this page.")
    return res.redirect("/account/login")
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    
    if (decoded.account_type === "Employee" || decoded.account_type === "Admin") {
      req.accountData = decoded
      next()
    } else {
      req.flash("notice", "You do not have permission to access that page.")
      return res.redirect("/account/login")
    }
  } catch (err) {
    req.flash("notice", "Invalid session. Please log in again.")
    return res.redirect("/account/login")
  }
}

 

Util.buildFeedbackGrid = async (feedbackList) => {
  if (!feedbackList || feedbackList.length === 0) {
    return await '<p class="notice">No feedback entries found.</p>';
  }

  let grid = await '<div class="feedback-grid">';
  feedbackList.forEach((fb) => {
    grid += `
      <div class="feedback-entry">
        <p><strong>Email:</strong> ${fb.account_email}</p>
        <p><strong>Inventory ID:</strong> ${fb.inv_id}</p>
        <p><strong>Phone:</strong> ${fb.phone}</p>
        <p><strong>Message:</strong> ${fb.message}</p>
        <p><strong>Submitted At:</strong> ${new Date(fb.submitted_at).toLocaleString()}</p>
      </div>
    `;
  });
  grid += '</div>';
  return grid;
}


/* ****************************************
 * Middleware For Handling Errors
 * Wrap other function in this for 
 * General Error Handling
 **************************************** */
Util.handleErrors = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)

module.exports = Util