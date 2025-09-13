import React, { useState, useRef } from 'react';
import { Upload, Camera, X, FileText, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';

const ReceiptUpload = ({ onReceiptAnalyzed, disabled = false }) => {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const fileInputRef = useRef(null);

  const handleFiles = async (files) => {
    if (!files || files.length === 0) return;
    
    const file = files[0];
    
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please upload an image (JPEG, PNG, GIF) or PDF file');
      return;
    }

    // Validate file size (5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error('File size must be less than 5MB');
      return;
    }

    setUploadedFile(file);
    await uploadReceipt(file);
  };

  const uploadReceipt = async (file) => {
    setUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('receipt', file);

      const token = localStorage.getItem('token');
      const response = await fetch('/api/receipts/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to analyze receipt');
      }

      if (result.success) {
        toast.success('Receipt analyzed successfully! 🎉');
        onReceiptAnalyzed(result.data);
      } else {
        throw new Error(result.message || 'Failed to analyze receipt');
      }

    } catch (error) {
      console.error('Receipt upload error:', error);
      
      // Handle specific error cases
      if (error.message.includes('Receipt analysis service is not configured')) {
        toast.error('Azure Document Intelligence is not configured. Please contact administrator to set up receipt analysis.');
      } else if (error.message.includes('Could not extract data from the receipt')) {
        toast.error('Unable to read the receipt. Please ensure the image is clear and try again.');
      } else {
        toast.error(error.message || 'Failed to analyze receipt. Please try again.');
      }
      
      setUploadedFile(null);
    } finally {
      setUploading(false);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (disabled || uploading) return;
    
    const files = e.dataTransfer.files;
    handleFiles(files);
  };

  const handleFileSelect = (e) => {
    if (disabled || uploading) return;
    handleFiles(e.target.files);
  };

  const openFileDialog = () => {
    if (disabled || uploading) return;
    fileInputRef.current?.click();
  };

  const clearFile = () => {
    setUploadedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getFileIcon = (file) => {
    if (file.type === 'application/pdf') {
      return <FileText className="h-8 w-8 text-red-500" />;
    }
    return <Camera className="h-8 w-8 text-blue-500" />;
  };

  return (
    <div className="space-y-3">
      {uploadedFile && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Receipt uploaded</span>
          <button
            type="button"
            onClick={clearFile}
            className="text-sm text-gray-500 hover:text-red-600 flex items-center gap-1"
            disabled={uploading}
          >
            <X className="h-4 w-4" />
            Clear
          </button>
        </div>
      )}

      {!uploadedFile ? (
        <div
          className={`relative border-2 border-dashed rounded-lg p-4 transition-colors ${
            dragActive
              ? 'border-blue-400 bg-blue-50'
              : disabled
              ? 'border-gray-200 bg-gray-50'
              : 'border-gray-300 hover:border-gray-400'
          } ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={openFileDialog}
        >
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept="image/*,.pdf"
            onChange={handleFileSelect}
            disabled={disabled || uploading}
          />
          
          <div className="text-center">
            {uploading ? (
              <div className="flex flex-col items-center space-y-2">
                <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
                <p className="text-sm text-gray-600">Analyzing receipt...</p>
                <p className="text-xs text-gray-500">This may take a few seconds</p>
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-2">
                <Upload className="h-6 w-6 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">
                    Drop receipt or <span className="text-blue-600">click to upload</span>
                  </p>
                  <p className="text-xs text-gray-500">
                    PNG, JPG, PDF up to 5MB
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
          <div className="flex items-center space-x-3">
            {getFileIcon(uploadedFile)}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {uploadedFile.name}
              </p>
              <p className="text-xs text-gray-500">
                {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
            {uploading ? (
              <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
            ) : (
              <CheckCircle className="h-5 w-5 text-green-500" />
            )}
          </div>
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="flex items-start space-x-2">
          <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-blue-700">
            <p className="font-medium mb-1">How it works:</p>
            <ul className="space-y-1 text-blue-600">
              <li>• Upload a clear photo or scan of your receipt</li>
              <li>• AI will extract merchant, amount, date, and items</li>
              <li>• Review and edit the extracted information</li>
              <li>• Save the transaction with receipt details</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReceiptUpload;
