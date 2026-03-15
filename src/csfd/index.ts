import { parse, type HTMLElement } from "node-html-parser";
import type { Result } from "../utils/result.js";
import { wrapNullableInResult } from "../utils/result.js";
import { enumerate } from "../utils/enumerate.js";

const URL = "https://www.csfd.cz/en/cinema/1-praha/?period=week";

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

function getCinemaName(cinemaSection: HTMLElement) {
  const cinemaName = cinemaSection
    .querySelector("h2")
    ?.textContent.trim()
    .split("Prague - ")[1];

  return wrapNullableInResult(cinemaName);
}

function getDateScreeningRows(
  cinemaSection: HTMLElement,
): Result<[string, HTMLElement][], string> {
  const dateRows = [
    ...cinemaSection.querySelectorAll(".update-box-sub-header"),
  ];
  const dateScreeningRows = [
    ...cinemaSection.querySelectorAll(".box-content-table-cinema"),
  ];

  if (dateRows.length !== dateScreeningRows.length) {
    return [
      `Date rows number mismatch: ${{ dates: dateRows.length, datesScreenings: dateScreeningRows.length }}`,
      null,
    ];
  }

  const dates = dateRows.map((d) =>
    d.textContent.trim().split("\t")[0]!.trim(),
  );

  return [null, enumerate(dates, dateScreeningRows)];
}

function getFilmName(screeningRow: HTMLElement) {
  const filmName = screeningRow.querySelector("a.film-title-name")?.textContent;

  return wrapNullableInResult(filmName);
}

function getTimes(screeningRow: HTMLElement) {
  return [...screeningRow.querySelectorAll(".td-time")].map((t) =>
    t.textContent.trim(),
  );
}

export function parseScreenings(html: string): {
  screenings: FlatScreening[];
  logs: string[];
} {
  const root = parse(html);

  const screenings: FlatScreening[] = [];
  const logs: string[] = [];

  const cinemaSections = [...root.querySelectorAll(".updated-box-cinema")];
  if (!cinemaSections.length) {
    logs.push("Error: No cinema sections found - returning empty list");
    return { screenings, logs };
  }

  for (const cinemaSection of cinemaSections) {
    const [cinemaErr, cinema] = getCinemaName(cinemaSection);
    if (cinemaErr) {
      logs.push("Warn: Could not find ciname name - skipping it");
    }
    const [sErr, dateScreeningRowsPairs] = getDateScreeningRows(cinemaSection);
    if (sErr) {
      logs.push(`Warn: Could not get dates for ${{ cinema }}, error: ${sErr}`);
      continue;
    }

    if (cinemaErr) {
      continue;
    }

    for (const [date, screeningRowsBlock] of dateScreeningRowsPairs!) {
      const screeningRows = screeningRowsBlock.querySelectorAll("tr");

      for (const screeningRow of screeningRows) {
        const [filmErr, filmName] = getFilmName(screeningRow);
        if (filmErr) {
          logs.push(
            `Warn: Could not get film name for ${{ cinema, date }} - skipping it`,
          );
          continue;
        }

        const times = getTimes(screeningRow);
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
  }

  return { screenings, logs };
}
