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
}