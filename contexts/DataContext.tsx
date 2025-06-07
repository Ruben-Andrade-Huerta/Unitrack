import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { Subject, Group, Student, ClassSession, TodayClass } from '../types';

const LOCAL_STORAGE_KEY_SUBJECTS = 'uniTrackSubjects';
const LOCAL_STORAGE_KEY_AUTH = 'uniTrackAuth';

export interface DataContextType {
  isAuthenticated: boolean;
  login: () => void;
  logout: () => void;
  subjects: Subject[];
  todayClasses: TodayClass[];
  addSubject: (subject: Omit<Subject, 'id' | 'grupos'>) => void;
  getSubjectById: (id: string) => Subject | undefined;
  addGroup: (materiaId: string, group: Omit<Group, 'id' | 'materiaId' | 'estudiantes' | 'sesiones'>) => void;
  getGroupById: (groupId: string) => { subject?: Subject, group?: Group } | undefined;
  addStudentToGroup: (groupId: string, student: Omit<Student, 'id'>) => void;
  addSessionToGroup: (groupId: string, session: Omit<ClassSession, 'id'>) => void;
  updateSessionInGroup: (groupId: string, session: ClassSession) => void;
  getStudentById: (studentId: string, groupId: string) => Student | undefined;
}

export const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const storedAuth = localStorage.getItem(LOCAL_STORAGE_KEY_AUTH);
    return storedAuth ? JSON.parse(storedAuth) : false;
  });
  const [subjects, setSubjects] = useState<Subject[]>([]);

  // Cambia la URL base de la API usando variable de entorno
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  // Reemplaza fetch por fetchWithAuthRetry en todas las llamadas protegidas
  useEffect(() => {
    if (!isAuthenticated) return;
    fetchWithAuthRetry(`${API_URL}/api/materias/`)
      .then(async res => {
        if (res.status === 401) {
          logout();
          return [];
        }
        const data = await res.json();
        return data;
      })
      .then(data => Array.isArray(data) ? setSubjects(data) : setSubjects([]))
      .catch(() => setSubjects([]));
  }, [isAuthenticated]);

  // Obtener grupos y clases reales del backend
  const [groups, setGroups] = useState<Group[]>([]);
  const [sessions, setSessions] = useState<ClassSession[]>([]);

  useEffect(() => {
    if (!isAuthenticated) return;
    fetchWithAuthRetry(`${API_URL}/api/grupos/`)
      .then(res => res.json())
      .then(data => setGroups(data))
      .catch(() => setGroups([]));
    fetchWithAuthRetry(`${API_URL}/api/sesiones/`)
      .then(res => res.json())
      .then(data => setSessions(data))
      .catch(() => setSessions([]));
  }, [isAuthenticated]);

  const [todayClasses] = useState<TodayClass[]>([]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_SUBJECTS, JSON.stringify(subjects));
  }, [subjects]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_AUTH, JSON.stringify(isAuthenticated));
  }, [isAuthenticated]);

  const login = () => setIsAuthenticated(true);
  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('accessToken');
  };

  // Refrescar token automáticamente si expira
  async function refreshAccessToken() {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) return null;
    const res = await fetch(`${API_URL}/api/token/refresh/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh: refreshToken })
    });
    if (res.ok) {
      const data = await res.json();
      localStorage.setItem('accessToken', data.access);
      return data.access;
    }
    return null;
  }

  async function fetchWithAuthRetry(url: string, options: any = {}) {
    let accessToken = localStorage.getItem('accessToken');
    options.headers = options.headers || {};
    options.headers['Authorization'] = `Bearer ${accessToken}`;
    let res = await fetch(url, options);
    if (res.status === 401) {
      accessToken = await refreshAccessToken();
      if (accessToken) {
        options.headers['Authorization'] = `Bearer ${accessToken}`;
        res = await fetch(url, options);
      }
    }
    return res;
  }

  // Sobrescribe los métodos para usar la API real
  const addSubject = async (subjectData: Omit<Subject, 'id' | 'grupos'>) => {
    const res = await fetchWithAuthRetry(`${API_URL}/api/materias/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(subjectData)
    });
    if (res.ok) {
      const newSubject = await res.json();
      setSubjects(prev => [...prev, newSubject]);
    }
  };

  const addGroup = async (materiaId: string, groupData: Omit<Group, 'id' | 'materiaId' | 'estudiantes' | 'sesiones'>) => {
    const res = await fetchWithAuthRetry(`${API_URL}/api/grupos/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ ...groupData, materia: materiaId })
    });
    if (res.ok) {
      const subjectsRes = await fetchWithAuthRetry(`${API_URL}/api/materias/`);
      if (subjectsRes.ok) {
        const subjectsData = await subjectsRes.json();
        setSubjects(subjectsData);
      }
    }
  };

  const getSubjectById = (id: string): Subject | undefined => {
    return subjects.find(s => s.id === id);
  };
  
  const getGroupById = (groupId: string): { subject?: Subject, group?: Group } | undefined => {
    for (const subject of subjects) {
      const group = subject.grupos.find(g => g.id === groupId);
      if (group) {
        return { subject, group };
      }
    }
    return undefined;
  };
  
  // Añadir estudiante a grupo usando la API real
  const addStudentToGroup = async (groupId: string, studentData: Omit<Student, 'id'>) => {
    const res = await fetchWithAuthRetry(`${API_URL}/api/estudiantes/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ ...studentData, grupo: groupId })
    });
    if (res.ok) {
      const subjectsRes = await fetchWithAuthRetry(`${API_URL}/api/materias/`);
      if (subjectsRes.ok) {
        const subjectsData = await subjectsRes.json();
        setSubjects(subjectsData);
      }
    }
  };

  // Añadir sesión a grupo usando la API real
  const addSessionToGroup = async (groupId: string, sessionData: Omit<ClassSession, 'id'>) => {
    const res = await fetchWithAuthRetry(`${API_URL}/api/sesiones/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ ...sessionData, grupo: groupId })
    });
    if (res.ok) {
      const subjectsRes = await fetchWithAuthRetry(`${API_URL}/api/materias/`);
      if (subjectsRes.ok) {
        const subjectsData = await subjectsRes.json();
        setSubjects(subjectsData);
      }
    }
  };

  // Actualizar sesión en grupo usando la API real
  const updateSessionInGroup = async (groupId: string, updatedSession: ClassSession) => {
    const res = await fetch(`${API_URL}/api/sesiones/${updatedSession.id}/`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
      },
      body: JSON.stringify({ ...updatedSession, grupo: groupId })
    });
    if (res.ok) {
      // Opcional: recargar sesiones si lo necesitas
    }
  };

  const getStudentById = (studentIdToFind: string, groupIdToSearchIn: string): Student | undefined => {
    const groupData = getGroupById(groupIdToSearchIn);
    return groupData?.group?.estudiantes.find(s => s.id === studentIdToFind);
  };


  return (
    <DataContext.Provider value={{ 
        isAuthenticated, login, logout, 
        subjects, todayClasses, addSubject, getSubjectById, 
        addGroup, getGroupById, addStudentToGroup, addSessionToGroup,
        updateSessionInGroup, getStudentById
    }}>
      {children}
    </DataContext.Provider>
  );
};
