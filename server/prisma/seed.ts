import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding ...');

  // Limpar dados existentes
  await prisma.auditLog.deleteMany();
  await prisma.document.deleteMany();
  await prisma.process.deleteMany();
  await prisma.area.deleteMany();
  await prisma.user.deleteMany();

  // Criar usuário
  const hashedPassword = await bcrypt.hash('123456', 10);
  const user = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      name: 'Admin User',
      password: hashedPassword,
    },
  });
  console.log(`Created user: ${user.name}`);

  // Criar Área
  const areaRH = await prisma.area.create({
    data: {
      name: 'Recursos Humanos',
      owner: 'Ana Silva',
    },
  });
  console.log(`Created area: ${areaRH.name}`);

  // Criar Processo Pai
  const p1 = await prisma.process.create({
    data: {
      name: 'Contratação de Funcionário',
      description: 'Processo completo para novas contratações.',
      owner: 'Carlos Mendes',
      areaId: areaRH.id,
      positionX: 50,
      positionY: 50,
    },
  });
  console.log(`Created process: ${p1.name}`);

  // Criar Processo Filho
  const p2 = await prisma.process.create({
    data: {
      name: 'Entrevista com Gestor',
      description: 'Etapa final da entrevista.',
      owner: 'Fernanda Lima',
      areaId: areaRH.id,
      parentId: p1.id, // Ligando ao processo pai
      positionX: 300,
      positionY: 150,
    },
  });
  console.log(`Created child process: ${p2.name}`);

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });