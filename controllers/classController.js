
const utilities = require("../utilities/")
const classfModel = require("../models/classification-model")

const classController = {}

classController.newClassification = async function(req,res) {
    const nav = await utilities.getNav()
    //const addClassification = await utilities.buildAddClassification()
    res.render("./inventory/newclassification",
        {
            title:"Add New Classification",
            nav,
            errors:null
        }
    )
}

// clasCont.addNewCar = async function(req,res) {
//     const nav = await utilities.getNav()
//     const addNewCar = await utilities.buildAddNewCar()
//     res.render("./inventory/newcar",{
//             title:"Add New Vehicle",
//             nav,
//             addNewCar
//         }
//     )
// }

classController.addNewClassification = async function (req, res) {
    let nav = await utilities.getNav();
    //const loginForm = await utilities.buildLoginForm();
    //const RegisterForm = await utilities.buildRegisterForm();
    // const classificationSelect = await utilities.buildClassificationList()
    const vehicleManagement = await utilities.vehicleManagement()
    const { classification_name } = req.body;
  
    try {
  
      const newClassf = await classfModel.addNewClassification(
        classification_name
      )
  
      if (newClassf) {
        req.flash(
          "notice",
          `Congratulations, you added a new classification ${classification_name}.`
        );
        res.status(201).render("./inventory/management", 
      {
        title:"Vehicle Management",
        nav,
        errors:null,
        vehicleManagement,
        // classificationSelect

      }
    );
      } else {
        req.flash("notice", "Sorry, failed to add the classification.");
        res.status(501).render("./inventory/newclassification",
            {
                title:"Add New Classification",
                nav,
                errors:null
            }
        )
      }
    } catch (error) {
      console.error('Error during adding classification:', error);
      req.flash("notice", "An error occurred during adding classification.");
      res.status(501).render("./inventory/newclassification",
        {
            title:"Add New Classification",
            nav,
            errors:null
        }
    );
    }
  }

  // clasCont.addNewCar = async function(req,res) {
//     const nav = await utilities.getNav()
//     const addNewCar = await utilities.buildAddNewCar()
//     res.render("./inventory/newcar",{
//             title:"Add New Vehicle",
//             nav,
//             addNewCar
//         }
//     )
// }

module.exports = classController