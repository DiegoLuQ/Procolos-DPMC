import { getCurrentUser } from '@/app/actions/auth';
import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { revalidatePath } from 'next/cache';

export default async function AdminConfigPage() {
  const user = await getCurrentUser();
  if (!user || user.rol.nombre !== 'super_admin') return <div>Acceso denegado</div>;

  const colegios = await prisma.colegio.findMany({
    include: { configuracion_sistema: true }
  });

  async function updateConfig(formData: FormData) {
    'use server';
    const id_colegio = parseInt(formData.get('id_colegio') as string);
    const comportamiento = formData.get('comportamiento') as string;

    await prisma.configuracionSistema.upsert({
      where: { id_colegio },
      update: { comportamiento_envio: comportamiento },
      create: { id_colegio, comportamiento_envio: comportamiento }
    });

    revalidatePath('/admin/config');
  }

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Configuración del Sistema</h1>
      <p className="text-slate-500">Ajustes globales por colegio.</p>

      <div className="space-y-4">
        {colegios.map(col => (
          <form key={col.id} action={updateConfig}>
            <input type="hidden" name="id_colegio" value={col.id} />
            <Card>
              <CardHeader>
                <CardTitle>{col.nombre_colegio}</CardTitle>
                <CardDescription>Comportamiento del envío de correos ante incidentes.</CardDescription>
              </CardHeader>
              <CardContent className="flex items-end gap-4">
                <div className="space-y-2 flex-1">
                  <Label>Flujo de Correos</Label>
                  <Select name="comportamiento" defaultValue={col.configuracion_sistema?.comportamiento_envio || 'preguntar_siempre'}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="enviar_siempre">Enviar Siempre</SelectItem>
                      <SelectItem value="preguntar_siempre">Preguntar Siempre (Modal)</SelectItem>
                      <SelectItem value="no_enviar">No enviar (Solo interno)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit">Guardar Cambios</Button>
              </CardContent>
            </Card>
          </form>
        ))}
      </div>
    </div>
  );
}
