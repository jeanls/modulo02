import 'dotenv/config';
import express from 'express';
import * as Sentry from '@sentry/node';
import cors from 'cors';
import helmet from 'helmet';
import redis from 'redis';
import RateLimit from 'express-rate-limit';
import RateLimitRedis from 'rate-limit-redis';
import path from 'path';
import Youch from 'youch';
import 'express-async-errors';
import routes from './routes';
import './database';
import sentryConfig from './config/sentry';

class App {
  constructor() {
    this.server = express();
    Sentry.init(sentryConfig);

    this.middlewares();
    this.routes();
    this.exceptionHandler();
  }

  middlewares() {
    this.server.use(Sentry.Handlers.requestHandler());
    this.server.use(cors());
    this.server.use(helmet());
    this.server.use(express.json());
    this.server.use(
      '/files',
      express.static(path.resolve(__dirname, '..', 'public', 'uploads'))
    );
    if (process.env.NODE_ENV !== 'dev') {
      this.server.use(
        new RateLimit({
          store: new RateLimitRedis({
            client: redis.createClient({
              host: process.env.REDIS_HOST,
              port: process.env.REDIS_PORT,
            }),
          }),
          windowMs: 1000 * 60 * 15,
          max: 100,
        })
      );
    }
  }

  routes() {
    this.server.use(routes);
    this.server.use(Sentry.Handlers.errorHandler());
  }

  exceptionHandler() {
    // eslint-disable-next-line
    this.server.use(async (err, req, res, next) => {
      if (process.env.NODE_ENV === 'dev') {
        const errors = await new Youch(err, req).toJSON();
        return res
          .status(err.code ? err.code : 500)
          .json(err.body ? err.body : errors);
      }
      return res.status(err.code ? err.code : 500).json({ error: err.message });
    });
  }
}

export default new App().server;
