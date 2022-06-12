const express = require("express");
const bodyParser = require("body-parser");
const graphQlHttp = require("express-graphql").graphqlHTTP;
const mongoose = require("mongoose");

const graphQLSchema = require("./graphql/schema/index");
const graphQLResolvers = require("./graphql/resolvers/index");
const isAuth = require("./middleware/is-auth");

const app = express();

app.use(bodyParser.json());

app.use(isAuth);

app.use(
  "/graphql",
  graphQlHttp({
    schema: graphQLSchema,
    rootValue: graphQLResolvers,
    graphiql: true,
  })
);

mongoose
  .connect(
    `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0.k6xrj.mongodb.net/graphqleventbooking?retryWrites=true&w=majority`
  )
  .then(() => {
    console.log("db connected");
    app.listen(5001);
  })
  .catch((err) => {
    console.log(err);
  });
