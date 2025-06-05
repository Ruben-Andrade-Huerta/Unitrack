
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, XMarkIcon } from './icons';

interface PageHeaderProps {
  title: string;
  showBackButton?: boolean;
  backPath?: string;
  showCloseButton?: boolean;
  closePath?: string;
  rightContent?: React.ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, showBackButton, backPath, showCloseButton, closePath, rightContent }) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (backPath) {
      navigate(backPath);
    } else {
      navigate(-1);
    }
  };
  
  const handleClose = () => {
    if (closePath) {
      navigate(closePath);
    } else {
      navigate(-1); // Default to previous page if no explicit close path
    }
  };

  return (
    <div className="bg-white p-4 flex items-center justify-between sticky top-0 z-10 border-b border-gray-200">
      <div className="flex items-center">
        {showBackButton && (
          <button onClick={handleBack} className="mr-3 text-gray-600 hover:text-blue-600">
            <ArrowLeftIcon className="w-6 h-6" />
          </button>
        )}
         {showCloseButton && (
          <button onClick={handleClose} className="mr-3 text-gray-600 hover:text-blue-600">
            <XMarkIcon className="w-6 h-6" />
          </button>
        )}
        <h1 className="text-xl font-semibold text-gray-800">{title}</h1>
      </div>
      <div>{rightContent}</div>
    </div>
  );
};

export default PageHeader;
    