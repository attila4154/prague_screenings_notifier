import { JSDOM } from "jsdom";
import type { Result } from "../utils/result.js";

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

  return cinemaName;
}

function getDate(cinemaSection: Element) {
  const date = cinemaSection
    .querySelector(".update-box-sub-header")
    ?.textContent.trim()
    .split("\t")[0]!
    .trim();

  return date;
}

function getFilmName(screeningRow: Element) {
  return screeningRow.querySelector("a.film-title-name")?.textContent;
}

function getTimes(screeningRow: Element) {
  return [...screeningRow.querySelectorAll(".td-time")].map((t) =>
    t.textContent.trim(),
  );
}

export function parseScreenings(html: string) {
  const document = new JSDOM(html).window.document;

  const screenings: FlatScreening[] = [];

  const cinemaSections = document.querySelectorAll(".updated-box-cinema");

  for (const cinemaSection of cinemaSections) {
    const screeningsRows = cinemaSection.querySelectorAll("tr");

    const cinemaName = getCinemaName(cinemaSection);
    const date = getDate(cinemaSection);

    for (const screeningsRow of screeningsRows) {
      const filmName = getFilmName(screeningsRow);

      const times = getTimes(screeningsRow);
      for (const time of times) {
        screenings.push({ cinema: cinemaName, date, time, filmName });
      }
    }
  }

  return screenings;
}
