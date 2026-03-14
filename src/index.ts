import Fastify from "fastify";

import { fetchScreenings, parseScreenings, type FlatScreening } from "./csfd/index";
import { timeExecution } from "./utils/time";
import { findScreenings } from "./gemini/gemini";

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

fastify.listen({ port: 3000 });
