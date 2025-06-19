// Needed Resources 
const express = require("express")
const router = new express.Router() 
const utilities = require("../utilities/")
const classController = require("../controllers/classController")
const baseController = require("../controllers/basaController")
const invController = require("../controllers/invController")
const regValidate = require('../utilities//account-validation')

router.get("/", utilities.handleErrors(baseController.buildHome))

//Route to add new classification
router.get("/newclassification", utilities.handleErrors(classController.newClassification))

router.post("/addnewclassification", regValidate.classificationRules(), regValidate.checkClassData, utilities.handleErrors(classController.addNewClassification))

//Route to getting a new car form new vehicle
router.get("/newcar", utilities.handleErrors(invController.newCar))

//route to adding a new vehicle
router.post("/addnewcar", regValidate.newCarRules(), regValidate.checknewCarData, utilities.handleErrors(invController.addNewCar))

module.exports = router;