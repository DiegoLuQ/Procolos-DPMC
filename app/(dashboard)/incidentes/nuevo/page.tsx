import { getCurrentUser } from '@/app/actions/auth';
import { prisma } from '@/lib/prisma';
import NuevoIncidenteClient from './nuevo-incidente-client';

export default async function NuevoIncidentePage() {
  const user = await getCurrentUser();
  if (!user || !user.id_colegio) return null;

  // We need to pass data to client:
  const alumnos = await prisma.alumno.findMany({
    where: { id_colegio: user.id_colegio }
  });

  const protocolos = await prisma.protocolo.findMany({
    where: { estado: true },
    include: {
      versiones: {
        orderBy: { version: 'desc' },
        take: 1
      }
    }
  });

  const config = await prisma.configuracionSistema.findUnique({
    where: { id_colegio: user.id_colegio }
  });

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Registar Nuevo Incidente</h1>
        <p className="text-slate-500">Seleccione el protocolo e ingrese los detalles del suceso.</p>
      </div>

      <NuevoIncidenteClient 
        alumnos={alumnos} 
        protocolos={protocolos.filter(p => p.versiones.length > 0)} 
        config={config?.comportamiento_envio || 'preguntar_siempre'}
        user={user}
      />
    </div>
  );
}
