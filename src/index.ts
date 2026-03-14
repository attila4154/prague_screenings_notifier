import { GoogleGenAI } from "@google/genai";

import { fetchScreenings, parseScreenings } from "./csfd/index.ts";
import { timeExecution } from "./utils/time.ts";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY!;

async function main() {
  const [fetchError, html] = await fetchScreenings();
  if (fetchError !== null) {
    console.log("error while fetching screenings", fetchError);
    return;
  }

  const { screenings, logs, time } = timeExecution(() => parseScreenings(html));
  // console.log(screenings);
  console.log({ logs });
  console.log(`parsing took ${time}mls`);

  const filtered = screenings
    .filter((s) => !s.cinema.startsWith("CineStar"))
    .filter((s) => !s.cinema.startsWith("Premier Cinemas"))
    .filter(
      (s) =>
        !(s.cinema.startsWith("Cinema City") && !s.cinema.includes("Flora")),
    );

  // The client gets the API key from the environment variable `GEMINI_API_KEY`.
    console.log({GEMINI_API_KEY});
  const gemini = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

  const response = await gemini.models.generateContent({
    model: "gemini-3-flash-preview",
    contents:
      "I want you to choose an interesting screenings for me. Focus primarily on older movies, they should be pretty rare. In case of newer ones, focus on non-mainstream but also don't be very picky, I enjoy stuff like Marvel too from time to time. I just want to know what stuff appears in cinemas to get updates. Output them as title, cinema, date and time. Keep your wording consice - don't mention anything personal, it can be used for other people too, but if you still feel like describing a movie please do so. Here are the screenings: " +
      `${JSON.stringify(screenings)}`,
  });
  console.log(response.text);
  // console.log(filtered.slice(-100))
}

main();
