/* ******************************************
 * This server.js file is the primary file of the 
 * application. It is used to control the project.
 *******************************************/

/* ***********************
 * Require Statements
 *************************/
require("dotenv").config();  // Load env variables ASAP

const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const session = require("express-session");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const pool = require("./database/");

// Routes and utilities
const staticRoutes = require("./routes/static");
const baseController = require("./controllers/basaController");
const inventoryRoute = require("./routes/inventoryRoute");
const accountRoute = require("./routes/accountRoute");
const routeIndex = require("./routes/");
const utilities = require("./utilities/");  // fixed typo here

/* ***********************
 * Initialize Express App
 *************************/
const app = express();

/* ***********************
 * Middleware
 *************************/

// Session middleware with connect-pg-simple store
app.use(
  session({
    store: new (require("connect-pg-simple")(session))({
      pool,
      createTableIfMissing: true,
    }),
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true,
    name: "sessionId",
    cookie: {
      secure: process.env.NODE_ENV === "production", // secure cookies in prod only
      maxAge: 1000 * 60 * 60 * 2, // 2 hours
    },
  })
);

// Pass session info to views
app.use((req, res, next) => {
  res.locals.loggedin = req.session.loggedin || false;
  res.locals.accountData = req.session.accountData || null;
  next();
});

// Flash messages middleware
app.use(require("connect-flash")());
app.use((req, res, next) => {
  res.locals.messages = require("express-messages")(req, res);
  next();
});

// Body parsers and cookie parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

// JWT token checker (your custom middleware)
app.use(utilities.checkJWTToken);

/* ***********************
 * View Engine Setup
 *************************/
app.set("view engine", "ejs");
app.use(expressLayouts);
app.set("layout", "./layouts/layout");

/* ***********************
 * Routes
 *************************/
app.use(staticRoutes);
app.use("/", routeIndex);
app.use("/inv", inventoryRoute);
app.use("/account", accountRoute);

// Error testing route
app.get("/trigger-error", utilities.handleErrors(baseController.errorLink));

// 404 handler - MUST be last route
app.use(async (req, res, next) => {
  next({ status: 404, message: "Sorry, we appear to have lost that page." });
});

/* ***********************
 * Global Error Handler
 *************************/
app.use(async (err, req, res, next) => {
  let nav = await utilities.getNav();
  console.error(`Error at: "${req.originalUrl}": ${err.message}`);
  const message =
    err.status === 404
      ? err.message
      : "Oh no! There was a crash. Maybe try a different route?";
  res.status(err.status || 500).render("errors/error", {
    title: err.status || "Server Error",
    message,
    nav,
  });
});

/* ***********************
 * Start Server
 *************************/
const port = process.env.PORT || 5500;
app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
