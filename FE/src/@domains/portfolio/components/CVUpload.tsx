import { useState, useRef, DragEvent, ChangeEvent } from 'react'
import { Upload, FileText, X, AlertCircle } from 'lucide-react'

interface CVUploadProps {
    cvFileName: string | null
    onFileChange: (fileName: string | null) => void
}

/**
 * CVUpload - React component
 * @returns React element
 */
export const CVUpload = ({ cvFileName, onFileChange }: CVUploadProps) => {
    const [isDragging, setIsDragging] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const MAX_FILE_SIZE = 20 * 1024 * 1024 // 20MB
/**
 * fileInputRef - Utility function
 * @returns void
 */

    const validateFile = (file: File): boolean => {
        setError(null)

        // Check file type
/**
 * MAX_FILE_SIZE - React component
 * @returns React element
 */
        if (file.type !== 'application/pdf') {
            setError('Only PDF files are supported')
            return false
        }

/**
 * validateFile - Utility function
 * @returns void
 */
        // Check file size
        if (file.size > MAX_FILE_SIZE) {
            setError('File size must be less than 20MB')
            return false
        }

        return true
    }

    const handleFile = (file: File) => {
        if (validateFile(file)) {
            // In a real app, you would upload the file to a server here
            // For now, we just store the filename
            onFileChange(file.name)
        }
    }

    const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDragging(true)
/**
 * handleFile - Utility function
 * @returns void
 */
    }

    const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDragging(false)
    }

    const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        e.stopPropagation()
/**
 * handleDragEnter - Utility function
 * @returns void
 */
    }

    const handleDrop = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDragging(false)

        const files = e.dataTransfer.files
        if (files && files.length > 0) {
/**
 * handleDragLeave - Utility function
 * @returns void
 */
            handleFile(files[0])
        }
    }

    const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (files && files.length > 0) {
            handleFile(files[0])
        }
/**
 * handleDragOver - Utility function
 * @returns void
 */
        // Reset input value to allow selecting the same file again
        e.target.value = ''
    }

    const handleClick = () => {
        fileInputRef.current?.click()
    }

/**
 * handleDrop - Utility function
 * @returns void
 */
    const handleRemove = () => {
        onFileChange(null)
        setError(null)
    }

    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900 text-center mb-1">CV</h2>
/**
 * files - Utility function
 * @returns void
 */
            <p className="text-sm text-slate-500 text-center mb-4">
                Upload a file to highlight your exhibitions, collaborations, or achievements.
                <br />
                <span className="text-slate-400">Supported format: PDF. Maximum file size: 20MB.</span>
            </p>

            {/* Hidden file input */}
            <input
                ref={fileInputRef}
/**
 * handleFileInputChange - Utility function
 * @returns void
 */
                type="file"
                accept="application/pdf,.pdf"
                onChange={handleFileInputChange}
                className="hidden"
/**
 * files - Utility function
 * @returns void
 */
            />

            {cvFileName ? (
                // File uploaded state
                <div className="flex items-center justify-between p-4 border border-slate-200 rounded-xl bg-slate-50">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-red-100">
                            <FileText className="h-5 w-5 text-red-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-700">{cvFileName}</p>
/**
 * handleClick - Utility function
 * @returns void
 */
                            <p className="text-xs text-slate-500">PDF Document</p>
                        </div>
                    </div>
                    <button
                        onClick={handleRemove}
                        className="p-2 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                        title="Remove file"
/**
 * handleRemove - Utility function
 * @returns void
 */
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>
            ) : (
                // Upload dropzone
                <div
                    onClick={handleClick}
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    className={`
                        w-full flex flex-col items-center justify-center gap-3 py-8 px-4 
                        border-2 border-dashed rounded-xl cursor-pointer transition-all
                        ${isDragging
                            ? 'border-[#0066FF] bg-blue-50 text-[#0066FF]'
                            : 'border-slate-300 text-slate-600 hover:border-slate-400 hover:bg-slate-50'
                        }
                    `}
                >
                    <div
                        className={`
                        p-3 rounded-full transition-colors
                        ${isDragging ? 'bg-blue-100' : 'bg-slate-100'}
                    `}
                    >
                        <Upload className={`h-6 w-6 ${isDragging ? 'text-[#0066FF]' : 'text-slate-500'}`} />
                    </div>
                    <div className="text-center">
                        <p className="font-medium">
                            {isDragging ? 'Drop your PDF here' : 'Drag & drop your CV here'}
                        </p>
                        <p className="text-sm text-slate-400 mt-1">or click to browse files</p>
                    </div>
                </div>
            )}

            {/* Error message */}
            {error && (
                <div className="flex items-center gap-2 mt-3 p-3 rounded-lg bg-red-50 text-red-600">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <p className="text-sm">{error}</p>
                </div>
            )}
        </div>
    )
}
