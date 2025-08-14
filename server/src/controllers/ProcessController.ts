import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class ProcessController {
  // Lista todos os processos de uma área
  async index(req: Request, res: Response) {
    const { areaId } = req.query;
    if (!areaId) {
      return res.status(400).json({ message: 'Area ID is required.' });
    }
    try {
      const processes = await prisma.process.findMany({
        where: { areaId: String(areaId) },
      });
      return res.json(processes);
    } catch (error) {
      console.error("ERRO EM 'index':", error);
      return res.status(500).json({ message: 'Internal server error while fetching processes.' });
    }
  }
  
  // Cria um novo processo
  async create(req: Request, res: Response) {
    const { name, description, owner, areaId, parentId, positionX, positionY, color, systemsAndTools, type } = req.body;
    
    if (!name || !areaId) {
      return res.status(400).json({ message: 'Name and Area ID are required.' });
    }

    try {
      const process = await prisma.process.create({
        data: { name, description, owner, areaId, parentId, positionX, positionY, color, systemsAndTools, type }
      });
      return res.status(201).json(process);
    } catch (error) {
      console.error("ERRO EM 'create':", error);
      return res.status(500).json({ message: 'Internal server error while creating process.' });
    }
  }

  // Atualiza um processo existente
  async update(req: Request, res: Response) {
    const { id } = req.params;
    const { name, description, owner, color, systemsAndTools, type } = req.body;
    try {
      const updatedProcess = await prisma.process.update({
        where: { id },
        data: { name, description, owner, color, systemsAndTools, type },
      });
      return res.json(updatedProcess);
    } catch (error) {
      console.error("ERRO EM 'update':", error);
      return res.status(404).json({ message: 'Process not found or failed to update.' });
    }
  }

  // Deleta um processo
  async delete(req: Request, res: Response) {
    const { id } = req.params;
    try {
      const children = await prisma.process.count({ where: { parentId: id } });
      if (children > 0) {
        return res.status(400).json({ message: 'Cannot delete a process that has subprocesses.' });
      }
      await prisma.process.delete({ where: { id } });
      return res.status(200).json({ message: 'Process deleted successfully' });
    } catch (error) {
      console.error("ERRO EM 'delete':", error);
      return res.status(404).json({ message: 'Process not found or failed to delete.' });
    }
  }

  // Atualiza a posição de um processo
  async updatePosition(req: Request, res: Response) {
    const { id } = req.params;
    const { positionX, positionY } = req.body;

    if (positionX === undefined || positionY === undefined) {
      return res.status(400).json({ message: 'positionX and positionY are required.' });
    }

    try {
      const updatedProcess = await prisma.process.update({
        where: { id },
        data: { positionX, positionY },
      });
      return res.json(updatedProcess);
    } catch (error) {
      console.error("ERRO EM 'updatePosition':", error);
      return res.status(404).json({ message: 'Process not found or failed to update position.' });
    }
  }
}