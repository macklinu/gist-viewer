import { gql } from '@apollo/client'

export const typeDefs = gql`
  type Gist {
    id: String!
    created_at: String!
    updated_at: String!
    description: String!
  }

  type GistsConnection {
    nodes: [Gist!]!
    pageInfo: PageInfo!
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
  }
`
