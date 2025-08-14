import { Router } from 'express';
import { AreaController } from '../controllers/AreaController';

const areaRoutes = Router();
const areaController = new AreaController();

areaRoutes.get('/', areaController.index);
areaRoutes.post('/', areaController.create);
areaRoutes.put('/:id', areaController.update);
areaRoutes.delete('/:id', areaController.delete); 

export { areaRoutes };