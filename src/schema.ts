import { gql } from 'graphql-tag'

export const typeDefs = gql`
  # Schema definitions go here

  "A track is a group of Modules that teaches about a specific topic"
  type Query {
    spaceCats: [SpaceCat]
    tracksForHome: [Track!]!
  }

  type SpaceCat {
    id: ID!
    name: String!
    age: Int
    missions: [Mission]
  }

  type Mission {
    id: ID!
    name: String!
    description: String!
  }

  "A track is a group of Modules that teaches about a specific topic"
  type Track {
    id: ID!
    "The track's title"
    title: String!
    "The track's main author"
    author: Author!
    "The track's main illustration to display in track card or track page detail"
    thumbnail: String
    "The track's approximate length to complete, in minutes"
    length: Int
    "The number of modules this track contains"
    modulesCount: Int
  }

  "Author of a complete Track"
  type Author {
    id: ID!
    "Author's first and last name"
    name: String!
    "Author's profile picture url"
    photo: String
  }
`;

export const mocks = {
  // define your mock properties here
  SpaceCat: () => ({
    id: () => "spacecat_01",
    title: () => "spacecat pioneer"
  }),
  Track: () => ({
    id: () => "track_01",
    title: () => "Astro Kitty, Space Explorer",
    author: () => {
      return {
        name: "Grumpy Cat",
        photo:
          "https://res.cloudinary.com/dety84pbu/image/upload/v1606816219/kitty-veyron-sm_mctf3c.jpg",
      };
    },
    thumbnail: () =>
      "https://res.cloudinary.com/dety84pbu/image/upload/v1598465568/nebula_cat_djkt9r.jpg",
    length: () => 1210,
    modulesCount: () => 1,
  }),
}

export const resolvers = {
  Query: {
    spaceCats: () => mocks.SpaceCat(),
    tracksForHome: () => mocks.Track(),
  },
};


