
export enum AttendanceStatus {
  Presente = 'Presente',
  Ausente = 'Ausente',
  Justificado = 'Justificado',
  Tarde = 'Tarde',
}

export interface Student {
  id: string;
  nombre: string;
  studentId: string; // Matricula
}

export interface StudentAttendance {
  studentId: string;
  status: AttendanceStatus;
}

export interface ClassSession {
  id: string;
  fecha: string; // ISO date string
  asistencias: StudentAttendance[];
  nombre?: string; // e.g., "Sesión 1"
}

export interface Group {
  id: string;
  nombre: string;
  materiaId: string;
  estudiantes: Student[];
  sesiones: ClassSession[];
}

export interface Subject {
  id: string;
  nombre: string;
  codigo: string;
  grupos: Group[];
}

export interface TodayClass {
  subjectName: string;
  groupName: string;
  time: string;
  subjectId: string;
  groupId: string;
}

    