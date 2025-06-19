
const pool = require("../database/")
/* ***************************
 *  Get all classification data
 * ************************** */
async function getClassifications(){
  return await pool.query(
    `SELECT * FROM public.classification ORDER BY classification_name`
  )
}
/* ***************************
 *  Get all inventory items and classification_name by classification_id
 * ************************** */
async function getInventoryByClassificationId(classification_id) {
    try {
      const data = await pool.query(
        `SELECT * FROM public.inventory AS i 
        JOIN public.classification AS c 
        ON i.classification_id = c.classification_id 
        WHERE i.classification_id = $1`,
        [classification_id]
      )
      return data.rows
    } catch (error) {
      console.error("getclassificationsbyid error " + error)
    }
  }
 /* ***************************
 *  Get all car details from the inventory table by inventory_id
 * ************************** */  
async function getInventoryByInventoryId(inventory_id) {
    try {
      const data = await pool.query(
        `SELECT * FROM public.inventory AS i
        WHERE i.inv_id = $1`,
        [inventory_id]
      )
      console.log(data.rows)
      return data.rows
    } catch (error) {
      console.error("getinventorybyid error " + error)
    }
  }
/* ***************************
 *  Get all car details from the inventory table by inventory_id
 * ************************** */  
async function getInventoryByInventoryId1(inventory_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory AS i
      WHERE i.inv_id = $1`,
      [inventory_id]
    )
    console.log(data.rows)
    return data.rows
  } catch (error) {
    console.error("getinventorybyid error " + error)
  }
}
//Insert Query for adding new car.
async function addNewCar(classification_id, inv_make, inv_model, inv_description, inv_image, inv_path, inv_price, inv_year, inv_miles, inv_color) {
  try {
      const result = await pool.query(
          `INSERT INTO public.inventory (classification_id, inv_make, inv_model, inv_description, inv_image, inv_thumbnail, inv_price, inv_year, inv_miles, inv_color)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
           RETURNING inv_id`,
          [classification_id, inv_make, inv_model, inv_description, inv_image, inv_path, inv_price, inv_year, inv_miles, inv_color]
      );

      console.log("New car added with ID:", result.rows[0].inv_id);
      return result.rows[0].inv_id; 
  } catch (error) {
      console.error("Error adding new car: " + error);
      throw error; 
  }
}
/* ***************************
 *  Update Inventory Data
 * ************************** */
async function updateInventory(
  inv_id,
  inv_make,
  inv_model,
  inv_description,
  inv_image,
  inv_thumbnail,
  inv_price,
  inv_year,
  inv_miles,
  inv_color,
  classification_id
) {
  try {
    const sql =
      "UPDATE public.inventory SET inv_make = $1, inv_model = $2, inv_description = $3, inv_image = $4, inv_thumbnail = $5, inv_price = $6, inv_year = $7, inv_miles = $8, inv_color = $9, classification_id = $10 WHERE inv_id = $11 RETURNING *"
    const data = await pool.query(sql, [
      inv_make,
      inv_model,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_year,
      inv_miles,
      inv_color,
      classification_id,
      inv_id
    ])
    return data.rows[0]
  } catch (error) {
    console.error("model error: " + error)
  }
}
/* ***************************
 *  Delete Inventory Item
 * ************************** */
async function deleteInventory(inv_id) {
  try {
    const sql = 'DELETE FROM inventory WHERE inv_id = $1'
    const data = await pool.query(sql, [inv_id])
  return data
  } catch (error) {
    new Error("Delete Inventory Error")
  }
}
/* ***************************
 *  Insert Feedback Data
 * ************************** */
async function insertFeedback(
  inv_id,
  account_email,
  phone,
  message
) {
  try {
    const submittedAt = new Date();
    const sql =
      "INSERT INTO public.feedback (inv_id, account_email, phone, message, submitted_at) VALUES ($1, $2, $3, $4, $5) RETURNING *";
    const data = await pool.query(sql, [
      inv_id,
      account_email,
      phone,
      message,
      submittedAt
    ]);
    return data.rows[0];
  } catch (error) {
    console.error("Model error: " + error);
    throw error;
  }
}

async function getAllFeedback() {
  try {
    const sql = 'SELECT * FROM public.feedback ORDER BY submitted_at DESC';
    const data = await pool.query(sql);
    return data.rows;
  } catch (error) {
    console.error('Model error:', error);
    throw error;
  }
}



module.exports = {getClassifications, getInventoryByClassificationId, getInventoryByInventoryId, addNewCar, updateInventory, deleteInventory, getInventoryByInventoryId1, insertFeedback, getAllFeedback}
