'use server';

import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';

export async function createIncidente(data: any, userId: number, idColegio: number) {
  // Create incident
  const incidente = await prisma.incidente.create({
    data: {
      id_creador: userId,
      id_colegio: idColegio,
      id_protocolo_version: data.id_protocolo_version,
      fecha_hora: new Date(data.fecha_hora),
      descripcion: data.descripcion,
      lugar_incidente: data.lugar_incidente,
      tipo_recordatorio: data.tipo_recordatorio,
      valor_recordatorio: data.valor_recordatorio,
      proxima_notificacion: data.proxima_notificacion ? new Date(data.proxima_notificacion) : null,
      alumnos: {
        create: data.alumnos.map((id_alumno: number) => ({
          alumno: { connect: { id: id_alumno } }
        }))
      }
    },
    include: { protocolo_version: true }
  });

  // Create empty lecturas for all responsables
  const responsables = JSON.parse(incidente.protocolo_version.responsables as string);
  
  // Find users with those cargos in this colegio, or super_admin
  const usuarios_responsables = await prisma.usuario.findMany({
    where: {
      estado: true,
      OR: [
        { cargo: { in: responsables }, id_colegio: idColegio },
        { rol: { nombre: 'super_admin' } }
      ]
    }
  });

  await prisma.incidenteLectura.createMany({
    data: usuarios_responsables.map(u => ({
      id_incidente: incidente.id,
      id_usuario: u.id,
      visto: u.id === userId, // Creador ya lo vio
      fecha_visto: u.id === userId ? new Date() : null
    }))
  });

  return incidente.id;
}
