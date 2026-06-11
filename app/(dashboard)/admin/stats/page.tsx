import { getCurrentUser } from '@/app/actions/auth';
import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default async function AdminStatsPage() {
  const user = await getCurrentUser();
  if (!user || user.rol.nombre !== 'super_admin') return <div>Acceso denegado</div>;

  const incidentesPorColegio = await prisma.incidente.groupBy({
    by: ['id_colegio'],
    _count: { id: true }
  });

  const incidentesPorProtocolo = await prisma.incidente.groupBy({
    by: ['id_protocolo_version'],
    _count: { id: true }
  });

  const protocolos = await prisma.protocoloVersion.findMany({
    include: { protocolo: true }
  });

  const colegios = await prisma.colegio.findMany();

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Estadísticas Super Admin</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Incidentes por Colegio</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {incidentesPorColegio.map(stat => {
                const col = colegios.find(c => c.id === stat.id_colegio);
                return (
                  <li key={stat.id_colegio} className="flex justify-between border-b pb-2">
                    <span>{col?.nombre_colegio || 'Desconocido'}</span>
                    <span className="font-bold">{stat._count.id}</span>
                  </li>
                );
              })}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Incidentes por Protocolo</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {incidentesPorProtocolo.map(stat => {
                const prot = protocolos.find(p => p.id === stat.id_protocolo_version);
                return (
                  <li key={stat.id_protocolo_version} className="flex justify-between border-b pb-2">
                    <span>{prot?.protocolo.nombre} (v{prot?.version})</span>
                    <span className="font-bold">{stat._count.id}</span>
                  </li>
                );
              })}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
