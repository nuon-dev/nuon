import { DataSource } from "typeorm"
import process from "process"

async function runMigration() {
  const dataSource = new DataSource(require("../ormconfig.js"))
  try {
    await dataSource.initialize()
    console.log("Database connected successfully")
    await dataSource.runMigrations()
    console.log("Migrations executed successfully")
  } catch (error) {
    console.error("Migration failed:", error)
  } finally {
    await dataSource.destroy()
    console.log("Database connection closed")
  }
}

async function revertMigration() {
  const dataSource = new DataSource(require("../ormconfig.js"))
  try {
    await dataSource.initialize()
    console.log("Database connected successfully")
    await dataSource.undoLastMigration()
    console.log("Last migration reverted successfully")
  } catch (error) {
    console.error("Revert failed:", error)
  } finally {
    await dataSource.destroy()
    console.log("Database connection closed")
  }
}

if (process.argv.includes("revert")) {
  revertMigration()
} else {
  runMigration()
}
