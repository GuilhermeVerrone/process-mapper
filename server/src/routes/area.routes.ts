import { Router } from 'express';
import { AreaController } from '../controllers/AreaController';

const areaRoutes = Router();
const areaController = new AreaController();

areaRoutes.get('/', areaController.index);
areaRoutes.post('/', areaController.create);

export { areaRoutes };