'use client';

import { useState } from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { createIncidente } from '@/app/actions/incidentes';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function NuevoIncidenteClient({ alumnos, protocolos, config, user }: any) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  
  // Form State
  const [protocoloVerId, setProtocoloVerId] = useState('');
  const [fechaHora, setFechaHora] = useState('');
  const [lugar, setLugar] = useState('sala de clase');
  const [descripcion, setDescripcion] = useState('');
  const [alumnosSeleccionados, setAlumnosSeleccionados] = useState<number[]>([]);
  const [recordatorio, setRecordatorio] = useState('ninguno');
  const [valorRecordatorio, setValorRecordatorio] = useState('');

  const [responsablesAEnviar, setResponsablesAEnviar] = useState<string[]>([]);
  
  const handlePreSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!protocoloVerId || alumnosSeleccionados.length === 0 || !descripcion || !fechaHora) {
      toast.error('Complete los campos obligatorios');
      return;
    }

    const protocoloSeleccionado = protocolos.find((p: any) => p.versiones[0].id.toString() === protocoloVerId);
    const resp = JSON.parse(protocoloSeleccionado.versiones[0].responsables);
    setResponsablesAEnviar(resp);

    if (config === 'preguntar_siempre') {
      setShowModal(true);
    } else {
      enviar(true);
    }
  };

  const enviar = async (enviarCorreo: boolean) => {
    setLoading(true);
    try {
      let proxima = null;
      if (recordatorio === 'dias_frecuencia' && valorRecordatorio) {
        proxima = new Date();
        proxima.setDate(proxima.getDate() + parseInt(valorRecordatorio));
      } else if (recordatorio === 'fecha_especifica' && valorRecordatorio) {
        proxima = new Date(valorRecordatorio);
      }

      const data = {
        id_protocolo_version: parseInt(protocoloVerId),
        fecha_hora: fechaHora,
        descripcion,
        lugar_incidente: lugar,
        tipo_recordatorio: recordatorio,
        valor_recordatorio: valorRecordatorio,
        proxima_notificacion: proxima,
        alumnos: alumnosSeleccionados
      };

      const id = await createIncidente(data, user.id, user.id_colegio);
      
      if (enviarCorreo) {
        toast.success('Incidente registrado y correos enviados');
      } else {
        toast.success('Incidente registrado');
      }
      
      router.push(`/incidentes/${id}`);
    } catch (e: any) {
      toast.error('Error', { description: e.message });
    } finally {
      setLoading(false);
      setShowModal(false);
    }
  };

  return (
    <>
      <form onSubmit={handlePreSubmit}>
        <Card>
          <CardContent className="space-y-6 pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Protocolo a Aplicar</Label>
                <Select value={protocoloVerId} onValueChange={setProtocoloVerId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar protocolo..." />
                  </SelectTrigger>
                  <SelectContent>
                    {protocolos.map((p: any) => (
                      <SelectItem key={p.id} value={p.versiones[0].id.toString()}>
                        {p.codigo} - {p.nombre} (v{p.versiones[0].version})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Fecha y Hora del Suceso</Label>
                <Input type="datetime-local" value={fechaHora} onChange={e => setFechaHora(e.target.value)} required />
              </div>

              <div className="space-y-2">
                <Label>Lugar del Incidente</Label>
                <Select value={lugar} onValueChange={setLugar}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar lugar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sala de clase">Sala de Clase</SelectItem>
                    <SelectItem value="salida">Salida</SelectItem>
                    <SelectItem value="patio">Patio</SelectItem>
                    <SelectItem value="cocina">Cocina</SelectItem>
                    <SelectItem value="otro">Otro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Recordatorio / Alarma</Label>
                <Select value={recordatorio} onValueChange={setRecordatorio}>
                  <SelectTrigger>
                    <SelectValue placeholder="Ninguno" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ninguno">Sin recordatorio</SelectItem>
                    <SelectItem value="dias_frecuencia">Por frecuencia (días)</SelectItem>
                    <SelectItem value="fecha_especifica">Fecha Específica</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {recordatorio === 'dias_frecuencia' && (
                <div className="space-y-2 col-span-1 md:col-span-2">
                  <Label>Cantidad de Días (Frecuencia)</Label>
                  <Input type="number" min="1" value={valorRecordatorio} onChange={e => setValorRecordatorio(e.target.value)} placeholder="Ej: 3" required />
                </div>
              )}
              
              {recordatorio === 'fecha_especifica' && (
                <div className="space-y-2 col-span-1 md:col-span-2">
                  <Label>Fecha del Recordatorio</Label>
                  <Input type="date" value={valorRecordatorio} onChange={e => setValorRecordatorio(e.target.value)} required />
                </div>
              )}

            </div>

            <div className="space-y-2 border-t pt-4">
              <Label>Alumnos Involucrados</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {alumnos.map((a: any) => (
                  <div key={a.id} className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-3">
                    <Checkbox id={`al-${a.id}`} checked={alumnosSeleccionados.includes(a.id)} onCheckedChange={(c) => {
                      if (c) setAlumnosSeleccionados([...alumnosSeleccionados, a.id]);
                      else setAlumnosSeleccionados(alumnosSeleccionados.filter(id => id !== a.id));
                    }} />
                    <div className="space-y-1 leading-none">
                      <Label htmlFor={`al-${a.id}`} className="cursor-pointer">{a.nombre}</Label>
                      <p className="text-[0.7rem] text-muted-foreground">{a.curso}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2 border-t pt-4">
              <Label>Descripción de los Hechos</Label>
              <Textarea placeholder="Redacte objetivamente lo sucedido..." className="min-h-[150px]" value={descripcion} onChange={e => setDescripcion(e.target.value)} required />
            </div>

          </CardContent>
          <CardFooter className="bg-slate-50 p-4 border-t justify-end">
            <Button type="submit" disabled={loading}>{loading ? 'Guardando...' : 'Registrar Incidente'}</Button>
          </CardFooter>
        </Card>
      </form>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Deseas enviar los correos?</DialogTitle>
            <DialogDescription>
              Se enviará una notificación a los siguientes responsables:
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <ul className="list-disc pl-5 font-medium space-y-1">
              {responsablesAEnviar.map((r, i) => <li key={i}>{r}</li>)}
            </ul>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => enviar(false)} disabled={loading}>No enviar</Button>
            <Button onClick={() => enviar(true)} disabled={loading}>Sí, Enviar Correos</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
