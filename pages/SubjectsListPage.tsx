
import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataContext, DataContextType } from '../contexts/DataContext';
import PageHeader from '../components/PageHeader';
import BottomButton from '../components/BottomButton';
import ListItem from '../components/ListItem';
import { PlusIcon } from '../components/icons';
import { ROUTE_PATHS } from '../constants';
import { Subject } from '../types';

const SubjectsListPage: React.FC = () => {
  const navigate = useNavigate();
  const { subjects } = useContext(DataContext) as DataContextType;

  return (
    <div className="pb-20">
      <PageHeader title="Mis Materias" showBackButton={true} backPath={ROUTE_PATHS.DASHBOARD} />
      <div className="pt-2">
        {subjects.length > 0 ? (
          subjects.map((subject: Subject) => (
            <ListItem
              key={subject.id}
              primaryText={subject.nombre}
              secondaryText={subject.codigo}
              onClick={() => navigate(ROUTE_PATHS.SUBJECT_DETAILS.replace(':materiaId', subject.id))}
            />
          ))
        ) : (
          <p className="p-4 text-center text-gray-500">No has agregado ninguna materia aún.</p>
        )}
      </div>
      <BottomButton text="Agregar Nueva Materia" icon={<PlusIcon className="w-5 h-5"/>} onClick={() => navigate(ROUTE_PATHS.ADD_SUBJECT)} />
    </div>
  );
};

export default SubjectsListPage;
    