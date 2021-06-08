import * as github from 'src/github'
import parseLinkHeader from 'parse-link-header'

export const resolvers = {
  Query: {
    async getPublicGistsForUser(_parent, { username, perPage, page }) {
      const { data, headers } = await github.getPublicGistsForUser(username, {
        per_page: perPage,
        page,
      })
      return {
        nodes: data,
        pageInfo: pageInfoFromLinkHeader(headers.link),
      }
    },
  },
}

function pageInfoFromLinkHeader(header) {
  const link = parseLinkHeader(header)
  return {
    hasNextPage: typeof link?.next !== 'undefined',
  }
}
