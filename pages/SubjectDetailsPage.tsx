
import React, { useContext, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DataContext, DataContextType } from '../contexts/DataContext';
import PageHeader from '../components/PageHeader';
import BottomButton from '../components/BottomButton';
import ListItem from '../components/ListItem';
import { PlusIcon } from '../components/icons';
import { ROUTE_PATHS } from '../constants';
import { Subject, Group } from '../types';

const SubjectDetailsPage: React.FC = () => {
  const { materiaId } = useParams<{ materiaId: string }>();
  const navigate = useNavigate();
  const { getSubjectById } = useContext(DataContext) as DataContextType;
  const [subject, setSubject] = useState<Subject | null>(null);

  useEffect(() => {
    if (materiaId) {
      const foundSubject = getSubjectById(materiaId);
      setSubject(foundSubject || null);
    }
  }, [materiaId, getSubjectById]);

  if (!subject) {
    return (
      <div>
        <PageHeader title="Materia no encontrada" showBackButton={true} backPath={ROUTE_PATHS.SUBJECTS_LIST} />
        <p className="p-4 text-center text-gray-500">La materia que buscas no existe o no se pudo cargar.</p>
      </div>
    );
  }

  return (
    <div className="pb-20">
      <PageHeader title={subject.nombre} showBackButton={true} backPath={ROUTE_PATHS.SUBJECTS_LIST} />
      <h2 className="p-4 text-lg font-medium text-gray-700 border-b border-gray-200">Grupos</h2>
      <div className="pt-0">
        {subject.grupos.length > 0 ? (
          subject.grupos.map((group: Group) => (
            <ListItem
              key={group.id}
              primaryText={group.nombre}
              onClick={() => navigate(ROUTE_PATHS.GROUP_SUMMARY.replace(':grupoId', group.id))}
            />
          ))
        ) : (
          <p className="p-4 text-center text-gray-500">No hay grupos asignados a esta materia.</p>
        )}
      </div>
      <BottomButton 
        text="Agregar Nuevo Grupo" 
        icon={<PlusIcon className="w-5 h-5"/>} 
        onClick={() => navigate(ROUTE_PATHS.ADD_GROUP.replace(':materiaId', subject.id))} 
      />
    </div>
  );
};

export default SubjectDetailsPage;
    