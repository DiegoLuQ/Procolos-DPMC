import { getCurrentUser } from '@/app/actions/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { format } from 'date-fns';
import { AlertCircle, Clock, CheckCircle2, Shield } from 'lucide-react';

export default async function DashboardPage() {
  let user: any = null;
  let incidentes: any[] = [];
  
  try {
    user = await getCurrentUser();
    if (user?.id_colegio) {
      incidentes = await prisma.incidente.findMany({
        where: { id_colegio: user.id_colegio },
        include: {
          protocolo_version: { include: { protocolo: true } },
          alumnos: { include: { alumno: true } },
          creador: true,
          lecturas: true
        },
        orderBy: { fecha_hora: 'desc' }
      });
    }
  } catch (e) {
    // Modo demo si la BD está limpia / no conectada
    incidentes = [
      { id: 1, fecha_hora: new Date(), estado: 'Abierto', creador: { nombre_completo: 'Sol Abogada' }, alumnos: [{alumno: {nombre: 'Matias Vera', curso: '1ro B'}}], protocolo_version: { protocolo: { nombre: 'Acoso' }, version: 3, responsables: '["Director"]' }, lecturas: [{visto: true}] },
      { id: 2, fecha_hora: new Date(), estado: 'En Proceso', creador: { nombre_completo: 'Sol Abogada' }, alumnos: [{alumno: {nombre: 'Lucia Torres', curso: '3ro A'}}], protocolo_version: { protocolo: { nombre: 'Convivencia' }, version: 1, responsables: '["Director"]' }, lecturas: [] },
    ];
  }

  const cerrados = incidentes.filter(i => i.estado === 'Cerrado').length;
  const pendientes = incidentes.filter(i => i.estado !== 'Cerrado').length;
  
  return (
    <div className="flex flex-col gap-8 h-full">
      {/* Top Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 shrink-0">
        <div className="bg-white p-5 border border-slate-200 rounded-xl shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Incidentes Abiertos</p>
          <h3 className="text-3xl font-bold text-slate-900 mt-1">{pendientes}</h3>
          <div className="mt-2 text-xs text-red-500 flex items-center gap-1 font-medium">
            <AlertCircle className="w-3 h-3" />
            Requieren atención
          </div>
        </div>
        <div className="bg-white p-5 border border-slate-200 rounded-xl shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Casos Cerrados</p>
          <h3 className="text-3xl font-bold text-slate-900 mt-1">{cerrados}</h3>
          <div className="mt-2 text-xs text-emerald-500 flex items-center gap-1 font-medium">
            <CheckCircle2 className="w-3 h-3" />
            Resueltos este mes
          </div>
        </div>
        <div className="bg-white p-5 border border-slate-200 rounded-xl shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Tasa de Resolución</p>
          <h3 className="text-3xl font-bold text-slate-900 mt-1">
            {incidentes.length ? Math.round((cerrados / incidentes.length) * 100) : 0}%
          </h3>
          <div className="mt-2 w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div className="bg-emerald-500 h-full transition-all duration-500" style={{ width: `${incidentes.length ? Math.round((cerrados / incidentes.length) * 100) : 0}%` }}></div>
          </div>
        </div>
        <div className="bg-white p-5 border border-slate-200 rounded-xl shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Protocolos Activos</p>
          <h3 className="text-3xl font-bold text-slate-900 mt-1">15</h3>
          <div className="mt-2 text-xs text-blue-500 flex items-center gap-1 font-medium">
            <Shield className="w-3 h-3" />
            Versionados
          </div>
        </div>
      </div>

      {/* Main Data Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0">
        
        {/* Incident List */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-xl flex flex-col min-h-0 shadow-sm relative">
          <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 rounded-t-xl shrink-0">
            <h4 className="font-bold text-slate-700">Últimos Incidentes Registrados</h4>
            <button className="text-xs bg-white border border-slate-300 px-3 py-1.5 rounded-md font-semibold text-slate-600 shadow-sm hover:bg-slate-50 transition-colors">
              Exportar Historial
            </button>
          </div>
          
          <div className="flex-1 overflow-auto">
            <table className="w-full text-left">
              <thead className="sticky top-0 bg-white border-b border-slate-100/80 z-10">
                <tr className="text-[10px] uppercase text-slate-400 font-bold tracking-wider">
                  <th className="px-6 py-4">Alumno/s</th>
                  <th className="px-6 py-4">Protocolo</th>
                  <th className="px-6 py-4">Estado</th>
                  <th className="px-6 py-4">Lectura</th>
                  <th className="px-6 py-4 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {incidentes.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-sm text-slate-500">
                      No hay incidentes registrados aún.
                    </td>
                  </tr>
                )}
                {incidentes.map(inc => {
                  let totalResponsables = 1;
                  try { totalResponsables = JSON.parse(inc.protocolo_version.responsables).length || 1; } catch {}
                  const leidos = inc.lecturas?.filter((l: any) => l.visto).length || 0;
                  
                  return (
                    <tr key={inc.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-6 py-4 font-medium text-slate-900">
                        {inc.alumnos?.[0]?.alumno?.nombre || 'Desconocido'}
                        {inc.alumnos?.length > 1 && <span className="block text-[10px] text-slate-400 font-normal">+{inc.alumnos.length - 1} más</span>}
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-[10px] font-bold border border-blue-100 flex items-center w-fit">
                          {inc.protocolo_version?.protocolo?.nombre ? (inc.protocolo_version.protocolo.nombre.substring(0, 12) + '...') : 'Protocolo'}
                          <span className="ml-1 opacity-60 font-normal">(v.{inc.protocolo_version?.version || 1})</span>
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`flex items-center gap-1.5 text-xs font-semibold ${
                          inc.estado === 'Abierto' ? 'text-red-600' :
                          inc.estado === 'En Proceso' ? 'text-amber-600' :
                          'text-emerald-600'
                        }`}>
                          <span className={`w-2 h-2 rounded-full ${
                            inc.estado === 'Abierto' ? 'bg-red-500' :
                            inc.estado === 'En Proceso' ? 'bg-amber-500 animate-pulse' :
                            'bg-emerald-500'
                          }`}></span>
                          {inc.estado}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-bold text-slate-700 block">
                          {leidos}/{totalResponsables}
                        </span>
                        <span className="text-[10px] text-slate-400 truncate">Vistos</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link href={`/incidentes/${inc.id}`} className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline">
                          Revisar
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Side Call to action / Information Panel */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-bold text-slate-700">Control de Versiones</h4>
              <Shield className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-xs text-slate-500 mb-6 leading-relaxed">
              Los protocolos vinculados a leyes nacionales requieren trazabilidad histórica. Al modificar uno, se genera una nueva versión.
            </p>
            
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="w-0.5 h-12 bg-blue-200 relative ml-2">
                  <div className="absolute -left-[4px] top-0 w-2.5 h-2.5 rounded-full bg-blue-500 border-2 border-white shadow-sm ring-2 ring-blue-50"></div>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Actual</span>
                  <p className="text-sm font-medium text-slate-800 leading-none mt-1">Convivencia Escolar v.3</p>
                  <p className="text-[10px] text-slate-400 mt-1">Vigente desde: Mar 2024</p>
                </div>
              </div>
              <div className="flex gap-4 opacity-50 grayscale pt-2">
                <div className="w-0.5 h-12 bg-slate-200 relative ml-2">
                  <div className="absolute -left-[4px] top-0 w-2.5 h-2.5 rounded-full bg-slate-400 border-2 border-white shadow-sm"></div>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Archivado</span>
                  <p className="text-sm font-medium text-slate-800 leading-none mt-1">Convivencia Escolar v.2</p>
                  <p className="text-[10px] text-slate-400 mt-1">Válido: 2022 - 2023</p>
                </div>
              </div>
            </div>

            <Link href="/protocolos">
              <button className="w-full mt-6 py-2.5 bg-slate-900 text-white rounded-lg text-sm font-bold shadow hover:bg-slate-800 transition-all focus:ring-4 focus:ring-slate-200 outline-none">
                Gestión de Protocolos
              </button>
            </Link>
          </div>

          <div className="bg-blue-600 rounded-xl p-6 text-white relative overflow-hidden shadow-md group border border-blue-500">
            <div className="relative z-10">
              <h4 className="font-bold text-lg mb-2">¿Nuevo Incidente?</h4>
              <p className="text-sm text-blue-100 opacity-90 mb-5 leading-relaxed tracking-wide">
                Registre una nueva entrada siguiendo el protocolo legal vigente de su establecimiento.
              </p>
              <Link href="/incidentes/nuevo">
                <button className="px-5 py-2.5 bg-white text-blue-600 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-blue-50 transition-colors shadow-sm focus:ring-4 focus:ring-white/30 outline-none">
                  Nueva Entrada
                  <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
                </button>
              </Link>
            </div>
            {/* Background design elements */}
            <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-blue-500/30 rounded-full blur-2xl"></div>
            <svg className="absolute right-[-10px] bottom-[-10px] w-28 h-28 text-white opacity-10 rotate-12" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/></svg>
          </div>
        </div>

      </div>
    </div>
  );
}
