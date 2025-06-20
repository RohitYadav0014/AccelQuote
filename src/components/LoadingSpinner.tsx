import React from 'react';

interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'md', className = '' }) => {
    const sizeClasses = {
        sm: 'h-4 w-4',
        md: 'h-8 w-8',
        lg: 'h-12 w-12'
    };

    return (
        <div className={`inline-block ${sizeClasses[size]} ${className}`}>
            <div className="w-full h-full border-4 border-blue-200 rounded-full border-t-blue-600 animate-spin"></div>
        </div>
    );
};

export default LoadingSpinner;
