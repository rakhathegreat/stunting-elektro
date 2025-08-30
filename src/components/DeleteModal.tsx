import React from "react";

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
}

const DeleteModal: React.FC<DeleteModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Hapus Data",
  message = "Apakah Anda yakin ingin menghapus data ini?",
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="relative flex flex-col items-center justify-center bg-white rounded-xl max-w-sm w-full p-6 z-10">
        <div className="flex items-center justify-center mb-4 bg-red-100 rounded-full p-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-7 h-7 text-red-500"
          >
            <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>

        <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
        <p className="text-sm text-center font-medium text-gray-600 mb-4">{message}</p>

        <div className="flex w-full justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 w-full text-sm font-medium text-gray-900 bg-gray-200 border border-gray-300 rounded-lg hover:bg-gray-300 hover:cursor-pointer"
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 w-full text-sm font-medium text-white bg-red-700 rounded-lg hover:bg-red-800 hover:cursor-pointer"
          >
            Hapus
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteModal;