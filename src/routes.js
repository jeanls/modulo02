import { Router } from 'express';

import multer from 'multer';
import multerConfig from './config/multer';
import consts from './config/consts';

import UserController from './http/controllers/UserController';
import AuthController from './http/controllers/AuthController';
import FileController from './http/controllers/FileController';
import ProviderController from './http/controllers/ProviderController';
import AppointmentController from './http/controllers/AppointmentController';
import ScheduleController from './http/controllers/ScheduleController';
import NotificationController from './http/controllers/NotificationController';

import authMiddleware from './http/middlewares/auth';
import roleMiddleware from './http/middlewares/role';

const routes = new Router();
const upload = multer(multerConfig);

routes.post('/users', UserController.store);
routes.post('/login', AuthController.login);

routes.use(authMiddleware); // Após essa chamada só acessa o endpoint quem está logado

routes.put('/users', UserController.update);
routes.post('/files', upload.single('file'), FileController.store);
routes.get('/providers', ProviderController.index);

routes.get('/appointments', AppointmentController.index);
routes.post('/appointments', AppointmentController.store);
routes.delete('/appointments/:id', AppointmentController.delete);

routes.get(
  '/schedule',
  roleMiddleware.grantAccess(consts.userProvider),
  ScheduleController.index
);

routes.get(
  '/notifications',
  roleMiddleware.grantAccess(consts.userProvider),
  NotificationController.index
);

routes.put(
  '/notifications/:id',
  roleMiddleware.grantAccess(consts.userProvider),
  NotificationController.update
);
export default routes;
