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
  const schemaFilenames = fs.readdirSync('./server/db/schema');
  console.log(schemaFilenames);

  for (const fn of schemaFilenames) {
    console.log(`Reading ${fn}`);
    const sql = fs.readFileSync(`./server/db/schema/${fn}`, "utf8");
    chalk.green(`\t-> Running ${fn}`);
    await db.query(sql);
  }
};


const runSeedFiles = async () => {
  console.log(chalk.cyan(`-> Loading Seeds ...`));
  const schemaFilenames = fs.readdirSync("./server/db/seeds");

  for (const fn of schemaFilenames) {
    console.log(`Reading ${fn}`);
    const seedInfo = fs.readFileSync(`./server/db/seeds/${fn}`, "utf8");
    console.log(`\t-> Running ${chalk.green(fn)}`);
    const {seeds, query} = JSON.parse(seedInfo);
    for (const seed of seeds) {
      if (seed.email) {
        await db.query(query, [seed.email, bcrypt.hashSync(seed.password)]);
      } else {
        await db.query(query, [seed.id, seed.longurl, seed.user_id]);
      }
    }
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

runResetDB();