import { PrismaClient } from '@prisma/client';
import { hash } from 'bcrypt';

const prisma = new PrismaClient();

async function createUser() {
  const emailUserMaster = 'admin@dafacorretora.com.br';

  let userMaster = await prisma.user.findFirst({
    where: {
      email: emailUserMaster,
    },
  });

  if (!userMaster) {
    const passwordHash = await hash('dafa@123', 8);

    userMaster = await prisma.user.create({
      data: {
        name: 'Admin',
        email: emailUserMaster,
        password: passwordHash,
      },
    });
  }
}

async function main() {
  await createUser();
}
main().catch((err) => {
  console.error('Erro no main:', err);
  process.exit(1); // opcional, se for script Node
});
