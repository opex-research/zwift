import { makeConfig, toJSON } from "@indexsupply/shovel-config";
import type { Source, Table, Integration } from "@indexsupply/shovel-config";
import { writeFileSync } from "fs";
import { config as dotenvConfig } from "dotenv";
import { Client } from "pg";
import { ethers } from "ethers"; // Using Ethers.js v5 for compatibility

/* ============ Environment Setup ============ */
dotenvConfig({ path: "../.env" });

/* ============ Database Table Definitions ============ */
// Off-ramp Intents Table
const offRampIntentTable: Table = {
  name: "off_ramp_intents",
  columns: [
    { name: "off_ramp_intent_id", type: "numeric" },
    { name: "user", type: "bytea" },
    { name: "paypal_id", type: "text" },
    { name: "off_ramp_amount", type: "numeric" },
    { name: "conversion_rate", type: "numeric" },
    { name: "created_at", type: "numeric" },
  ],
};

// On-ramp Intents Verified Table
const onRampIntentVerifiedTable: Table = {
  name: "on_ramp_intents_verified",
  columns: [
    { name: "off_ramp_intent_id", type: "numeric" },
    { name: "off_ramper_address", type: "bytea" },
    { name: "on_ramper_address", type: "bytea" },
    { name: "to_address", type: "bytea" },
    { name: "amount", type: "numeric" },
    { name: "fee_amount", type: "numeric" },
  ],
};

// Cancellations Table
const cancellationTable: Table = {
  name: "cancellations",
  columns: [
    { name: "cancellation_id", type: "bytea" },
    { name: "off_ramp_intent_id", type: "numeric" },
    { name: "user", type: "bytea" },
    { name: "execute_at", type: "numeric" },
  ],
};

/* ============ Blockchain Source Configuration ============ */
const source: Source = {
  name: process.env.CHAIN_NAME || "default_chain_name",
  chain_id: parseInt(process.env.CHAIN_ID || "0"),
  url: process.env.CHAIN_RPC_URL || "default_rpc_url",
  urls: [process.env.CHAIN_RPC_URL_BACKUP || "default_rpc_url_backup"],
};

/* ============ Event Integrations ============ */
let integrations: Integration[] = [
  /* ------------ Off-ramp Intent Integration ------------ */
  {
    enabled: true,
    name: "off_ramp_intents",
    sources: [{ name: source.name, start: BigInt(0) }],
    table: offRampIntentTable,
    event: {
      type: "event",
      name: "OffRampIntentCreated",
      inputs: [
        {
          indexed: true,
          name: "offRampIntentID",
          type: "uint256",
          column: "off_ramp_intent_id",
        },
        { indexed: true, name: "user", type: "address", column: "user" },
        {
          indexed: false,
          name: "paypalID",
          type: "string",
          column: "paypal_id",
        },
        {
          indexed: false,
          name: "offRampAmount",
          type: "uint256",
          column: "off_ramp_amount",
        },
        {
          indexed: false,
          name: "conversionRate",
          type: "uint256",
          column: "conversion_rate",
        },
      ],
    },
  },
  /* ------------ On-ramp Intent Verified Integration ------------ */
  {
    enabled: true,
    name: "on_ramp_intents_verified",
    sources: [{ name: source.name, start: BigInt(0) }],
    table: onRampIntentVerifiedTable,
    event: {
      type: "event",
      name: "OnRampIntentVerified",
      inputs: [
        {
          indexed: true,
          name: "offRampIntentID",
          type: "uint256",
          column: "off_ramp_intent_id",
        },
        {
          indexed: true,
          name: "offRamperAddress",
          type: "address",
          column: "off_ramper_address",
        },
        {
          indexed: true,
          name: "onRamperAddress",
          type: "address",
          column: "on_ramper_address",
        },
        { indexed: false, name: "to", type: "address", column: "to_address" },
        { indexed: false, name: "amount", type: "uint256", column: "amount" },
        {
          indexed: false,
          name: "feeAmount",
          type: "uint256",
          column: "fee_amount",
        },
      ],
    },
  },
  /* ------------ Cancellation Integration ------------ */
  {
    enabled: true,
    name: "cancellations",
    sources: [{ name: source.name, start: BigInt(0) }],
    table: cancellationTable,
    event: {
      type: "event",
      name: "CancellationQueued",
      inputs: [
        {
          indexed: true,
          name: "cancellationId",
          type: "bytes32",
          column: "cancellation_id",
        },
        {
          indexed: true,
          name: "offRampIntentID",
          type: "uint256",
          column: "off_ramp_intent_id",
        },
        { indexed: true, name: "user", type: "address", column: "user" },
        {
          indexed: false,
          name: "executeAt",
          type: "uint256",
          column: "execute_at",
        },
      ],
    },
  },
];

