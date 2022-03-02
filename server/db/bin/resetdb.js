require('dotenv').config();

const fs = require("fs");
const chalk = {
  red: console.log,
  cyan: console.log,
  green: console.log
};

const { Pool } = require('pg');
const dbParams = require('../lib/db');
const db = new Pool(dbParams);

const runShemaFiles = async () => {
  chalk.cyan('-> Loading Schema Files ...');
  const schemaFilenames = fs.readdirSync('./db/schema');

  for (const fn of schemaFilenames) {
    const sql = fs.readFileSync(`./db/schema/${fn}`, "utf8");
    chalk.green(`\t-> Running ${fn}`);
    await db.query(sql);
  }
};