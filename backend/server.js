import { generateEmoji, verifyEmoji } from "@emoji-captcha/server";
import { config } from "dotenv";
import { join } from "desm";

import Fastify from "fastify";
import fastifyStatic from "fastify-static";
import fastifyCors from "fastify-cors";

config();

const fastify = Fastify({
  logger: true,
});

fastify.register(fastifyStatic, {
  root: join(import.meta.url, "../frontend/dist/"),
});

fastify.register(fastifyCors);

const secret = process.env.CAPTCHA_SECRET;

// Declare a route
fastify.get("/api/captcha", async () => {
  const emojis = await generateEmoji({
    secret,
    emojiCount: 5,
    encoding: "minified-uri",
  });
  return emojis;
});

fastify.post(
  "/api/submit",
  {
    schema: {
      body: {
        type: "object",
        properties: {
          selectedEmoji: { type: "string" },
          answer: { type: "string" },
        },
      },
    },
  },
  async (req) => {
    console.log(req.body);
    try {
      const isCorrect = await verifyEmoji({
        secret,
        selectedIdx: +req.body?.selectedEmoji,
        answerHash: req.body.answer,
      });
      return { isCorrect };
    } catch (error) {
      return { error };
    }
  }
);

// Run the server!
fastify.listen(8080, function (err, address) {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  // Server is now listening on ${address}
});
