import { fetchScreenings, parseScreenings } from "./csfd/index.ts";

async function main() {
  const [fetchError, html] = await fetchScreenings();
  if (fetchError !== null) {
    console.log("error while fetching screenings", fetchError);
    return;
  }

  const { screenings, logs } = parseScreenings(html);
  console.log(screenings);
  console.log(logs);
}

main();
