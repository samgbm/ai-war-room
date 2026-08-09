import { createApp } from "./app.js";

const PORT = Number(process.env.PORT) || 8080;
const app = createApp();

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

setInterval(() => {
  console.log("AI Agent Worker Loop running...");
}, 10_000);
