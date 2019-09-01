import { ApolloServer, gql } from "apollo-server-lambda"

import { album, allAlbum, presignedUploadUrl } from "./queries"
import { createAlbum } from "./mutations"

const typeDefs = gql`
  type Album {
    userId: String!
    albumId: String!
    createdAt: String
  }

  type PresignedUrl {
    uploadUrl: String
    readUrl: String
    expiresAt: String
  }

  type Query {
    album(userId: String!, albumId: String!): Album
    allAlbum(userId: String): [Album]
    presignedUploadUrl(albumId: String!): PresignedUrl
  }

  type Mutation {
    createAlbum(userId: String!): Album
  }
`

const resolvers = {
  Query: {
    allAlbum,
    album,
    presignedUploadUrl,
  },
  Mutation: {
    createAlbum,
  },
}

const server = new ApolloServer({ typeDefs, resolvers })

export const handler = server.createHandler({
  cors: {
    origin: "*",
    credentials: true,
  },
})
