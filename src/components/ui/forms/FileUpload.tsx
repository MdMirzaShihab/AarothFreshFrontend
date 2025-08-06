import React, { useCallback, useRef, useState } from 'react';
import { Upload, X, Image, FileText } from 'lucide-react';
import { cn } from '@/utils/cn';
import { triggerHapticFeedback, isTouchDevice } from '@/hooks/useTouchInteractions';

export interface FileUploadProps {
  onFileSelect: (files: File[]) => void;
  onFileRemove?: (file: File) => void;
  acceptedTypes?: string[];
  maxFileSize?: number; // in MB
  maxFiles?: number;
  multiple?: boolean;
  disabled?: boolean;
  loading?: boolean;
  value?: File[];
  className?: string;
  preview?: boolean;
  label?: string;
  helperText?: string;
  error?: string;
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const getFileIcon = (file: File) => {
  if (file.type.startsWith('image/')) {
    return <Image className="w-5 h-5" />;
  }
  return <FileText className="w-5 h-5" />;
};

export const FileUpload: React.FC<FileUploadProps> = ({
  onFileSelect,
  onFileRemove,
  acceptedTypes = [],
  maxFileSize = 10, // 10MB default
  maxFiles = 1,
  multiple = false,
  disabled = false,
  loading = false,
  value = [],
  className,
  preview = true,
  label = 'Upload files',
  helperText,
  error
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [validationError, setValidationError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  const validateFile = (file: File): string | null => {
    // Check file type
    if (acceptedTypes.length > 0 && !acceptedTypes.some(type => 
      type.includes('*') ? file.type.startsWith(type.split('*')[0] || '') : file.type === type
    )) {
      return `File type "${file.type}" is not supported.`;
    }

    // Check file size
    if (file.size > maxFileSize * 1024 * 1024) {
      return `File size must be less than ${maxFileSize}MB.`;
    }

    return null;
  };

  const handleFileSelection = useCallback((files: FileList | null) => {
    if (!files || disabled) return;

    const filesArray = Array.from(files);
    const validFiles: File[] = [];
    let validationErrorMessage = '';

    // Check total files limit
    if (value.length + filesArray.length > maxFiles) {
      validationErrorMessage = `Maximum ${maxFiles} file(s) allowed.`;
      setValidationError(validationErrorMessage);
      return;
    }

    // Validate each file
    for (const file of filesArray) {
      const fileError = validateFile(file);
      if (fileError) {
        validationErrorMessage = fileError;
        break;
      }
      validFiles.push(file);
    }

    if (validationErrorMessage) {
      setValidationError(validationErrorMessage);
      return;
    }

    setValidationError('');
    onFileSelect(validFiles);

    // Haptic feedback on successful upload
    if (isTouchDevice()) {
      triggerHapticFeedback(50);
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [value.length, maxFiles, disabled, onFileSelect, maxFileSize, acceptedTypes]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragOver(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Only set isDragOver to false if leaving the drop zone entirely
    if (!dropZoneRef.current?.contains(e.relatedTarget as Node)) {
      setIsDragOver(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (disabled) return;

    handleFileSelection(e.dataTransfer.files);
  }, [disabled, handleFileSelection]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelection(e.target.files);
  };

  const handleRemoveFile = (fileToRemove: File) => {
    if (isTouchDevice()) {
      triggerHapticFeedback(25);
    }
    onFileRemove?.(fileToRemove);
  };

  const openFileDialog = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const displayError = error || validationError;

  return (
    <div className={cn('space-y-4', className)}>
      {/* Drop zone */}
      <div
        ref={dropZoneRef}
        onClick={openFileDialog}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          'border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-200',
          'hover:border-bottle-green hover:bg-bottle-green/5',
          'focus-within:outline-none focus-within:ring-2 focus-within:ring-bottle-green/40 focus-within:ring-offset-2',
          isDragOver && 'border-bottle-green bg-bottle-green/10 scale-[1.02]',
          displayError && 'border-tomato-red/50 bg-tomato-red/5',
          disabled && 'cursor-not-allowed opacity-50 hover:border-gray-300 hover:bg-transparent',
          loading && 'cursor-not-allowed'
        )}
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-label={label}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedTypes.join(',')}
          multiple={multiple}
          onChange={handleInputChange}
          disabled={disabled || loading}
          className="sr-only"
        />

        <div className="space-y-3">
          <div className="flex justify-center">
            {loading ? (
              <div className="w-8 h-8 border-2 border-bottle-green/30 border-t-bottle-green rounded-full animate-spin" />
            ) : (
              <Upload className={cn(
                'w-8 h-8 transition-colors duration-200',
                isDragOver ? 'text-bottle-green' : 'text-text-muted',
                displayError && 'text-tomato-red'
              )} />
            )}
          </div>

          <div className="space-y-1">
            <p className="font-medium text-text-dark">
              {loading ? 'Uploading...' : isDragOver ? 'Drop files here' : label}
            </p>
            <p className="text-sm text-text-muted">
              {helperText || `Drag and drop ${multiple ? 'files' : 'a file'} or click to browse`}
            </p>
            <p className="text-xs text-text-muted">
              {acceptedTypes.length > 0 && `Supported: ${acceptedTypes.join(', ')} • `}
              Max {maxFileSize}MB {multiple && `• Up to ${maxFiles} files`}
            </p>
          </div>
        </div>
      </div>

      {/* Error message */}
      {displayError && (
        <p className="text-tomato-red/80 text-sm flex items-center gap-2 animate-fade-in" role="alert">
          <svg className="w-4 h-4 text-tomato-red/60 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {displayError}
        </p>
      )}

      {/* File preview */}
      {preview && value.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-text-dark">Selected files:</h4>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {value.map((file, index) => (
              <div
                key={`${file.name}-${file.lastModified}-${index}`}
                className="flex items-center gap-3 p-3 bg-earthy-beige/20 rounded-xl"
              >
                <div className="text-bottle-green">
                  {getFileIcon(file)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-dark truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-text-muted">
                    {formatFileSize(file.size)}
                  </p>
                </div>

                {onFileRemove && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveFile(file);
                    }}
                    className="p-1 rounded-lg hover:bg-tomato-red/10 text-text-muted hover:text-tomato-red transition-colors duration-200 touch-target"
                    aria-label={`Remove ${file.name}`}
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;