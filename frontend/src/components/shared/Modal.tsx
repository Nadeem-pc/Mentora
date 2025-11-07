import React from 'react';
import { X } from 'lucide-react';

export interface ModalButton {
  label: string;
  variant: 'primary' | 'secondary' | 'danger' | 'success' | 'warning';
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
}

export interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  
  title: string;
  description?: string | React.ReactNode;
  icon?: React.ReactNode;
  
  variant?: 'danger' | 'success' | 'warning' | 'info';
  size?: 'sm' | 'md' | 'lg';
  
  details?: string[];
  children?: React.ReactNode; 
  
  confirmButton?: ModalButton;
  cancelButton?: ModalButton;
  
  closeOnOutsideClick?: boolean;
  showCloseButton?: boolean;
  preventCloseWhileLoading?: boolean;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  icon,
  variant = 'info',
  size = 'md',
  details = [],
  children,
  confirmButton,
  cancelButton,
  closeOnOutsideClick = true,
  showCloseButton = true,
  preventCloseWhileLoading = true
}) => {
  if (!isOpen) return null;

  const isLoading = confirmButton?.loading || cancelButton?.loading;
  const shouldPreventClose = preventCloseWhileLoading && isLoading;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg'
  };

  const getVariantStyles = (variant: string) => {
    switch (variant) {
      case 'danger':
        return {
          headerBg: 'bg-red-50',
          iconBg: 'bg-red-100',
          iconColor: 'text-red-600',
          titleColor: 'text-red-900',
          messageBg: 'bg-red-50 border-red-400',
          messageColor: 'text-red-800'
        };
      case 'success':
        return {
          headerBg: 'bg-green-50',
          iconBg: 'bg-green-100',
          iconColor: 'text-green-600',
          titleColor: 'text-green-900',
          messageBg: 'bg-green-50 border-green-400',
          messageColor: 'text-green-800'
        };
      case 'warning':
        return {
          headerBg: 'bg-yellow-50',
          iconBg: 'bg-yellow-100',
          iconColor: 'text-yellow-600',
          titleColor: 'text-yellow-900',
          messageBg: 'bg-yellow-50 border-yellow-400',
          messageColor: 'text-yellow-800'
        };
      default: // info
        return {
          headerBg: 'bg-blue-50',
          iconBg: 'bg-blue-100',
          iconColor: 'text-blue-600',
          titleColor: 'text-blue-900',
          messageBg: 'bg-blue-50 border-blue-400',
          messageColor: 'text-blue-800'
        };
    }
  };

  const getButtonStyles = (variant: string) => {
    switch (variant) {
      case 'danger':
        return 'bg-red-600 hover:bg-red-700 focus:ring-red-500 text-white';
      case 'success':
        return 'bg-green-600 hover:bg-green-700 focus:ring-green-500 text-white';
      case 'warning':
        return 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500 text-white';
      case 'primary':
        return 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 text-white';
      case 'secondary':
      default:
        return 'bg-white hover:bg-gray-50 focus:ring-blue-500 text-gray-700 border border-gray-300';
    }
  };

  const styles = getVariantStyles(variant);

  const handleOutsideClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && closeOnOutsideClick && !shouldPreventClose) {
      onClose();
    }
  };

  const handleClose = () => {
    if (!shouldPreventClose) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/60 bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleOutsideClick}
    >
      <div className={`bg-white rounded-xl shadow-2xl ${sizeClasses[size]} w-full transform transition-all`}>
        {/* Header */}
        <div className={`px-6 py-4 border-b border-gray-200 ${styles.headerBg} rounded-t-xl`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {icon && (
                <div className={`p-2 ${styles.iconBg} rounded-full`}>
                  <div className={styles.iconColor}>
                    {icon}
                  </div>
                </div>
              )}
              <h3 className={`text-lg font-semibold ${styles.titleColor}`}>
                {title}
              </h3>
            </div>
            {showCloseButton && (
              <button
                onClick={handleClose}
                disabled={shouldPreventClose}
                className="p-1 hover:bg-gray-200 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-6">
          {children && (
            <div className="mb-4">
              {children}
            </div>
          )}

          {/* Description and Details */}
          {(description || details.length > 0) && (
            <div className={`p-4 rounded-lg border-l-4 ${styles.messageBg}`}>
              <div className={`text-sm ${styles.messageColor}`}>
                {typeof description === 'string' ? (
                  <p>{description}</p>
                ) : (
                  description
                )}
                
                {details.length > 0 && (
                  <ul className="mt-2 space-y-1 text-xs">
                    {details.map((detail, index) => (
                      <li key={index}>• {detail}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {(confirmButton || cancelButton) && (
          <div className="px-6 py-4 bg-gray-50 rounded-b-xl flex justify-end space-x-3">
            {cancelButton && (
              <button
                onClick={cancelButton.onClick}
                disabled={cancelButton.disabled || isLoading}
                className={`px-4 py-2 text-sm font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${getButtonStyles(cancelButton.variant)}`}
              >
                {cancelButton.loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                    <span>{cancelButton.label}</span>
                  </div>
                ) : (
                  cancelButton.label
                )}
              </button>
            )}
            
            {confirmButton && (
              <button
                onClick={confirmButton.onClick}
                disabled={confirmButton.disabled || isLoading}
                className={`px-6 py-2 text-sm font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${getButtonStyles(confirmButton.variant)}`}
              >
                {confirmButton.loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                    <span>Processing...</span>
                  </div>
                ) : (
                  confirmButton.label
                )}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ConfirmationModal;