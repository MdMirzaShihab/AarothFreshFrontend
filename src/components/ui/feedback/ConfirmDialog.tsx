import React from 'react';
import { AlertTriangle, Info, CheckCircle, XCircle } from 'lucide-react';
import { cn } from '@/utils/cn';
import Modal from '../base/Modal';
import Button from '../base/Button';

export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'danger' | 'warning' | 'success';
  loading?: boolean;
  icon?: React.ReactNode;
  showIcon?: boolean;
}

const variantConfig = {
  default: {
    icon: Info,
    iconColor: 'text-blue-600',
    iconBg: 'bg-blue-100',
    confirmButton: 'primary' as const
  },
  danger: {
    icon: XCircle,
    iconColor: 'text-tomato-red',
    iconBg: 'bg-tomato-red/10',
    confirmButton: 'danger' as const
  },
  warning: {
    icon: AlertTriangle,
    iconColor: 'text-amber-600',
    iconBg: 'bg-amber-100',
    confirmButton: 'primary' as const
  },
  success: {
    icon: CheckCircle,
    iconColor: 'text-mint-fresh',
    iconBg: 'bg-mint-fresh/10',
    confirmButton: 'primary' as const
  }
};

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'default',
  loading = false,
  icon: customIcon,
  showIcon = true
}) => {
  const config = variantConfig[variant];
  const IconComponent = config.icon;

  const handleConfirm = () => {
    onConfirm();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      showCloseButton={false}
      closeOnBackdrop={!loading}
      closeOnEscape={!loading}
    >
      <div className="text-center space-y-6">
        {/* Icon */}
        {showIcon && (
          <div className="flex justify-center">
            <div className={cn(
              'w-12 h-12 rounded-full flex items-center justify-center',
              config.iconBg
            )}>
              {customIcon || (
                <IconComponent className={cn('w-6 h-6', config.iconColor)} />
              )}
            </div>
          </div>
        )}

        {/* Content */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-text-dark">
            {title}
          </h3>
          
          <p className="text-text-muted leading-relaxed">
            {message}
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={loading}
            fullWidth
            size="md"
          >
            {cancelText}
          </Button>
          
          <Button
            variant={config.confirmButton}
            onClick={handleConfirm}
            loading={loading}
            disabled={loading}
            fullWidth
            size="md"
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;