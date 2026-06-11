'use client';

import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';
import { CheckCircle2, Circle, File, Paperclip, Send, AlertTriangle } from 'lucide-react';
import { marcarComoVisto, cerrarIncidente, agregarComentario, subirAdjunto } from '@/app/actions/detalles';
import { toast } from 'sonner';

export default function IncidenteDetalleClient({ incidente, puedeCerrar, lecturaActual, currentUser, pasos, responsables }: any) {
  const [comentario, setComentario] = useState('');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleMarcarVisto = async () => {
    setLoading(true);
    await marcarComoVisto(incidente.id);
    toast.success('Incidente marcado como leído');
    setLoading(false);
  };

  const handleCerrar = async () => {
    if (!confirm('¿Seguro que deseas cerrar este incidente?')) return;
    setLoading(true);
    await cerrarIncidente(incidente.id);
    toast.success('Incidente cerrado');
    setLoading(false);
  };

  const submitComentario = async () => {
    if (!comentario.trim()) return;
    setLoading(true);
    await agregarComentario(incidente.id, comentario);
    setComentario('');
    setLoading(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error('El archivo excede los 10MB');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      await subirAdjunto(incidente.id, data.name, data.url, data.size);
      toast.success('Archivo subido exitosamente');
    } catch (err: any) {
      toast.error('Error al subir archivo', { description: err.message });
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="col-span-1 md:col-span-2 space-y-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">Incidente #{incidente.id}</h1>
            <Badge variant={incidente.estado === 'Abierto' ? 'destructive' : incidente.estado === 'En Proceso' ? 'outline' : 'secondary'}>
              {incidente.estado}
            </Badge>
          </div>
          <p className="text-slate-500 mt-2">
            Registrado por {incidente.creador.nombre_completo} el {format(new Date(incidente.fecha_hora), 'dd/MMM/yyyy HH:mm')}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Detalles de los Hechos</CardTitle>
            <CardDescription>Lugar: {incidente.lugar_incidente.toUpperCase()}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-md whitespace-pre-wrap text-sm border">
              {incidente.descripcion}
            </div>
            
            <div className="pt-4">
              <h4 className="font-semibold text-sm text-slate-700 mb-2">Alumnos Involucrados ({incidente.alumnos.length})</h4>
              <div className="flex flex-wrap gap-2">
                {incidente.alumnos.map((a: any) => (
                  <Badge key={a.id_alumno} variant="outline" className="text-xs">
                    {a.alumno.nombre} ({a.alumno.curso})
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pasos a seguir del Protocolo */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              Pasos del Protocolo Activo
            </CardTitle>
            <CardDescription>{incidente.protocolo_version.protocolo.nombre} (v{incidente.protocolo_version.version})</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 relative before:absolute before:inset-0 before:ml-2.5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
              {pasos.map((paso: string, index: number) => (
                <li key={index} className="relative flex items-center justify-start md:justify-normal">
                  <div className="absolute left-0 w-5 h-5 bg-slate-200 border-2 border-white rounded-full ml-0.5 md:ml-0 z-10" />
                  <div className="bg-white dark:bg-slate-950 px-4 py-2 border rounded-md shadow-sm ml-8 w-full">
                    <p className="text-sm font-medium">{index + 1}. {paso}</p>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Timeline of Comments and Files */}
        <Card>
          <CardHeader>
            <CardTitle>Línea de Tiempo y Seguimiento</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {incidente.comentarios.length === 0 && incidente.adjuntos.length === 0 && (
              <p className="text-sm text-muted-foreground italic">No hay historial de seguimiento aún.</p>
            )}
            
            <div className="space-y-4">
              {[...incidente.comentarios, ...incidente.adjuntos].sort((a: any, b: any) => new Date(a.fecha_creacion || a.fecha_subida).getTime() - new Date(b.fecha_creacion || b.fecha_subida).getTime()).map((item: any, i) => (
                <div key={i} className={`flex gap-3 ${item.id_usuario === currentUser.id ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold flex-shrink-0">
                    {item.usuario.nombre_completo.charAt(0)}
                  </div>
                  <div className={`p-3 rounded-lg max-w-[80%] border shadow-sm ${item.id_usuario === currentUser.id ? 'bg-primary/5 border-primary/20' : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800'}`}>
                    <div className="flex justify-between items-center gap-4 mb-1">
                      <span className="text-xs font-semibold">{item.usuario.nombre_completo}</span>
                      <span className="text-[10px] text-muted-foreground">{format(new Date(item.fecha_creacion || item.fecha_subida), 'dd/MM/yy HH:mm')}</span>
                    </div>
                    {item.comentario ? (
                      <p className="text-sm">{item.comentario}</p>
                    ) : (
                      <div className="flex items-center gap-2 mt-2">
                        <File className="h-4 w-4 text-blue-500" />
                        <a href={item.url_archivo} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
                          {item.nombre_archivo}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            {incidente.estado !== 'Cerrado' && (
              <div className="pt-4 border-t space-y-3">
                <Textarea placeholder="Añadir un comentario o reporte..." value={comentario} onChange={(e) => setComentario(e.target.value)} />
                <div className="flex justify-between items-center">
                  <div>
                    <input type="file" ref={fileInputRef} className="hidden" accept=".pdf,.doc,.docx,.jpg,.png" onChange={handleFileUpload} />
                    <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} disabled={loading}>
                      <Paperclip className="h-4 w-4 mr-2" /> Adjuntar Evidencia (PDF)
                    </Button>
                  </div>
                  <Button onClick={submitComentario} disabled={loading || !comentario.trim()} size="sm">
                    <Send className="h-4 w-4 mr-2" /> Enviar
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="col-span-1 space-y-6">
        {/* Lecturas y Responsables */}
        <Card>
          <CardHeader>
            <CardTitle>Estado de Lectura</CardTitle>
            <CardDescription>Cargos Responsables</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {incidente.lecturas.map((l: any) => (
                <li key={l.id} className="flex justify-between items-center text-sm p-2 rounded border">
                  <div>
                    <span className="font-semibold block">{l.usuario.nombre_completo}</span>
                    <span className="text-xs text-muted-foreground">{l.usuario.cargo}</span>
                  </div>
                  {l.visto ? (
                    <div className="text-green-600 flex flex-col items-end">
                      <CheckCircle2 className="h-5 w-5" />
                      <span className="text-[10px]">{format(new Date(l.fecha_visto), 'dd/MM')}</span>
                    </div>
                  ) : (
                    <Circle className="h-5 w-5 text-slate-300" />
                  )}
                </li>
              ))}
            </ul>
            
            {lecturaActual && !lecturaActual.visto && incidente.estado !== 'Cerrado' && (
              <Button className="w-full mt-4" variant="secondary" onClick={handleMarcarVisto} disabled={loading}>
                <CheckCircle2 className="h-4 w-4 mr-2" /> Confirmar Lectura
              </Button>
            )}
          </CardContent>
        </Card>

        {incidente.estado !== 'Cerrado' && puedeCerrar && (
          <Button variant="destructive" className="w-full" onClick={handleCerrar} disabled={loading}>
            Cerrar Incidente
          </Button>
        )}
      </div>
    </div>
  );
}
