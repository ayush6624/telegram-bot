import fastify from "fastify";
import fetch from "node-fetch";
import 'dotenv/config'
import { getVisitorMessage } from "./lib.js";

const { CHAT_ID, BOT_KEY, TG_KEY } = process.env;
const server = fastify()

server.get("/", async (request, reply) => {
  reply.send({ "status": true, "message": "You might want to head over to https://ayushgoyal.dev to see what's cooking!" })
})

server.post<{ Body: { secret: string, text: string, type?: "analytics", ip?: string } }>('/message', async (req, reply) => {
  if (!req.body.secret || req.body.secret !== TG_KEY) {
    reply.code(403).send({ error: true, message: 'Secret not provided or did not match.' });
  }

  const API_URL = `https://api.telegram.org/bot${BOT_KEY}/sendMessage`;

  if (req.body.type === "analytics") {
    if(typeof req.ip !== "string") reply.code(404).send({ error: true, message: 'IP address was not provided' });
    req.body.text = await getVisitorMessage({ ip: req.body.ip });
  }

  const body = {
    chat_id: CHAT_ID,
    parse_mode: 'Markdown',
    disable_web_page_preview: true,
    ...req.body,
  };

  await fetch(API_URL, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: {
      'Content-Type': 'application/json',
    },
  });

  reply.send({ 'error': false, message: 'Message delivered successfully' });
});


server.listen(process.env.PORT || 3000, (err) => {
  console.log("Server listening on port 3000");
  if (err) throw err;
});
