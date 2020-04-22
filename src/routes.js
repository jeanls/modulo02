import { Router } from 'express';

import multer from 'multer';
import multerConfig from './config/multer';

import UserController from './http/controllers/UserController';
import AuthController from './http/controllers/AuthController';
import FileController from './http/controllers/FileController';
import ProviderController from './http/controllers/ProviderController';

import authMiddleware from './http/middlewares/auth';

const routes = new Router();
const upload = multer(multerConfig);

routes.post('/users', UserController.store);
routes.post('/login', AuthController.login);

routes.use(authMiddleware); // Após essa chamada só acessa o endpoint quem está logado

routes.put('/users', UserController.update);
routes.post('/files', upload.single('file'), FileController.store);
routes.get('/providers', ProviderController.index);
export default routes;
