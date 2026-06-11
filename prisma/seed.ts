import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log(`Start seeding ...`)

  // Create roles
  const roles = ['super_admin', 'admin', 'usuario']
  for (const nombre of roles) {
    await prisma.rol.upsert({
      where: { nombre },
      update: {},
      create: { nombre },
    })
  }

  // Create general categories
  const categories = [
    { nombre: 'Acoso o Violencia', descripcion: 'Protocolos relacionados al acoso escolar o violencia fisica.' },
    { nombre: 'Accidentes', descripcion: 'Protocolos ante accidentes escolares.' },
    { nombre: 'Salud Integral', descripcion: 'Protocolos de apoyo socioemocional y vulneraciones.' }
  ]
  for (const cat of categories) {
    await prisma.categoriaProtocolo.upsert({
      where: { nombre: cat.nombre },
      update: {},
      create: cat,
    })
  }

  // Create default school
  const colegio = await prisma.colegio.create({
    data: {
      nombre_colegio: 'Colegio de Excelencia',
      configuracion_sistema: {
        create: {
          comportamiento_envio: 'preguntar_siempre'
        }
      }
    }
  })

  // Create super admin
  const rolSuperAdmin = await prisma.rol.findUnique({ where: { nombre: 'super_admin' } })
  const user = await prisma.usuario.upsert({
    where: { user: 'admin' },
    update: {},
    create: {
      user: 'admin',
      pass: 'admin123', // In a real app we would hash this
      nombre_completo: 'Administrador del Sistema',
      mail: 'admin@colegio.cl',
      celular: '912345678',
      id_rol: rolSuperAdmin!.id,
      cargo: 'Director',
      id_colegio: colegio.id // assigned to our default school
    },
  })
  
  const userAbogada = await prisma.usuario.upsert({
    where: { user: 'sol_abogada' },
    update: {},
    create: {
      user: 'sol_abogada',
      pass: 'sol123',
      nombre_completo: 'Sol (Abogada)',
      mail: 'sol@colegio.cl',
      celular: '987654321',
      id_rol: rolSuperAdmin!.id,
      cargo: 'Abogado',
      id_colegio: colegio.id 
    },
  })

  // Create a student
  await prisma.alumno.upsert({
    where: { rut: '21.123.456-7' },
    update: {},
    create: {
      rut: '21.123.456-7',
      nombre: 'Juan Perez',
      telefono: '9876123',
      curso: '1ro Medio C',
      id_colegio: colegio.id
    }
  })

  console.log(`Seeding finished.`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
