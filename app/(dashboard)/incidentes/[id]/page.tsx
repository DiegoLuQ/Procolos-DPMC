import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/app/actions/auth';
import IncidenteDetalleClient from './detalle-client';

export default async function IncidenteDetallePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) return null;

  const incidente = await prisma.incidente.findUnique({
    where: { id: parseInt(id) },
    include: {
      creador: true,
      alumnos: { include: { alumno: true } },
      protocolo_version: { include: { protocolo: true } },
      lecturas: { include: { usuario: true } },
      comentarios: { include: { usuario: true }, orderBy: { fecha_creacion: 'asc' } },
      adjuntos: { include: { usuario: true }, orderBy: { fecha_subida: 'asc' } }
    }
  });

  if (!incidente) return <div>Incidente no encontrado</div>;

  const puedeCerrar = user.id === incidente.id_creador || user.cargo === 'Director' || user.rol.nombre === 'super_admin';
  const lecturaActual = incidente.lecturas.find(l => l.id_usuario === user.id);
  const pasos = JSON.parse(incidente.protocolo_version.pasos_a_seguir);
  const responsables = JSON.parse(incidente.protocolo_version.responsables as string);

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-6">
      <IncidenteDetalleClient 
        incidente={incidente} 
        puedeCerrar={puedeCerrar} 
        lecturaActual={lecturaActual} 
        currentUser={user}
        pasos={pasos}
        responsables={responsables}
      />
    </div>
  );
}
