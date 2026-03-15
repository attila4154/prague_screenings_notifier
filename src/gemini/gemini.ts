import { GoogleGenAI } from "@google/genai";
import type { FlatScreening } from "../csfd/index.js";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY!;
const gemini = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

export async function findScreenings(screenings: FlatScreening[]) {
  const response = await gemini.models.generateContent({
    model: "gemini-3-flash-preview",
    contents:
      "I want you to choose an interesting screenings for me. Focus primarily on older movies, they should be pretty rare. In case of newer ones, focus on non-mainstream but also don't be very picky, I enjoy stuff like Marvel too from time to time. I just want to know what stuff appears in cinemas to get updates. Output them as title, cinema, date and time. Keep your wording consice - don't mention anything personal, it can be used for other people too, but if you still feel like describing a movie please do so. Use markdown syntax but only bold, italic styles. It will be output to a telegram bot. Here are the screenings: " +
      `${JSON.stringify(screenings)}`,
  });

  return response;
}
