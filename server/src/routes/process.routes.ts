import { Router } from 'express';
import { ProcessController } from '../controllers/ProcessController';

const processRoutes = Router();
const processController = new ProcessController();

processRoutes.get('/', processController.index); 
processRoutes.post('/', processController.create);
processRoutes.patch('/:id/position', processController.updatePosition); 

export { processRoutes };