const { Octokit } = require("octokit");
const { ReadmeBox } = require("readme-box");
const dayjs = require("dayjs");

// https://day.js.org/docs/en/plugin/timezone
const utc = require("dayjs/plugin/utc");
const timezone = require("dayjs/plugin/timezone"); // depends on utc plugin

dayjs.extend(utc);
dayjs.extend(timezone);

// https://day.js.org/docs/en/plugin/iso-week
const isoWeek = require("dayjs/plugin/isoWeek");
dayjs.extend(isoWeek);

// config
const owner = "jsla";
const repo = "lunch.js";
const dateNextEvent = getDateOfNextEvent();

run();

async function run() {
  // Create Octokit constructor with custom user agent
  const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN,
    userAgent: "lunch.js.la",
  });

  // load all open issues with the `lunch.js event` label
  const issues = await octokit.paginate("GET /repos/{owner}/{repo}/issues", {
    owner,
    repo,
    labels: "lunch.js event",
    state: "open",
    per_page: 100,
  });

  const upcomingEvents = issues.map((issue) => {
    const [location] = issue.title.split(/\s+-\s+/g);

    return {
      issue,
      location,
    };
  });

  // Create markdown code for both show sectiosn
  const upcomingEventsText = upcomingEvents
    .map(({ location, issue }) => {
      return `- [#${issue.number}](${issue.html_url}) ${location}, championed by [@${issue.user.login}](${issue.user.html_url})`;
    })
    .join("\n");

  markdown = `## Join lunch.js on ${dateNextEvent.format(
    "MMM d, YYYY [at] H:mma"
  )}
  
${upcomingEventsText}`;

  // update the upcoming events in the README
  await ReadmeBox.updateSection(markdown, {
    owner,
    repo,
    token: process.env.GITHUB_TOKEN,
    section: "events",
    branch: "master",
    message: "docs(README): update upcoming shows",
  });

  console.log("README updated in %s/%s", owner, repo);
}

/**
 * @param {import('dayjs').Dayjs} day
 */
function getFirstTuesdayOfMonth(day) {
  const tuesday = day.isoWeekday(9);

  if (tuesday.date() > 7) {
    return tuesday.subtract(1, "week");
  }

  return tuesday;
}

/**
 * @returns {import('dayjs').Dayjs}
 */
function getDateOfNextEvent() {
  const today = dayjs().startOf("day").tz("America/Los_Angeles");

  // get first Tuesday of current month
  let eventDay = getFirstTuesdayOfMonth(today.startOf("month"));

  if (eventDay < today) {
    eventDay = getFirstTuesdayOfMonth(
      eventDay.startOf("month").add(1, "month")
    );
  }

  return eventDay.add(12, "hours").add(30, "minutes");
}
