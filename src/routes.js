import { Router } from 'express';

import UserController from './http/controllers/UserController';
import AuthController from './http/controllers/AuthController';

import authMiddleware from './http/middlewares/auth';

const routes = new Router();

routes.post('/users', UserController.store);
routes.post('/login', AuthController.login);

routes.use(authMiddleware); // Após essa chamada só acessa o endpoint quem está logado

routes.put('/users', UserController.update);

export default routes;
