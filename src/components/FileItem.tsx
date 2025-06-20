import React from 'react';

interface File {
    id: string;
    name: string;
    size: number;
    lastModified: string;
    type: string;
}

interface FileItemProps {
    file: File;
    onSelect?: (file: File) => void;
    onProcess?: (file: File) => void;
    isSelected?: boolean;
    processed?: boolean;
}

const FileItem: React.FC<FileItemProps> = ({ file, onSelect, onProcess, isSelected, processed }) => {
    const handleClick = () => {
        if (onSelect) {
            onSelect(file);
        }
    };

    const handleProcess = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (onProcess) {
            onProcess(file);
        }
    };

    return (
        <div 
            className={`file-item group relative cursor-pointer border-2 transition-all duration-200 ${
                isSelected ? 'border-blue-500 ring-2 ring-blue-200 shadow-lg scale-[1.02]' : 'border-transparent hover:border-blue-300 hover:shadow-md'
            }`}
            onClick={handleClick}
            tabIndex={0}
            aria-label={`File: ${file.name}`}
            onKeyDown={e => { if (e.key === 'Enter') handleClick(); }}
        >
            <div className="flex items-center justify-between w-full">
                <div className="flex items-center flex-grow gap-4">
                    <div className="relative flex-shrink-0">
                        <i className="fas fa-file-pdf text-red-500 text-3xl mr-2"></i>
                    </div>
                    <div className="flex-grow min-w-0">
                        <h3 className="text-lg font-semibold text-gray-900 truncate">{file.name}</h3>
                    </div>
                </div>
                <div className="flex gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={handleClick}
                        className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                        tabIndex={-1}
                    >
                        <i className="fas fa-search"></i>
                        <span>View</span>
                    </button>
                    <button
                        onClick={handleProcess}
                        className={`px-3 py-1 rounded-lg flex items-center gap-1 shadow-sm focus:outline-none focus:ring-2 ${processed ? 'bg-gray-400 text-white cursor-not-allowed' : 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-400'}`}
                        tabIndex={-1}
                        disabled={processed}
                    >
                        <i className="fas fa-cog"></i>
                        <span>{processed ? 'Processed' : 'Process'}</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FileItem;