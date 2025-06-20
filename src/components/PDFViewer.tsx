import React, { useState, useEffect } from 'react';
import { Worker, Viewer } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
import { LoadError } from '@react-pdf-viewer/core';
import LoadingSpinner from './LoadingSpinner';

// Import styles
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';

interface PDFViewerProps {
    fileUrl: string;
    onClose: () => void;
    onExtract: () => Promise<void>;
    isExtracting?: boolean;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ fileUrl, onClose, onExtract, isExtracting = false }) => {
    const defaultLayoutPluginInstance = defaultLayoutPlugin();
    const [loadError, setLoadError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const handleExtract = async () => {
        if (!isExtracting) {
            await onExtract();
        }
    };

    useEffect(() => {
        setIsLoading(true);
        // Reset error state when fileUrl changes
        setLoadError(null);
    }, [fileUrl]);

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl flex flex-col w-full max-w-5xl h-[calc(100vh-2rem)] max-h-[900px] shadow-2xl border border-blue-100">
                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b shrink-0 bg-gradient-to-r from-blue-50 to-purple-50 rounded-t-2xl">
                    <h2 className="text-xl font-bold text-blue-800 tracking-tight">Document Viewer</h2>
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                        >
                            Close
                        </button>
                    </div>
                </div>

                {/* PDF Viewer Container */}
                <div className="flex-1 p-4 relative overflow-hidden bg-white rounded-b-2xl">
                    {loadError ? (
                        <div className="absolute inset-0 flex items-center justify-center bg-red-50 rounded-b-2xl">
                            <div className="text-center text-red-600">
                                <i className="fas fa-exclamation-circle text-4xl mb-2"></i>
                                <p>{loadError}</p>
                                <button 
                                    onClick={() => setLoadError(null)} 
                                    className="mt-4 px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200"
                                >
                                    Try Again
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full overflow-hidden rounded-lg border border-blue-100 shadow-inner">
                            <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js">
                                <Viewer
                                    fileUrl={fileUrl}
                                    plugins={[defaultLayoutPluginInstance]}
                                    onDocumentLoad={() => setIsLoading(false)}
                                    renderError={(error: LoadError) => {
                                        setLoadError(error.message || 'Failed to load PDF');
                                        setIsLoading(false);
                                        return (
                                            <div className="absolute inset-0 flex items-center justify-center bg-red-50 rounded-b-2xl">
                                                <div className="text-center text-red-600">
                                                    <i className="fas fa-exclamation-circle text-4xl mb-2"></i>
                                                    <p>{error.message || 'Failed to load PDF'}</p>
                                                </div>
                                            </div>
                                        );
                                    }}
                                    renderLoader={(percentages: number) => (
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <LoadingSpinner size="lg" className="text-blue-600" />
                                        </div>
                                    )}
                                />
                            </Worker>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PDFViewer;
