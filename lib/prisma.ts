export const prisma = {
  incidente: {
    findMany: async (...args: any[]) => [],
    findUnique: async (...args: any[]) => null,
    groupBy: async (...args: any[]) => [],
    create: async (...args: any[]) => ({ id: 1, protocolo_version: { responsables: '[]' } }),
    update: async (...args: any[]) => ({}),
  },
  protocoloVersion: {
    findMany: async (...args: any[]) => [],
  },
  colegio: {
    findMany: async (...args: any[]) => [],
  },
  usuario: {
    findUnique: async (...args: any[]) => null,
    findMany: async (...args: any[]) => [],
  },
  alumno: {
    findMany: async (...args: any[]) => [],
  },
  protocolo: {
    findMany: async (...args: any[]) => [],
  },
  configuracionSistema: {
    findUnique: async (...args: any[]) => null,
    upsert: async (...args: any[]) => ({}),
  },
  incidenteLectura: {
    createMany: async (...args: any[]) => ({}),
    updateMany: async (...args: any[]) => ({}),
  },
  incidenteComentario: {
    create: async (...args: any[]) => ({}),
  },
  incidenteAdjunto: {
    create: async (...args: any[]) => ({}),
  }
};
