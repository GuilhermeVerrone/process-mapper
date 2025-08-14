// Substitua o conteúdo do seu ProcessController.ts por este:

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
    const processes = await prisma.process.findMany({
      where: { areaId: String(areaId) },
    });
    return res.json(processes);
  }
  
  // Cria um novo processo
  async create(req: Request, res: Response) {
    const { name, description, owner, areaId, parentId, positionX, positionY, color, systemsAndTools  } = req.body;
  
    
    if (!name || !areaId) {
      return res.status(400).json({ message: 'Name and Area ID are required.' });
    }

    const process = await prisma.process.create({
    data: { 
      name, description, owner, areaId, parentId, positionX, positionY, color, systemsAndTools
    }
  });
    return res.status(201).json(process);
  }


  async update(req: Request, res: Response) {
  const { id } = req.params;
  
  const { name, description, owner, color,systemsAndTools  } = req.body;
  try {
    const updatedProcess = await prisma.process.update({
      where: { id },
      data: { name, description, owner, color, systemsAndTools  },
    });
    return res.json(updatedProcess);
  } catch (error) {
    return res.status(404).json({ message: 'Process not found.' });
  }
}

  // ✅ NOVO: Deleta um processo
  async delete(req: Request, res: Response) {
    const { id } = req.params;
    try {
      // Importante: Nosso schema não permite deletar em cascata.
      // Primeiro, verificamos se o processo tem filhos.
      const children = await prisma.process.count({ where: { parentId: id } });
      if (children > 0) {
        return res.status(400).json({ message: 'Cannot delete a process that has subprocesses.' });
      }

      await prisma.process.delete({ where: { id } });
      return res.status(200).json({ message: 'Process deleted successfully' });
    } catch (error) {
      return res.status(404).json({ message: 'Process not found.' });
    }
  }

  // Atualiza a posição de um processo
  async updatePosition(req: Request, res: Response) {
    const { id } = req.params;
    const { positionX, positionY, } = req.body;

    if (positionX === undefined || positionY === undefined) {
      return res.status(400).json({ message: 'positionX and positionY are required.' });
    }

    const updatedProcess = await prisma.process.update({
      where: { id },
      data: { positionX, positionY, },
    });
    return res.json(updatedProcess);
  }
}