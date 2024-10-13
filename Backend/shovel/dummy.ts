import { makeConfig, toJSON } from "@indexsupply/shovel-config";
import type { Source, Table, Integration } from "@indexsupply/shovel-config";
import { writeFileSync } from "fs";
import { config as dotenvConfig } from "dotenv"; // Change default import to named import

// Load environment variables from .env file
dotenvConfig({ path: '../.env' });

const table: Table = {
  name: "transfers",
  columns: [
    { name: "log_addr", type: "bytea" },
    { name: "from", type: "bytea" },
    { name: "to", type: "bytea" },
    { name: "amount", type: "numeric" },
  ],
};

const source: Source = {
  name: process.env.CHAIN_NAME || "default_chain_name",
  chain_id: parseInt(process.env.CHAIN_ID || "0"),
  url: process.env.CHAIN_RPC_URL || "default_rpc_url",
  urls: [
    process.env.CHAIN_RPC_URL_BACKUP || "default_rpc_url_backup",
  ],
};

// TODO: This can be moved to separate parallel files
let integrations: Integration[] = [
  {
    enabled: true,
    name: "transfers",
    sources: [{ name: source.name, start: BigInt(0) }],
    table: table,
    block: [
      {
        name: "log_addr",
        column: "log_addr",
        filter_op: "contains",
        filter_arg: ["0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"],
      },
    ],
    event: {
      type: "event",
      name: "Transfer",
      inputs: [
        { indexed: true, name: "from", type: "address", column: "from" },
        { indexed: true, name: "to", type: "address", column: "to" },
        { indexed: false, name: "amount", type: "uint256", column: "amount" },
      ],
    },
  },
];

const config = makeConfig({
  pg_url: process.env.DATABASE_URL_SHOVEL || "default_database_url",
  sources: [source],
  integrations: integrations,
});

console.log(`✔ Writing Shovel config to config.json`);
writeFileSync("config.json", toJSON(config, 2));
