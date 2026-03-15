import Fastify from "fastify";

import {
  fetchScreenings,
  parseScreenings,
  type FlatScreening,
} from "./csfd/index.js";
import { timeExecution } from "./utils/time.js";
import { findScreenings } from "./gemini/gemini.js";
import * as telegram from "./telegram/telegram.js";

const fastify = Fastify({ logger: true });

function filterScreenings(screenings: FlatScreening[]) {
  const filtered = screenings
    .filter((s) => !s.cinema.startsWith("CineStar"))
    .filter((s) => !s.cinema.startsWith("Premier Cinemas"))
    .filter(
      (s) =>
        !(s.cinema.startsWith("Cinema City") && !s.cinema.includes("Flora")),
    );

  return filtered;
}

fastify.get("/test", async (request, reply) => {
  const [fetchError, html] = await fetchScreenings();
  if (fetchError !== null) {
    request.log.error(fetchError, "error while fetching screenings");
    return reply.send("unexpected error, please try again");
  }

  const { screenings } = timeExecution(() => parseScreenings(html));
  const filtered = filterScreenings(screenings);
  const message = await findScreenings(filtered);

  return reply.send(message.text);
});

fastify.post("/telegram/webhook/asdfasdwerqwe", async (request, reply) => {
  const updateMessage = request.body as any;
  request.log.info(request.body);

  const chatId = updateMessage?.message?.chat?.id;
  const text = updateMessage?.message?.text;

  if (!chatId || !text) {
    request.log.error({ chatId, text }, "something went wrong");
    telegram.sendMessage(chatId, "Something went wrong", request.log);
    return reply.send({ ok: true });
  }

  if (text !== "/test") {
    telegram.sendMessage(chatId, "Wrong command", request.log);
    return reply.send({ ok: true });
  }

  request.log.info("Fetching screenings");
  const [fetchError, html] = await fetchScreenings();
  if (fetchError !== null) {
    request.log.error(fetchError, "error while fetching screenings");
    return reply.send("unexpected error, please try again");
  }
  const { screenings } = timeExecution(() => parseScreenings(html));
  const filtered = filterScreenings(screenings);
  request.log.info(`Found ${filtered.length} screenings`);
  const message = await findScreenings(filtered);
  telegram.sendMessage(chatId, message.text!, request.log);

  return reply.send({ ok: true });
});

fastify.listen({ port: 3000 });
