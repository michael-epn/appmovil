import { Timestamp } from 'firebase/firestore';

export interface Candidato {
  nombres: string;
  correo: string;
  telefono: string;
  fechaNacimiento: string | Date;
  cargo: string;
  nivelAcademico: string;
  experienciaAnios: number;
  modalidad: string;
  habilidades: string[];
  fechaDisponibilidad: string | Date;
  aspiracionSalarial: number;
  resumen: string;
  consentimiento: boolean;
  creadoEn: Date | Timestamp;
}
