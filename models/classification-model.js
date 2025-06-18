const pool = require("../database")


/* *****************************
*  Add new Classification
* *************************** */
async function addNewClassification(classification_name) {
    try {
        const sql = "INSERT INTO classification (classification_name) VALUES ($1) RETURNING *";
        const result = await pool.query(sql, [classification_name]);
        return result.rows[0];
    } catch (error) {
        console.error("Error adding classification:", error.message); 
        throw new Error("Could not add classification"); 
    }
}



module.exports = {addNewClassification}