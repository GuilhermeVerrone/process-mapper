import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class AreaController {
  async index(req: Request, res: Response) {
    const areas = await prisma.area.findMany();
    return res.json(areas);
  }

  async create(req: Request, res: Response) {
    const { name, owner } = req.body;
    const area = await prisma.area.create({
      data: { name, owner },
    });
    return res.status(201).json(area);
  }

  async update(req: Request, res: Response) {
    const { id } = req.params;
    const { name, owner } = req.body;

    try {
      const updatedArea = await prisma.area.update({
        where: { id },
        data: { name, owner },
      });
      return res.json(updatedArea);
    } catch (error) {
      return res.status(404).json({ message: 'Area not found.' });
    }
  }

  async delete(req: Request, res: Response) {
    const { id } = req.params;

    try {
      await prisma.area.delete({
        where: { id },
      });
      return res.status(200).json({ message: 'Area deleted successfully.' });
    } catch (error) {
      return res.status(404).json({ message: 'Area not found.' });
    }
  }
}