import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload } from 'lucide-react';

interface ImageDropzoneProps {
  onDrop: (files: File[]) => void;
  maxFiles?: number;
}

export default function ImageDropzone({ onDrop, maxFiles = 10 }: ImageDropzoneProps) {
  const onDropCallback = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles?.length > maxFiles) {
        alert(`You can only upload up to ${maxFiles} images`);
        return;
      }
      onDrop(acceptedFiles);
    },
    [maxFiles, onDrop]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: onDropCallback,
    accept: { 'image/*': [] },
    maxFiles,
    maxSize: 5242880, // 5MB
  });

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer ${
        isDragActive ? 'border-indigo-600 bg-indigo-50' : 'border-gray-300'
      }`}
    >
      <input {...getInputProps()} />
      <Upload className="mx-auto h-12 w-12 text-gray-400" />
      <p className="mt-2 text-sm text-gray-600">
        {isDragActive
          ? 'Drop the images here...'
          : 'Drag and drop images here, or click to select files'}
      </p>
      <p className="mt-1 text-xs text-gray-500">
        Up to {maxFiles} images (max 5MB each)
      </p>
    </div>
  );
}