/* ============ Shovel Configuration ============ */
const config = makeConfig({
  pg_url: process.env.DATABASE_URL_SHOVEL || "default_database_url",
  sources: [source],
  integrations: integrations,
});

// Write the Shovel configuration to a JSON file
console.log(`✔ Writing Shovel config to config.json`);
writeFileSync("config.json", toJSON(config, 2));

/* ============ Database Interaction Functions ============ */

/**
 * Checks the indexer by adding dummy entries and verifying table contents
 */
async function checkIndexer() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL_SHOVEL || "default_database_url",
  });

  try {
    await client.connect();

    // Add dummy entries to the database
    await addDummyEntries(client);

    // Check all tables for entries
    await checkTable(client, "off_ramp_intents");
    await checkTable(client, "on_ramp_intents_verified");
    await checkTable(client, "cancellations");
  } catch (error) {
    console.error("Error checking indexer:", error);
  } finally {
    await client.end();
  }
}

/**
 * Adds dummy entries to all tables in the database
 */
async function addDummyEntries(client: Client) {
  const queries = [
    `INSERT INTO off_ramp_intents (off_ramp_intent_id, "user", paypal_id, off_ramp_amount, conversion_rate, created_at)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    `INSERT INTO on_ramp_intents_verified (off_ramp_intent_id, off_ramper_address, on_ramper_address, to_address, amount, fee_amount)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    `INSERT INTO cancellations (cancellation_id, off_ramp_intent_id, "user", execute_at)
     VALUES ($1, $2, $3, $4)`,
  ];

  const dummyData = [
    [
      1,
      ethers.randomBytes(20),
      "paypal123",
      "1000000000000000000",
      "100000000",
      Math.floor(Date.now() / 1000),
    ],
    [
      1,
      ethers.randomBytes(20),
      ethers.randomBytes(20),
      ethers.randomBytes(20),
      "1000000000000000000",
      "10000000000000000",
    ],
    [
      ethers.randomBytes(32),
      1,
      ethers.randomBytes(20),
      Math.floor(Date.now() / 1000) + 3600,
    ],
  ];

  for (let i = 0; i < queries.length; i++) {
    await client.query(queries[i], dummyData[i]);
  }

  console.log("Dummy entries added successfully");
}

/**
 * Checks the contents of a specified table
 */
async function checkTable(client: Client, tableName: string) {
  const result = await client.query(`SELECT COUNT(*) FROM ${tableName}`);
  console.log(`Number of records in ${tableName}: ${result.rows[0].count}`);

  const sampleData = await client.query(`SELECT * FROM ${tableName} LIMIT 1`);
  if (sampleData.rows.length > 0) {
    console.log(`Sample data from ${tableName}:`, sampleData.rows[0]);
  } else {
    console.log(`No data found in ${tableName}`);
  }
}

/* ============ Script Execution ============ */
// Call the function to check the indexer
checkIndexer().catch((error) =>
  console.error("Error running checkIndexer:", error)
);
