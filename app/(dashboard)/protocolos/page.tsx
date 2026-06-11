import { getCurrentUser } from '@/app/actions/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default async function ProtocolosPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const isSuperAdmin = user.rol.nombre === 'super_admin';

  const protocolos = await prisma.protocolo.findMany({
    include: {
      categoria: true,
      versiones: {
        orderBy: { version: 'desc' },
        take: 1
      }
    }
  });

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Protocolos</h1>
          <p className="text-slate-500">Gestor de protocolos normativos y sus versiones vigentes.</p>
        </div>
        {isSuperAdmin && (
          <Link href="/protocolos/nuevo">
            <Button><Plus className="w-4 h-4 mr-2" /> Nuevo Protocolo</Button>
          </Link>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Directorio de Protocolos</CardTitle>
          <CardDescription>
            Listado de todos los protocolos categorizados. Solo Super Admins pueden editarlos.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Versión Vigente</TableHead>
                <TableHead>Estado</TableHead>
                {isSuperAdmin && <TableHead className="text-right">Acción</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {protocolos.map(prot => {
                const ver = prot.versiones[0];
                return (
                  <TableRow key={prot.id}>
                    <TableCell className="font-medium text-slate-500">{prot.codigo}</TableCell>
                    <TableCell className="font-semibold">{prot.nombre}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{prot.categoria.nombre}</Badge>
                    </TableCell>
                    <TableCell>v{ver?.version || 1}</TableCell>
                    <TableCell>
                      <Badge variant={prot.estado ? 'default' : 'secondary'}>
                        {prot.estado ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </TableCell>
                    {isSuperAdmin && (
                      <TableCell className="text-right">
                        <Link href={`/protocolos/${prot.id}/editar`} className="text-primary hover:underline text-sm font-medium">Editar</Link>
                      </TableCell>
                    )}
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
