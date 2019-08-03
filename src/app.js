import "dotenv/config";

import express from "express";
import { resolve } from "path";
import cors from "cors";
import Youch from "youch";
import * as Sentry from "@sentry/node";
import sentryConfig from "./config/sentry";

import "express-async-errors";

import routes from "./routes";

import "./database";

class App {
  constructor() {
    this.express = express();

    Sentry.init(sentryConfig);

    this.middleware();
    this.routes();
    this.exceptionHandler();
  }

  middleware() {
    this.express.use(Sentry.Handlers.requestHandler());
    this.express.use(cors());
    this.express.use(express.json());
    this.express.use(
      "/files",
      express.static(resolve(__dirname, "..", "tmp", "uploads"))
    );
  }

  routes() {
    this.express.use(routes);
    this.express.use(Sentry.Handlers.errorHandler());
  }

  exceptionHandler() {
    this.express.use(async (err, req, res, next) => {
      if (process.env.NODE_ENV === "development") {
        const errors = await new Youch(err, req).toJSON();

        return res.status(500).json(errors);
      }

      return res.status(500).json({ error: "Internal server error" });
    });
  }
}

export default new App().express;
