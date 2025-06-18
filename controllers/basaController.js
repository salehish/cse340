const utilities = require("../utilitiies/")
const baseController = {}

baseController.buildHome = async function(req, res){
  const nav = await utilities.getNav()
  res.render("index", {title: "Home", nav})
}


baseController.errorLink = async function(req, res){
  //const nav = await utilities.getNav()
  res.render("index", {title: "Home", nav})
}

module.exports = baseController