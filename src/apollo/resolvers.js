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
        nodes: data.map(convertGistForSchema),
        pageInfo: pageInfoFromLinkHeader(headers.link),
      }
    },
    async getGistById(_parent, { gistId }) {
      try {
        const { data } = await github.getGistById(gistId)
        return convertGistForSchema(data)
      } catch (error) {
        console.error(error)
        return null
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

function convertGistForSchema(gist) {
  return {
    ...gist,
    files: Object.values(gist.files),
  }
}
