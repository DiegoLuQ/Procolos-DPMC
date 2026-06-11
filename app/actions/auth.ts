'use server';
export async function getCurrentUser() {
  return {
    id: 1,
    nombre_completo: 'Sol Abogada',
    cargo: 'Admin',
    rol: { nombre: 'super_admin' },
    colegio: { nombre_colegio: 'Colegio Demo' },
    id_colegio: 1
  };
}
export async function logout() {}
export async function login(formData: FormData) {}
