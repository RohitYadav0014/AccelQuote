import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import FileItem from './FileItem';
import PDFViewer from './PDFViewer';
import { fetchFileList, extractPdfData } from '../services/api';
import { convertToMarkdown, downloadMarkdown } from '../utils/markdown';
import { 
    saveExtraction, 
    getExtraction, 
    getProcessedFileIds, 
    getFileProcessingHistory,
    getItemPrices,
    getCnpDiscountData,
    getFinalPricing
} from '../services/userExtractionStore';

interface File {
    id: string;
    name: string;
    size: number;
    lastModified: string;
    type: string;
}

interface FileListProps {
    isProcessingPdf: boolean;
    setIsProcessingPdf: (val: boolean) => void;
    onExtractionResult?: (data: any, fileName?: string) => void;
}

const FileList: React.FC<FileListProps> = ({ isProcessingPdf, setIsProcessingPdf, onExtractionResult }) => {
    const [files, setFiles] = useState<File[]>([]);
    const [filesLoaded, setFilesLoaded] = useState(false);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [viewingFile, setViewingFile] = useState<File | null>(null);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [extractionResult, setExtractionResult] = useState<any>(null);
    const [extracting, setExtracting] = useState(false);
    const [markdownData, setMarkdownData] = useState<string>('');
    const [itemPrices, setItemPrices] = useState<any>(null);
    const [processedFileIds, setProcessedFileIds] = useState<string[]>([]);
    const [processingHistory, setProcessingHistory] = useState<Record<string, string[]>>({});
    const [user, setUser] = useState(() => {
        try {
            const savedUser = localStorage.getItem('current_user');
            return savedUser ? JSON.parse(savedUser) : {};
        } catch {
            return {};
        }
    });

    useEffect(() => {
        if (user && user.username) {
            // Revert to original logic: processed means extraction data exists
            setProcessedFileIds(getProcessedFileIds(user.username));
        }
        setProcessingHistory(getFileProcessingHistory());
    }, [user]);

    const handleFileSelect = (file: File) => {
        setSelectedFile(file);
        setViewingFile(file);
        setExtractionResult(null);
        setMarkdownData('');
    };

    const handleExtractData = async () => {
        if (!viewingFile) return;
        setExtracting(true);
        const fileId = (viewingFile as any).queryId || viewingFile.id;
        const extractPromise = extractPdfData(fileId);
        toast.promise(extractPromise, {
            loading: 'Extracting data from PDF...',
            success: 'Data extracted successfully!',
            error: (err) => err instanceof Error ? err.message : 'Failed to process data'
        });
        try {
            const result = await extractPromise;
            setExtractionResult(result.message);
            const markdown = convertToMarkdown(result);
            setMarkdownData(markdown);
            // Notify parent if callback exists
            if (typeof onExtractionResult === 'function') {
                onExtractionResult(result.message, viewingFile?.name);
            }
        } catch (err) {
            console.error('Extraction error:', err);
        } finally {
            setExtracting(false);
        }
    };

    // After processing a file, update processing history
    const handleProcessPdf = async (file: File) => {
        setIsProcessingPdf(true);
        const fileId = (file as any).queryId || file.id;
        const processPromise = extractPdfData(fileId);
        toast.promise(processPromise, {
            loading: 'Processing PDF...',
            success: 'PDF processed successfully!',
            error: (err) => err instanceof Error ? err.message : 'Failed to process PDF'
        });
        try {
            const result = await processPromise;
            setExtractionResult(result.message);
            const markdown = convertToMarkdown(result);
            setMarkdownData(markdown);
            setSelectedFile(file);
            setViewingFile(file);
            if (typeof onExtractionResult === 'function') {
                onExtractionResult(result.message, file?.name);
            }
            // Save extraction persistently
            if (user && user.username) {
                saveExtraction(user.username, fileId, result.message, user.role);
                setProcessedFileIds(getProcessedFileIds(user.username));
                setProcessingHistory(getFileProcessingHistory()); // update after processing
            }
        } catch (err) {
            console.error('Processing error:', err);
        } finally {
            setIsProcessingPdf(false);
        }
    };

    const handleDownloadMarkdown = () => {
        if (markdownData && viewingFile) {
            try {
                const filename = `${viewingFile.name.replace('.pdf', '')}_extraction.md`;
                downloadMarkdown(markdownData, filename);
                toast.success('Markdown file downloaded successfully!');
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Failed to download markdown file';
                toast.error(errorMessage);
            }
        }
    };

    useEffect(() => {
        if (filesLoaded) return;
        const fetchFiles = async () => {
            try {
                const fileList = await fetchFileList();
                const apiFiles = fileList.map((filePath: string) => ({
                    id: filePath,
                    name: filePath.split('/').pop() || filePath,
                    size: 0,
                    lastModified: new Date().toISOString(),
                    type: 'application/pdf'
                }));
                // Hardcoded sample files from public/sample/
                const sampleFiles = [
                    {
                        id: '/sample/EXTERNAL RFQ 60002435987.pdf',
                        name: 'EXTERNAL RFQ 60002435987.pdf',
                        queryId: 'Samples from France/EXTERNAL RFQ 6000243598.pdf',
                        size: 0,
                        lastModified: new Date().toISOString(),
                        type: 'application/pdf'
                    },
                ];
                // Merge and deduplicate by id
                const allFiles = [...apiFiles, ...sampleFiles.filter(sf => !apiFiles.some(af => af.id === sf.id))];
                setFiles(allFiles);
                setFilesLoaded(true);
                toast.success('Files loaded successfully!');
            } catch (err) {
                let errorMessage = 'Failed to connect to the server. Please check your network connection and try again.';
                if (err instanceof Error) {
                    if (err.message.includes('Failed to fetch')) {
                        errorMessage = 'Could not connect to the server. Please check if the server is running and try again.';
                    } else {
                        errorMessage = err.message;
                    }
                }
                setError(errorMessage);
                toast.error(errorMessage);
                console.error('Error fetching files:', err);
            } finally {
                setLoading(false);
            }
        };
        toast.promise(fetchFiles(), {
            loading: 'Loading files...',
            success: null,
            error: null,
        });
    }, [filesLoaded]);

    const filteredFiles = files.filter(file => 
        file.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleRetry = async () => {
        setError(null);
        setLoading(true);
        setFilesLoaded(false);
    };

    // Helper: check if file has final pricing (quote generated)
    const hasQuoteGenerated = (file: File): boolean => {
        const fileId = (file as any).queryId || file.id;
        if (user && user.username) {
            const finalPricing = getFinalPricing(user.username, fileId);
            return finalPricing && finalPricing.length > 0;
        }
        return false;
    };

    // Helper: show summary for processed file
    const handleShowProcessedSummary = (file: File) => {
        const fileId = (file as any).queryId || file.id;
        if (user && user.username) {
            const extraction = getExtraction(user.username, fileId);
            if (extraction && typeof onExtractionResult === 'function') {
                onExtractionResult(extraction, file.name);
            } else {
                toast.error('No extraction data found for this file.');
            }
        }
    };

    // Helper: handle quote generation navigation
    const handleGenerateQuote = (file: File) => {
        const fileId = (file as any).queryId || file.id;
        if (user && user.username && typeof onExtractionResult === 'function') {
            const extraction = getExtraction(user.username, fileId);
            
            // Get any available pricing data (may be null/undefined)
            const itemPrices = getItemPrices(user.username, fileId);
            const discountData = getCnpDiscountData(user.username, fileId);
            const finalPricing = getFinalPricing(user.username, fileId);
            
            // Combine all available data for quote generation
            const quoteData = {
                ...(extraction || {}), // Use empty object if no extraction data
                item_price_details: itemPrices || null,
                cnp_discount_info: discountData || null,
                complete_pricing_info: finalPricing || null,
                _isQuoteMode: true, // Flag to indicate this is for quote generation
                _fileName: file.name, // Include file name for reference
                _fileId: fileId // Include file ID for reference
            };
            
            onExtractionResult(quoteData, file.name);
            toast.success('Navigating to pricing computation...');
        }
    };

    // Helper: handle file upload (dummy for now)
    const handleFileUpload = () => {
        toast.error('File upload feature is currently disabled.');
    };

    useEffect(() => {
        // Listen for sidebar-logout event from Sidebar profile button
        const handleSidebarLogout = () => {
            if (typeof setIsProcessingPdf === 'function') setIsProcessingPdf(false);
            if (typeof onExtractionResult === 'function') onExtractionResult(null, undefined);
            localStorage.removeItem('current_user');
            window.location.reload();
        };
        window.addEventListener('sidebar-logout', handleSidebarLogout);
        return () => window.removeEventListener('sidebar-logout', handleSidebarLogout);
    }, []);

    // Listen for discount data and final pricing updates
    useEffect(() => {
        const handleStorageChange = (event: StorageEvent) => {
            if (event.key === 'user_cnp_discount_v1' || event.key === 'user_final_pricing_v1') {
                // Refresh processing history when discount or final pricing data changes
                setProcessingHistory(getFileProcessingHistory());
            }
        };

        // Listen for localStorage changes
        window.addEventListener('storage', handleStorageChange);
        
        // Also listen for custom events for same-tab updates
        const handleDiscountUpdate = () => {
            setProcessingHistory(getFileProcessingHistory());
        };
        const handleFinalPricingUpdate = () => {
            setProcessingHistory(getFileProcessingHistory());
        };
        
        window.addEventListener('discount-data-updated', handleDiscountUpdate);
        window.addEventListener('final-pricing-updated', handleFinalPricingUpdate);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('discount-data-updated', handleDiscountUpdate);
            window.removeEventListener('final-pricing-updated', handleFinalPricingUpdate);
        };
    }, [user]);

    return (
        <div className="max-w-6xl mx-auto p-6">
            {/* Header, Upload Button and Search */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
                <div className="flex items-center gap-4">
                    <h2 className="text-2xl font-bold text-gray-900">Pending RFQs</h2>
                    <button
                        onClick={handleFileUpload}
                        disabled={true}
                        className="px-4 py-2 bg-gray-300 text-gray-500 rounded-lg font-medium cursor-not-allowed flex items-center gap-2"
                        title="Upload feature is currently disabled"
                    >
                        <i className="fas fa-upload"></i>
                        Upload File
                    </button>
                </div>
                <input
                    type="text"
                    placeholder="Search files..."
                    className="w-full md:w-80 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    aria-label="Search files"
                />
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 mb-4 shadow-sm">
                    <div className="flex items-center gap-2">
                        <i className="fas fa-exclamation-triangle text-xl"></i>
                        <span>{error}</span>
                    </div>
                    <button
                        className="underline text-blue-700 font-semibold hover:text-blue-900 ml-0 sm:ml-2"
                        onClick={handleRetry}
                    >
                        Retry
                    </button>
                </div>
            )}

            {/* File List */}
            <div className="space-y-3">
                {filteredFiles.length === 0 && !loading && (
                    <div className="text-center text-gray-500 py-12">
                        <i className="fas fa-folder-open text-4xl mb-2"></i>
                        <div>No files found.</div>
                    </div>
                )}
                {filteredFiles.map((file) => (
                    <div key={file.id} className="bg-white border border-gray-200 rounded-lg p-4 flex items-center justify-between hover:border-gray-300 transition-colors">
                        <div className="flex items-center gap-3">
                            <i className="fas fa-file-pdf text-2xl text-red-500"></i>
                            <div>
                                <h3 className="font-semibold text-gray-900 truncate max-w-md">{file.name}</h3>
                                {processingHistory[file.id] && processingHistory[file.id].length > 0 && (
                                    <p className="text-xs text-gray-500 mt-1">
                                        Also Processed by: {processingHistory[file.id].join(', ')}
                                    </p>
                                )}
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => handleFileSelect(file)}
                                className={`px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition ${selectedFile?.id === file.id ? 'ring-2 ring-blue-400' : ''}`}
                                title="View PDF"
                            >
                                <i className="fas fa-eye"></i>
                            </button>
                            
                            <button
                                onClick={() => {
                                    if (processedFileIds.includes(file.id) || processedFileIds.includes((file as any).queryId)) {
                                        // If quote is generated, navigate to Final Pricing Details tab
                                        if (hasQuoteGenerated(file)) {
                                            handleGenerateQuote(file);
                                        } else {
                                            // For processed files without final pricing, navigate to quote generation
                                            handleGenerateQuote(file);
                                        }
                                    } else {
                                        handleProcessPdf(file);
                                    }
                                }}
                                className={`px-3 py-2 text-white rounded-lg transition ${
                                    processedFileIds.includes(file.id) || processedFileIds.includes((file as any).queryId) 
                                    ? (hasQuoteGenerated(file) 
                                        ? 'bg-purple-600 hover:bg-purple-700' 
                                        : 'bg-orange-600 hover:bg-orange-700') 
                                    : 'bg-green-600 hover:bg-green-700'
                                }`}
                                title={
                                    processedFileIds.includes(file.id) || processedFileIds.includes((file as any).queryId)
                                    ? (hasQuoteGenerated(file) ? 'View Final Pricing Details' : 'Generate Quote')
                                    : 'Process PDF to extract data'
                                }
                            >
                                {(() => {
                                    const isProcessed = processedFileIds.includes(file.id) || processedFileIds.includes((file as any).queryId);
                                    if (!isProcessed) {
                                        return <i className="fas fa-play"></i>;
                                    } else if (hasQuoteGenerated(file)) {
                                        return <i className="fas fa-file-alt"></i>;
                                    } else {
                                        return <i className="fas fa-calculator"></i>;
                                    }
                                })()}
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Loading Spinner */}
            {loading && (
                <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-opacity-30"></div>
                </div>
            )}

            {/* PDF Viewer Modal */}
            {viewingFile && !isProcessingPdf && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-2 sm:p-6 overflow-auto">
                    <div className="w-full max-w-4xl mx-auto">
                        <PDFViewer
                            fileUrl={viewingFile.id}
                            onClose={() => setViewingFile(null)}
                            onExtract={handleExtractData}
                            isExtracting={extracting}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default FileList;