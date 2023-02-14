import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { Neo4jGraphQL } from "@neo4j/graphql";
import neo4j from "neo4j-driver";

// const neo4jDriver = neo4j.driver(
//     'neo4j://localhost',
//     neo4j.auth.basic('neo4j', 'password')
// )

const typeDefs = `#graphql
    type Book {
        title: String
        author: String
    }

    type Query {
        books: [Book]
    }
`;

const books = [
    {
        title: "Harry Potter",
        author: "J.K. Rowling"
    },
    {
        title: "The Lord of the Rings",
        author: "J.R.R. Tolkien"
    }
];

const resolvers = {
    Query: {
        books: () => books
    }
};

// new ApolloServer constructor takes two arguments: your schema
// definition and your set of resolvers.
const server = new ApolloServer({
    typeDefs,
    resolvers
});

// Passing an apollo server instance to the startStandaloneServer function
// 1. creates an express app
// 2. installs apollo server as middleware
// 3. prepares app to handle requests

const { url } = await startStandaloneServer(server, {
    listen: { port: 4000 },
});

console.log(`Apollo Server ready at ${url}`);
