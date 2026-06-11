'use client';

import { useState } from 'react';
import { login } from '@/app/actions/auth';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { GraduationCap } from 'lucide-react';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    setLoading(true);
    try {
      await login(formData);
    } catch (e: any) {
      toast.error('Error al iniciar sesión', { description: e.message || 'Credenciales inválidas' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
      <Card className="w-full max-w-sm">
        <form action={handleSubmit}>
          <CardHeader className="text-center">
            <div className="mx-auto bg-primary/10 p-3 rounded-full mb-4 w-fit">
              <GraduationCap className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-2xl">Gestión de Protocolos</CardTitle>
            <CardDescription>
              Inicia sesión para acceder al sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="user">Usuario</Label>
              <Input id="user" name="user" required placeholder="admin o sol_abogada" defaultValue="admin" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pass">Contraseña</Label>
              <Input id="pass" name="pass" type="password" required defaultValue="admin123" />
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full" type="submit" disabled={loading}>
              {loading ? 'Ingresando...' : 'Ingresar'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
