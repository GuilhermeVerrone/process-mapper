import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { areaRoutes } from './area.routes';
import { authMiddleware } from '../middlewares/authMiddleware';
import { processRoutes } from './process.routes';

const routes = Router();
const authController = new AuthController();

// Rotas públicas
routes.post('/register', authController.register);
routes.post('/login', authController.login);

// A partir daqui, todas as rotas precisam de autenticação
routes.use(authMiddleware);

// Rotas protegidas
routes.use('/areas', areaRoutes);
routes.use('/processes', processRoutes); 

export { routes };