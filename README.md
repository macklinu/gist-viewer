# Gist Viewer

> Initially bootstrapped with https://github.com/vercel/next.js/tree/canary/examples/api-routes-apollo-server-and-client

This application uses [Apollo GraphQL](https://www.apollographql.com/), GitHub API via [axios](https://github.com/axios/axios), Postgres via [node-postgres](https://node-postgres.com/), and [Next.js](https://nextjs.org/) to showcase a full-stack application for searching and viewing GitHub Gists by username, with the additional functionality of favoriting and unfavoriting gists.

I spent about 2 hours and 30 minutes with a break in the middle. Core functionality is in place. I'd like to look into the following changes:

- Support gist pagination. The API is mostly in place - it's just supporting it in the UI and making any necessary tweaks to the GraphQL API to support fetching paged results.
- Improve styling. I added some inline styles to arrange some things, but using a component library or writing more CSS would be a nice next step.
- Exploring Next.js pages while maintaining the state of the Apollo client cache. I would like it if when searching for a user's gists, clicking on a gist summary would navigate to a page like `/gists/{gistId}`, and when pressing the back button, it would navigate back to the list of search results at the previous state you were viewing it. I didn't get time to explore the intersection of Next.js pages and Apollo client caching to make sure they were better in sync and opted to have everything accessible at one URL (`/`) with page state managed with React.
- Set up ESLint and possibly TypeScript. These are a couple of developer tools that I appreciate using, but trying to confine myself to ~2 hour time limit, I chose not to set these up at this time, despite finding them especially valuable to warn for common errors (especially mispelled, improperly defined variables, or React hook dependency arrays).

Check out `pages/index.js` to view the client-side code. The server-side code that defines the GraphQL schema and interactions with Postgres and GitHub are in the `src/` directory.

## Setup

Ensure that you have [Docker](https://docs.docker.com/get-docker/) installed on your machine.

## Run

To run the application, run `docker-compose up` to boot up the web application container and the Postgres container. The app will be running at http://localhost:3000.

To view an interactive GraphQL API playground, visit http://localhost:3000/api/graphql.

To stop the development server, press <kbd>ctrl+c</kbd>.

If you choose to add or remove dependencies, you at times may need to run `docker-compose down` and `docker-compose rebuild web` for the node module changes to take effect.
