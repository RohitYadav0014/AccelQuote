import React, { useState, useEffect } from 'react';
import FileList from './components/FileList';
import { Toaster } from 'react-hot-toast';
import './index.css';
import LoginPage from './components/LoginPage';
import Sidebar from './components/Sidebar';
import ExtractionResults from './components/ExtractionResults';

const App: React.FC = () => {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [isMobile, setIsMobile] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isProcessingPdf, setIsProcessingPdf] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState<{ username: string; role: string } | null>(null);
    const [selectedScreen, setSelectedScreen] = useState<'files' | 'extract'>('files');
    const [extractionResult, setExtractionResult] = useState<any>(null);
    const [extractedFileName, setExtractedFileName] = useState<string | undefined>(undefined);
    const [extractTab, setExtractTab] = useState<'summary' | 'customer' | 'pricing' | 'original-markdown' | 'final-markdown'>('summary');

    useEffect(() => {
        const checkMobile = () => {
            const isMobileView = window.innerWidth < 1024;
            setIsMobile(isMobileView);
            if (!isMobileView) setSidebarOpen(true);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Check for existing user session on component mount
    useEffect(() => {
        const savedUser = localStorage.getItem('current_user');
        if (savedUser) {
            try {
                const userData = JSON.parse(savedUser);
                if (userData && userData.username) {
                    setUser(userData);
                    setIsLoggedIn(true);
                }
            } catch (error) {
                console.error('Error parsing saved user data:', error);
                localStorage.removeItem('current_user');
            }
        }
    }, []);

    if (!user) {
        return <LoginPage onLogin={(username, role) => {
            setUser({ username, role });
            setIsLoggedIn(true);
            localStorage.setItem('current_user', JSON.stringify({ username, role }));
        }} />;
    }

    return (
        <div className="h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-blue-100 flex flex-col overflow-hidden">
            <Toaster
                position="top-right"
                toastOptions={{
                    duration: 3000,
                    style: {
                        background: '#232946',
                        color: '#fff',
                        fontSize: '1rem',
                        borderRadius: '0.75rem',
                        boxShadow: '0 4px 24px 0 rgba(44,62,80,0.10)',
                    },
                    success: { iconTheme: { primary: '#10B981', secondary: '#fff' } },
                    error: { iconTheme: { primary: '#EF4444', secondary: '#fff' } },
                }}
            />

            {/* Global PDF processing indicator */}
            {isProcessingPdf && (
                <div className="w-full bg-gradient-to-r from-blue-100 via-purple-100 to-blue-100 text-blue-900 flex flex-col items-center gap-3 px-4 py-8 justify-center shadow-lg z-30 animate-fade-in relative" style={{ minHeight: '140px' }}>
                    {/* Animated AI Brain Icon */}
                    <div className="relative flex items-center justify-center mb-2">
                        <span className="block animate-glow rounded-full bg-gradient-to-tr from-purple-400 via-blue-400 to-blue-600 p-4 shadow-xl">
                            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="animate-spin-slow">
                                <ellipse cx="24" cy="24" rx="20" ry="16" fill="#ede9fe" />
                                <path d="M16 24c0-4.418 3.582-8 8-8s8 3.582 8 8-3.582 8-8 8" stroke="#7c3aed" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                                <circle cx="24" cy="24" r="3" fill="#6366f1" className="animate-pulse"/>
                            </svg>
                        </span>
                        {/* Animated dots around brain */}
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-purple-400 rounded-full animate-bounce-slow" style={{ animationDelay: '0.1s' }}></span>
                        <span className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-blue-400 rounded-full animate-bounce-slow" style={{ animationDelay: '0.3s' }}></span>
                        <span className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 bg-purple-300 rounded-full animate-bounce-slow" style={{ animationDelay: '0.5s' }}></span>
                        <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2 h-2 bg-blue-300 rounded-full animate-bounce-slow" style={{ animationDelay: '0.7s' }}></span>
                    </div>
                    <div className="flex flex-col items-center">
                        <span className="font-extrabold text-xl tracking-wide animate-pulse text-blue-900 mb-1">AI is Processing...</span>
                        <span className="font-medium text-base tracking-wide animate-fade-in-slow text-purple-700">Analyzing your PDF with advanced Gen AI</span>
                    </div>
                    {/* Animated progress bar */}
                    <div className="w-full max-w-xs mt-4">
                        <div className="h-2 bg-blue-200 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-blue-500 via-purple-400 to-blue-400 animate-progress-bar"></div>
                        </div>
                    </div>
                    <div className="text-xs text-gray-600 mt-3 italic animate-fade-in-slow">This may take a few moments as our AI reads, understands, and extracts data from your document.</div>
                </div>
            )}

            {/* Main Content */}
            <div className="flex flex-1 h-full overflow-hidden">
                <Sidebar
                    selected={selectedScreen}
                    onSelect={(key) => {
                        if (key === 'logout') {
                            setIsLoggedIn(false);
                            setUser(null);
                            setExtractionResult(null);
                            setExtractedFileName(undefined);
                            localStorage.removeItem('current_user');
                        } else {
                            setSelectedScreen(key as 'files' | 'extract');
                        }
                    }}
                    extractTab={extractTab}
                    onExtractTabSelect={(tab) => {
                        setExtractTab(tab as 'summary' | 'customer' | 'pricing' | 'original-markdown' | 'final-markdown');
                        setSelectedScreen('extract');
                    }}
                    userRole={user.role}
                />                <main className="flex-1 bg-gray-50 ml-64 p-6 overflow-y-auto h-full">
                    {selectedScreen === 'files' && (
                        <FileList
                            isProcessingPdf={isProcessingPdf}
                            setIsProcessingPdf={setIsProcessingPdf}
                            onExtractionResult={(data, fileName) => {
                                setExtractionResult(data);
                                setExtractedFileName(fileName);
                                // Check if this is quote mode and navigate to pricing tab
                                if (data && data._isQuoteMode) {
                                    setSelectedScreen('extract');
                                    setExtractTab('pricing');
                                } else {
                                    setSelectedScreen('extract');
                                    setExtractTab('summary');
                                }
                            }}
                        />
                    )}
                    {selectedScreen === 'extract' && extractionResult && (
                        <ExtractionResults
                            data={extractionResult}
                            fileName={extractedFileName}
                            onDownload={() => {}}
                            activeTab={extractTab}
                            onTabChange={setExtractTab as (tab: 'summary' | 'customer' | 'pricing' | 'original-markdown' | 'final-markdown') => void}
                        />
                    )}
                </main>
            </div>
        </div>
    );
};

export default App;

/* Add to index.css or a global CSS file:
.animate-progress-bar {
  width: 100%;
  animation: progressBar 2s linear infinite;
}
@keyframes progressBar {
  0% { width: 0%; }
  100% { width: 100%; }
}
.animate-fade-in {
  animation: fadeIn 0.7s;
}
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
.animate-fade-in-slow {
  animation: fadeIn 1.5s;
}
.animate-glow {
  animation: glow 1.5s infinite alternate;
}
@keyframes glow {
  from {
    box-shadow: 0 0 5px rgba(156, 163, 175, 0.6), 0 0 10px rgba(156, 163, 175, 0.4);
  }
  to {
    box-shadow: 0 0 10px rgba(156, 163, 175, 0.8), 0 0 20px rgba(156, 163, 175, 0.6);
  }
}
.animate-bounce-slow {
  animation: bounce 1.5s infinite;
}
@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-8px);
  }
}
.animate-spin-slow {
  animation: spin 2s linear infinite;
}
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
*/
