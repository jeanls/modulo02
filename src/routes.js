import { Router } from 'express';
import Brute from 'express-brute';
import BruteRedis from 'express-brute-redis';

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
import AvaiableController from './http/controllers/AvaiableController';

import authMiddleware from './http/middlewares/auth';
import roleMiddleware from './http/middlewares/role';

import UserStoreValidation from './http/validations/user/UserStore';
import UserUpdateValidation from './http/validations/user/UserUpdate';
import AuthLoginValidation from './http/validations/auth/AuthLogin';
import AppointmentStoreValidation from './http/validations/appointment/AppointmentStore';

const routes = new Router();
const upload = multer(multerConfig);
const bruteStore = new BruteRedis({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
});
const bruteForce = new Brute(bruteStore);

routes.post('/users', UserStoreValidation, UserController.store);
routes.post(
  '/login',
  bruteForce.prevent,
  AuthLoginValidation,
  AuthController.login
);

routes.use(authMiddleware); // Após essa chamada só acessa o endpoint quem está logado

routes.put('/users', UserUpdateValidation, UserController.update);
routes.post('/files', upload.single('file'), FileController.store);

routes.get('/providers', ProviderController.index);
routes.get('/providers/:providerId/avaiable', AvaiableController.index);

routes.get('/appointments', AppointmentController.index);
routes.post(
  '/appointments',
  AppointmentStoreValidation,
  AppointmentController.store
);
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
