
import React from 'react';
import { ChevronRightIcon } from './icons';

interface ListItemProps {
  primaryText: string;
  secondaryText?: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  showArrow?: boolean;
}

const ListItem: React.FC<ListItemProps> = ({ primaryText, secondaryText, icon, onClick, showArrow = true }) => {
  const content = (
    <div className="flex items-center justify-between w-full p-4 hover:bg-gray-100 cursor-pointer">
      <div className="flex items-center">
        {icon && <div className="mr-4 text-gray-500">{icon}</div>}
        <div>
          <p className="text-md font-medium text-gray-800">{primaryText}</p>
          {secondaryText && <p className="text-sm text-gray-500">{secondaryText}</p>}
        </div>
      </div>
      {showArrow && <ChevronRightIcon className="w-5 h-5 text-gray-400" />}
    </div>
  );

  if (onClick) {
    return <div onClick={onClick} className="border-b border-gray-200 last:border-b-0">{content}</div>;
  }
  
  return <div className="border-b border-gray-200 last:border-b-0">{content}</div>;
};

export default ListItem;
    