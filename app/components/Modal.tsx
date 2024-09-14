import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export default function Modal({ isOpen, onClose, children }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-sm w-full">
        <div className="flex justify-end">
          <button onClick={onClose} className="text-2xl">&times;</button>
        </div>
        {children}
      </div>
    </div>
  );
}