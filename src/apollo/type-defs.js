import { gql } from '@apollo/client'

export const typeDefs = gql`
  type Gist {
    id: String!
    created_at: String!
    updated_at: String!
    description: String!
    files: [GistFile!]!
    meta: GistMeta!
  }

  type GistFile {
    filename: String!
    type: String
    language: String
    raw_url: String!
    size: Int
    content: String
  }

  type GistsConnection {
    nodes: [Gist!]!
    pageInfo: PageInfo!
  }

  type GistMeta {
    isFavorite: Boolean!
  }

  type PageInfo {
    hasNextPage: Boolean!
  }

  type Query {
    getPublicGistsForUser(
      username: String!
      page: Int
      perPage: Int
    ): GistsConnection
    getGistById(gistId: String!): Gist
    getFavoriteGists(limit: Int, offset: Int): [Gist!]!
  }

  type Mutation {
    favoriteGist(gistId: String!): Gist
    unfavoriteGist(gistId: String!): Gist
  }
`
