import "dotenv/config";
import { createApp } from "./app.js";
import { startAgentLoop } from "./ai/agentLoop.js";

export { audioCache } from "./audioCache.js";

const PORT = Number(process.env.PORT) || 8080;
const app = createApp();

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

void startAgentLoop().catch((error) => {
  console.error("[agent] failed to start agent loop:", error);
});
