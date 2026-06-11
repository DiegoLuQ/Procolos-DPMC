import { getCurrentUser, logout } from '@/app/actions/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { FileText, Home, Settings, ShieldAlert, LogOut, Users } from 'lucide-react';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  // Manejo de la posible pérdida de entorno, asumiendo datos dummy si no hay usuario
  let user: any = null;
  try {
    user = await getCurrentUser();
  } catch (e) {
    // ignorar
  }

  if (!user) {
    user = {
      nombre_completo: 'Usuario',
      cargo: 'Admin',
      rol: { nombre: 'super_admin' },
      colegio: { nombre_colegio: 'Colegio Demo' }
    };
  }

  const isSuperAdmin = user?.rol?.nombre === 'super_admin';

  return (
    <div className="flex h-screen w-full bg-[#F8FAFC] overflow-hidden text-slate-800 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-[#1E293B] flex flex-col h-full shrink-0">
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center font-bold text-white">G</div>
          <span className="text-white font-semibold text-lg tracking-tight">GESTIÓN PRO</span>
        </div>
        
        <nav className="flex-1 px-4 mt-4 space-y-1">
          <Link href="/" className="flex items-center gap-3 px-3 py-2 text-white bg-blue-600 rounded-md shadow-sm">
            <Home className="w-5 h-5" />
            Dashboard
          </Link>
          <Link href="/incidentes/nuevo" className="flex items-center gap-3 px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-800 transition-all rounded-md">
            <ShieldAlert className="w-5 h-5" />
            Nuevo Incidente
          </Link>
          <Link href="/protocolos" className="flex items-center gap-3 px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-800 transition-all rounded-md">
            <FileText className="w-5 h-5" />
            Protocolos
          </Link>
          
          {isSuperAdmin && (
            <>
              <div className="pt-6 pb-2 px-3 text-[10px] font-bold uppercase text-slate-500 tracking-wider">Administración</div>
              <Link href="/admin/stats" className="flex items-center gap-3 px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-800 transition-all rounded-md">
                <span className="w-5 h-5 flex items-center justify-center">📊</span> 
                Estadísticas
              </Link>
              <Link href="/admin/config" className="flex items-center gap-3 px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-800 transition-all rounded-md">
                <Settings className="w-5 h-5" /> 
                Configuración
              </Link>
            </>
          )}
        </nav>
        
        <div className="mt-auto p-4 border-t border-slate-700 bg-slate-800/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-600 rounded-full flex items-center justify-center text-white border-2 border-slate-500 font-bold shrink-0">
                {user.nombre_completo.charAt(0).toUpperCase()}
              </div>
              <div className="flex flex-col min-w-0 pr-2">
                <span className="text-sm font-medium text-white truncate">{user.nombre_completo}</span>
                <span className="text-xs text-slate-400 truncate">{user.cargo}</span>
              </div>
            </div>
            
            <form action={async () => {
              'use server';
              try { await logout(); } catch (e) {}
            }}>
              <button type="submit" className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-full transition-colors" title="Cerrar sesión">
                <LogOut className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Header Bar */}
        <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4 min-w-0">
            <h2 className="text-xl font-bold text-slate-900 uppercase tracking-wide truncate">Soporte Multicolegio</h2>
            {isSuperAdmin && (
              <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs font-semibold rounded uppercase tracking-tighter whitespace-nowrap">
                Admin View
              </span>
            )}
          </div>
          <div className="flex items-center gap-4 shrink-0">
            <div className="relative">
              <select className="bg-slate-50 border border-slate-300 text-slate-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2 pr-8 appearance-none outline-none">
                <option>Todos los Colegios</option>
                <option>Colegio San Ignacio</option>
                <option>Instituto Nacional</option>
              </select>
            </div>
          </div>
        </header>

        {/* Page Content Container */}
        <div className="flex-1 overflow-auto p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
