const { Pool } = require("pg")
require("dotenv").config()

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
})

module.exports = {
  async query(text, params) {
    try {
      const res = await pool.query(text, params)
      if (process.env.NODE_ENV === "development") {
        console.log("executed query", { text })
      }
      return res
    } catch (error) {
      console.error("error in query", { text })
      throw error
    }
  },
  pool
}
