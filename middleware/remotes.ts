import { useLocalStorage } from "@vueuse/core";
export default defineNuxtRouteMiddleware(async (to, from) => {
  const availableRemotes = useLocalStorage("availableRemotes", []);
  const enabledRemotes = useLocalStorage("enabledRemotes", []);

  if (!availableRemotes.value.length) {
    // Fetch remotes
    const response = await fetch(
      "https://api.github.com/search/repositories?q=topic:teatime-database&sort=stars&order=desc",
      // "/repos.json", // localdev
    );
    let { items } = await response.json();
    // if (!items.length) {
    //   items = [
    //     {
    //       full_name: "yourmargin/libgen-db",
    //       description:
    //         "Library Genesis Non-Fiction, metadata snapshot from archive.org",
    //       stargazers_count: 10,
    //     },
    //     {
    //       full_name: "bjesus/teatime-datase",
    //       description: "Public domain library",
    //       stargazers_count: 5,
    //     },
    //     {
    //       full_name: "bjesus/teatime-json-datase",
    //       description: "An example database with The Communist Manifesto",
    //       stargazers_count: 1,
    //     },
    //   ];
    // }
    availableRemotes.value = await Promise.all(
      items.map(async (r) => {
        const [owner, repo] = r.full_name.split("/");
        const response = await fetch(
          `https://${owner}.github.io/${repo}/config.json`,
        );
        const config = await response.json();

        return {
          full_name: r.full_name,
          description: r.description,
          stargazers_count: r.stargazers_count,
          config,
        };
      }),
    );
    // Enable all
    enabledRemotes.value = items.map((r) => r.full_name);
  }
});
