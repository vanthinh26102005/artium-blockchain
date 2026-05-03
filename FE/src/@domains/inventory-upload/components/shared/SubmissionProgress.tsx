/**
 * Submission Progress Component
 * 
 * Displays upload progress during artwork submission.
 * Shows stages, progress bar, and current file being uploaded.
 */

import React from "react";
import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/outline";
import { cn } from "@shared/lib/utils";

// ============================================================================
// Types
// ============================================================================

interface SubmissionProgressProps {
  stage: 'validating' | 'uploading_images' | 'creating_artwork' | 'complete' | 'error';
  message: string;
  percentage: number;
  currentFile?: string;
  error?: string | null;
  className?: string;
}

// ============================================================================
// Component
// ============================================================================

/**
 * SubmissionProgress - React component
 * @returns React element
 */
export const SubmissionProgress: React.FC<SubmissionProgressProps> = ({
  stage,
  message,
  percentage,
  currentFile,
  error,
  className,
}) => {
  // Determine color scheme
  const isError = stage === 'error';
  const isComplete = stage === 'complete';
  const isProcessing = !isError && !isComplete;
/**
 * isError - Utility function
 * @returns void
 */

  return (
    <div className={cn("rounded-[28px] border bg-white p-6", className)}>
      {/* Header */}
/**
 * isComplete - Utility function
 * @returns void
 */
      <div className="flex items-center gap-3">
        {isComplete ? (
          <CheckCircleIcon className="h-8 w-8 text-green-600" />
        ) : isError ? (
/**
 * isProcessing - Utility function
 * @returns void
 */
          <XCircleIcon className="h-8 w-8 text-red-600" />
        ) : (
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
        )}
        
        <div className="flex-1">
          <p className="text-lg font-bold text-gray-900">
            {isComplete ? "Success!" : isError ? "Upload Failed" : "Uploading..."}
          </p>
          <p className="mt-1 text-sm text-gray-600">{message}</p>
        </div>
      </div>

      {/* Progress Bar */}
      {isProcessing && (
        <div className="mt-4">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>{stage === 'validating' ? 'Validating' : stage === 'uploading_images' ? 'Uploading' : 'Creating'}</span>
            <span>{percentage}%</span>
          </div>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-full bg-blue-600 transition-all duration-300"
              style={{ width: `${percentage}%` }}
            />
          </div>
          {currentFile && (
            <p className="mt-2 truncate text-xs text-gray-500">
              Uploading: {currentFile}
            </p>
          )}
        </div>
      )}

      {/* Completion */}
      {isComplete && (
        <div className="mt-4 rounded-lg bg-green-50 p-3">
          <p className="text-sm text-green-800">
            Your artwork has been successfully uploaded and created!
          </p>
        </div>
      )}

      {/* Error */}
      {isError && error && (
        <div className="mt-4 rounded-lg bg-red-50 p-3">
          <p className="text-sm font-medium text-red-800">Error</p>
          <p className="mt-1 text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Stage Indicator */}
      {isProcessing && (
        <div className="mt-6 flex items-center justify-between text-xs text-gray-500">
          <div className={cn("flex items-center gap-2", stage === 'validating' && "text-blue-600 font-semibold")}>
            <div className={cn("h-2 w-2 rounded-full", stage === 'validating' ? "bg-blue-600" : "bg-gray-300")} />
            Validating
          </div>
          <div className={cn("flex items-center gap-2", stage === 'uploading_images' && "text-blue-600 font-semibold")}>
            <div className={cn("h-2 w-2 rounded-full", stage === 'uploading_images' ? "bg-blue-600" : "bg-gray-300")} />
            Uploading
          </div>
          <div className={cn("flex items-center gap-2", stage === 'creating_artwork' && "text-blue-600 font-semibold")}>
            <div className={cn("h-2 w-2 rounded-full", stage === 'creating_artwork' ? "bg-blue-600" : "bg-gray-300")} />
            Creating
          </div>
        </div>
      )}
    </div>
  );
};
