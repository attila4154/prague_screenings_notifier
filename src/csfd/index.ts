import { JSDOM } from "jsdom";
import type { Result } from "../utils/result.ts";
import { wrapNullableInResult } from "../utils/result.ts";

const URL = "https://www.csfd.cz/en/cinema/1-praha/";

export type FlatScreening = {
  cinema: string;
  date: string;
  time: string;
  filmName: string;
};

export async function fetchScreenings(): Promise<Result<string>> {
  let res;
  try {
    res = await fetch(URL);
  } catch (err) {
    return [err as Error, null];
  }

  const text = await res.text();
  return [null, text];
}

function getCinemaName(cinemaSection: Element) {
  const cinemaName = cinemaSection.querySelector("h2")?.textContent.trim();

  return wrapNullableInResult(cinemaName);
}

function getDate(cinemaSection: Element): Result<string, string> {
  const date = cinemaSection
    .querySelector(".update-box-sub-header")
    ?.textContent.trim()
    .split("\t")[0]!
    .trim();

  return wrapNullableInResult(date);
}

function getFilmName(screeningRow: Element) {
  const filmName = screeningRow.querySelector("a.film-title-name")?.textContent;

  return wrapNullableInResult(filmName);
}

function getTimes(screeningRow: Element) {
  return [...screeningRow.querySelectorAll(".td-time")].map((t) =>
    t.textContent.trim(),
  );
}

export function parseScreenings(html: string): {
  screenings: FlatScreening[];
  logs: string[];
} {
  const document = new JSDOM(html).window.document;

  const screenings: FlatScreening[] = [];
  const logs: string[] = [];

  const cinemaSections = [...document.querySelectorAll(".updated-box-cinema")];
  if (!cinemaSections.length) {
    logs.push("Error: No cinema sections found - returning empty list");
    return { screenings, logs };
  }

  for (const cinemaSection of cinemaSections) {
    const screeningsRows = cinemaSection.querySelectorAll("tr");

    const [cinemaErr, cinema] = getCinemaName(cinemaSection);
    const [dateErr, date] = getDate(cinemaSection);

    if (cinemaErr) {
      logs.push("Warn: Could not find ciname name - skipping it");
    }
    if (dateErr) {
      logs.push("Warn: Could not find date - skipping it");
    }

    if (cinemaErr || dateErr) {
      continue;
    }

    for (const screeningsRow of screeningsRows) {
      const [filmErr, filmName] = getFilmName(screeningsRow);
      if (filmErr) {
        logs.push(
          `Warn: Could not get film name for ${{ cinema, date }} - skipping it`,
        );
        continue;
      }

      const times = getTimes(screeningsRow);
      for (const time of times) {
        screenings.push({
          cinema: cinema!,
          date: date!,
          time,
          filmName: filmName!,
        });
      }
    }
  }

  return { screenings, logs };
}
