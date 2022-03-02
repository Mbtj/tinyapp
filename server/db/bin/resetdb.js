require('dotenv').config();

// Hashing method for passwords
const bcrypt = require("bcryptjs");

const fs = require("fs");
const chalk = {
  red: console.log,
  cyan: console.log,
  green: console.log
};

const { Pool } = require('pg');
const dbParams = require('../lib/db');
const db = new Pool(dbParams);

const runSchemaFiles = async () => {
  chalk.cyan('-> Loading Schema Files ...');
  const schemaFilenames = fs.readdirSync('./db/schema');

  for (const fn of schemaFilenames) {
    const sql = fs.readFileSync(`./db/schema/${fn}`, "utf8");
    chalk.green(`\t-> Running ${fn}`);
    await db.query(sql);
  }
};


const runSeedFiles = async () => {
  console.log(chalk.cyan(`-> Loading Seeds ...`));
  const schemaFilenames = fs.readdirSync("./db/seeds");

  for (const fn of schemaFilenames) {
    const seedInfo = fs.readFileSync(`./db/seeds/${fn}`, "utf8");
    console.log(`\t-> Running ${chalk.green(fn)}`);
    //TODO LEARN ABOUT ASYNC AWAIT PROPERTIES AND THEN APPLY JSON SEED FILES TO QUERIES.
    await db.query(sql);
  }
};

const runResetDB = async () => {
  try {
    dbParams.host &&
      console.log(`-> Connecting to PG on ${dbParams.host} as ${dbParams.user}...`);
    dbParams.connectionString &&
      console.log(`-> Connecting to PG with ${dbParams.connectionString}...`);
    await db.connect();
    await runSchemaFiles();
    await runSeedFiles();
    db.end();
  } catch (err) {
    console.error(chalk.red(`Failed due to error: ${err}`));
    db.end();
  }
};
