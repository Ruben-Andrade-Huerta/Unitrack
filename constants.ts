
import { Subject, TodayClass, AttendanceStatus } from './types';

export const ROUTE_PATHS = {
  LOGIN: '/login',
  DASHBOARD: '/',
  SUBJECTS_LIST: '/materias',
  ADD_SUBJECT: '/materias/nueva',
  SUBJECT_DETAILS: '/materias/:materiaId', // Shows groups
  ADD_GROUP: '/materias/:materiaId/grupos/nuevo',
  GROUP_SUMMARY: '/grupos/:grupoId',
  TAKE_ATTENDANCE: '/grupos/:grupoId/sesion/nueva/:subjectId?', // subjectId is optional, used if coming from dashboard
  VIEW_SESSION: '/grupos/:grupoId/sesion/:sesionId',
  MANAGE_STUDENTS: '/grupos/:grupoId/estudiantes',
  ADD_STUDENT: '/grupos/:grupoId/estudiantes/nuevo',
};

export const INITIAL_SUBJECTS: Subject[] = [
  {
    id: 'subj1',
    nombre: 'Cálculo I',
    codigo: 'MAT101',
    grupos: [
      {
        id: 'grp1a',
        nombre: 'Grupo A',
        materiaId: 'subj1',
        estudiantes: [
          { id: 'std1', nombre: 'Ana Pérez', studentId: 'A001' },
          { id: 'std2', nombre: 'Luis García', studentId: 'A002' },
        ],
        sesiones: [
          { 
            id: 'ses1', 
            nombre: 'Sesión 1', 
            fecha: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), 
            asistencias: [
              { studentId: 'std1', status: AttendanceStatus.Presente },
              { studentId: 'std2', status: AttendanceStatus.Presente },
            ]
          },
          { 
            id: 'ses2', 
            nombre: 'Sesión 2', 
            fecha: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), 
            asistencias: [
              { studentId: 'std1', status: AttendanceStatus.Presente },
              { studentId: 'std2', status: AttendanceStatus.Ausente },
            ]
          },
        ],
      },
    ],
  },
  {
    id: 'subj2',
    nombre: 'Álgebra Lineal',
    codigo: 'MAT102',
    grupos: [
      {
        id: 'grp2b',
        nombre: 'Grupo B',
        materiaId: 'subj2',
        estudiantes: [
          { id: 'std3', nombre: 'Maria Rodriguez', studentId: 'B001' },
        ],
        sesiones: [],
      },
    ],
  },
  {
    id: 'subj3',
    nombre: 'Probabilidad',
    codigo: 'EST201',
    grupos: [
       {
        id: 'grp3c',
        nombre: 'Grupo C',
        materiaId: 'subj3',
        estudiantes: [],
        sesiones: [],
      },
    ],
  }
];

export const INITIAL_TODAY_CLASSES: TodayClass[] = [
  { subjectId: 'subj1', groupId: 'grp1a', subjectName: 'Cálculo I', groupName: 'Grupo A', time: '10:00 AM - 11:30 AM' },
  { subjectId: 'subj2', groupId: 'grp2b', subjectName: 'Álgebra Lineal', groupName: 'Grupo B', time: '1:00 PM - 2:30 PM' },
];

export const ATTENDANCE_STATUS_COLORS: Record<AttendanceStatus, string> = {
  [AttendanceStatus.Presente]: 'bg-green-100 text-green-700 border-green-500',
  [AttendanceStatus.Ausente]: 'bg-red-100 text-red-700 border-red-500',
  [AttendanceStatus.Justificado]: 'bg-yellow-100 text-yellow-700 border-yellow-500',
  [AttendanceStatus.Tarde]: 'bg-orange-100 text-orange-700 border-orange-500',
};

export const ATTENDANCE_STATUS_OPTIONS = [
  AttendanceStatus.Presente,
  AttendanceStatus.Ausente,
  AttendanceStatus.Justificado,
  AttendanceStatus.Tarde,
];
    