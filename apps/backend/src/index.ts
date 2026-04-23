import "dotenv/config";
import { loadEnv } from "./config/env.js";
import { connectMongo } from "./db/connect.js";
import { createApp } from "./app.js";

const env = loadEnv();
const app = createApp(env);

async function main() {
  await connectMongo(env.MONGODB_URI);
  app.listen(env.PORT, () => {
    console.log(`API listening on http://localhost:${env.PORT}`);
  });
}

void main().catch((e) => {
  console.error(e);
  process.exit(1);
});
