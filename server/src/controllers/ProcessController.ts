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
            include: { children: true } // Opcional: já trazer os filhos diretos
        });
        return res.json(processes);
    }

    // Cria um novo processo
    async create(req: Request, res: Response) {
        const { name, description, owner, areaId, parentId, positionX, positionY } = req.body;

        // Validação básica
        if (!name || !areaId) {
            return res.status(400).json({ message: 'Name and Area ID are required.' });
        }

        const process = await prisma.process.create({
            data: {
                name,
                description,
                owner,
                areaId,
                parentId,
                positionX,
                positionY
            }
        });
        return res.status(201).json(process);
    }

    // Atualiza a posição de um processo (para o React Flow)
    async updatePosition(req: Request, res: Response) {
        const { id } = req.params;
        const { positionX, positionY } = req.body;

        if (positionX === undefined || positionY === undefined) {
            return res.status(400).json({ message: 'positionX and positionY are required.' });
        }

        const updatedProcess = await prisma.process.update({
            where: { id },
            data: { positionX, positionY },
        });

        return res.json(updatedProcess);
    }
}