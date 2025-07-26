import "dotenv/config";
import { v0 } from "v0-sdk";

async function setupWebhook() {
  const webhooks = await v0.hooks.find()

  if (webhooks.data.length > 0) {
    console.log(webhooks)
    return;
  }

  const result = await v0.hooks.create({
    name: "My Hook",
    events: ["chat.created", "message.created"],
    url: "https://local-backend.angelhodar.com/api/v0/webhooks",
  });

  console.log(result);
}

async function main() {
  const result = await v0.chats.create({
    system: "You are an expert coder",
    message: "Create a centered brown button with a white text that says 'Click me'",
  });

  console.log(result)
}

setupWebhook();
