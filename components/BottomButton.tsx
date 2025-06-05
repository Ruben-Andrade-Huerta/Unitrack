
import React from 'react';

interface BottomButtonProps {
  text: string;
  onClick: () => void;
  icon?: React.ReactNode;
  disabled?: boolean;
}

const BottomButton: React.FC<BottomButtonProps> = ({ text, onClick, icon, disabled }) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 max-w-md mx-auto">
      <button
        onClick={onClick}
        disabled={disabled}
        className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center transition duration-150 ease-in-out ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {icon && <span className="mr-2">{icon}</span>}
        {text}
      </button>
    </div>
  );
};

export default BottomButton;
    