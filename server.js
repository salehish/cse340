/***************************************
 * server.js - Main application entry
 ***************************************/

require('dotenv').config()
console.log('SESSION_SECRET loaded:', process.env.SESSION_SECRET ? '✅ Loaded' : '❌ MISSING!')

const express = require("express")
const expressLayouts = require("express-ejs-layouts")
const session = require("express-session")
const bodyParser = require("body-parser")
const cookieParser = require("cookie-parser")
const pgSession = require("connect-pg-simple")(session)
const pool = require("./database/")

// Routes and utilities
const staticRoutes = require("./routes/static")
const baseController = require("./controllers/basaController")
const inventoryRoute = require("./routes/inventoryRoute")
const accountRoute = require("./routes/accountRoute")
const routeIndex = require("./routes/")
const utilities = require("./utilities/")

// Initialize Express app
const app = express()

/***************************************
 * Middleware
 ***************************************/

// Session middleware
app.use(
  session({
    store: new pgSession({
      pool,
      createTableIfMissing: true,
    }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    name: "sessionId",
    cookie: {
      secure: process.env.NODE_ENV === "production", 
      maxAge: 1000 * 60 * 60 * 2, 
    },
  })
)

// Session vars available in templates
app.use((req, res, next) => {
  res.locals.loggedin = req.session.loggedin || false
  res.locals.accountData = req.session.accountData || null
  next()
})

// Flash messages
app.use(require("connect-flash")())
app.use((req, res, next) => {
  res.locals.messages = require("express-messages")(req, res)
  next()
})

// Parse incoming request bodies
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cookieParser())

// JWT middleware
app.use(utilities.checkJWTToken)

/***************************************
 * View Engine
 ***************************************/
app.set("view engine", "ejs")
app.use(expressLayouts)
app.set("layout", "./layouts/layout")

/***************************************
 * Routes
 ***************************************/
app.use(staticRoutes)
app.use("/", routeIndex)
app.use("/inv", inventoryRoute)
app.use("/account", accountRoute)
app.get("/trigger-error", utilities.handleErrors(baseController.errorLink))

// 404 Handler
app.use(async (req, res, next) => {
  next({ status: 404, message: "Sorry, we appear to have lost that page." })
})

/***************************************
 * Error Handler
 ***************************************/
app.use(async (err, req, res, next) => {
  let nav = await utilities.getNav()
  console.error("Error at", req.originalUrl, ":", err)
  const message =
    err.status === 404
      ? err.message
      : "Oh no! There was a crash. Maybe try a different route?"
  res.status(err.status || 500).render("errors/error", {
    title: err.status || "Server Error",
    message,
    nav,
  })
})

/***************************************
 * Start Server
 ***************************************/
const port = process.env.PORT || 5500
app.listen(port, () => {
  console.log(`App listening on port ${port}`)
})
