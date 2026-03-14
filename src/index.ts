import { fetchScreenings, parseScreenings } from "./csfd/index.ts";
import { timeExecution } from "./utils/time.ts";

async function main() {
  const [fetchError, html] = await fetchScreenings();
  if (fetchError !== null) {
    console.log("error while fetching screenings", fetchError);
    return;
  }

  const { screenings, logs, time } = timeExecution(() => parseScreenings(html));
  console.log(screenings);
  console.log(logs);
  console.log(`parsing took ${time}mls`);

  const filtered = screenings
    .filter((s) => !s.cinema.startsWith("CineStar"))
    .filter(
      (s) =>
        !(s.cinema.startsWith("Cinema City") && !s.cinema.includes("Flora")),
    );

  console.log(screenings.length);
  console.log(filtered.length);
  console.log(new Set(filtered.map((s) => s.cinema)));
}

main();
