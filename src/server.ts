//TODO
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import cors from 'cors';
import bodyParser from 'body-parser';
// need to import .js file after compilation
// import { typeDefs, resolvers, /*mocks*/} from "./schema.js";
import { typeDefs, resolvers } from "./neo4j-schema.js";
import express from 'express';
import http from "http";
import morgan from "morgan";


// env variables
import dotenv  from "dotenv"
dotenv.config()

// import neo4j services
import neo4j from "neo4j-driver";
import { Neo4jGraphQL } from "@neo4j/graphql";

// credentials
const USERNAME: string = process.env.NEO4J_USERNAME;
const AURA_ENDPOINT: string = process.env.NEO4J_AURA_ENDPOINT_PROD;
const PASSWORD: string = process.env.NEO4J_PASSWORD_PROD;

const neo4jdriver = neo4j.driver(AURA_ENDPOINT, neo4j.auth.basic(USERNAME, PASSWORD));
const neo4jschema = new Neo4jGraphQL({
  typeDefs: typeDefs, 
  driver: neo4jdriver,
  resolvers: resolvers,
})

export function context() {
  return {driver: neo4jdriver}
}

// Required logic for integrating with Express
const app = express();
// httpServer handles incoming requests to our Express app.
// Below tell Apollo Server to "drain" this httpServer,
// enabling the server to shut down gracefully.
const httpServer = http.createServer(app);

interface MyContext {
  token?: string;
};

// Same ApolloServer initialization as before, plus the drain plugin
// for our httpServer.
const server = new ApolloServer<MyContext>({
  // schema: addMocksToSchema({
  //   schema: makeExecutableSchema({typeDefs, resolvers}), mocks
  // }),
  schema: await neo4jschema.getSchema(),
  plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
});

// Ensure we wait for our server to start
await server.start();

// Set up our Express middleware to handle CORS, body parsing,
// and our expressMiddleware function.
app.use(morgan('dev'));


// placeholder, server also supports restful api calls
app.get('/restapitest', (req, res) => {
  console.log('API');
  res.send("RECEIVED")
})


app.use(
  '/graphql',
  cors<cors.CorsRequest>(),
  bodyParser.json(),
  // expressMiddleware accepts the same arguments:
  // an Apollo Server instance and optional configuration options
  expressMiddleware(server, {
    context: async ({ req }) => ({ token: req.headers.token }),
  }),
);

// Modified server startup
await new Promise<void>((resolve) => httpServer.listen({ port: 4000 }, resolve));
console.log(`TIE Server ready at http://localhost:4000/graphql`);

