'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { getCurrentUser } from './auth';

export async function marcarComoVisto(id_incidente: number) {
  const user = await getCurrentUser();
  if (!user) return;

  await prisma.incidenteLectura.updateMany({
    where: { id_incidente, id_usuario: user.id },
    data: { visto: true, fecha_visto: new Date() }
  });
  revalidatePath(`/incidentes/${id_incidente}`);
}

export async function cerrarIncidente(id_incidente: number) {
  const user = await getCurrentUser();
  if (!user || (user.cargo !== 'Director' && user.rol.nombre !== 'super_admin' && user.rol.nombre !== 'admin')) return;

  await prisma.incidente.update({
    where: { id: id_incidente },
    data: { estado: 'Cerrado' }
  });
  revalidatePath(`/incidentes/${id_incidente}`);
  revalidatePath(`/`);
}

export async function agregarComentario(id_incidente: number, comentario: string) {
  const user = await getCurrentUser();
  if (!user) return;

  await prisma.incidenteComentario.create({
    data: {
      id_incidente,
      id_usuario: user.id,
      comentario
    }
  });
  revalidatePath(`/incidentes/${id_incidente}`);
}

export async function subirAdjunto(id_incidente: number, nombre_archivo: string, url_archivo: string, tamano_bytes: number) {
  const user = await getCurrentUser();
  if (!user) return;

  await prisma.incidenteAdjunto.create({
    data: {
      id_incidente,
      id_usuario: user.id,
      nombre_archivo,
      url_archivo,
      tamano_bytes
    }
  });
  revalidatePath(`/incidentes/${id_incidente}`);
}
