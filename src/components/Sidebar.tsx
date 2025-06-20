import React from 'react';

interface SidebarProps {
  selected: string;
  onSelect: (key: string) => void;
  extractTab?: string;
  onExtractTabSelect?: (tab: string) => void;
  userRole?: string;
}

const sidebarItems = [
  { key: 'files', label: 'Files', icon: 'fas fa-file-alt' },
  { key: 'extract', label: 'Processed Data', icon: 'fas fa-file-import',
    subTabs: [
      { key: 'original-markdown', label: 'Original', icon: 'fa-file-code' },
      { key: 'final-markdown', label: 'Translated', icon: 'fa-file-alt' },
      { key: 'summary', label: 'Gen AI Response', icon: 'fa-clipboard-list' },
      { key: 'customer', label: 'Customer Info', icon: 'fa-user' },
      { key: 'pricing', label: 'Pricing', icon: 'fa-calculator' },
      
    ]
  },
];

const Sidebar: React.FC<SidebarProps> = ({ selected, onSelect, extractTab, onExtractTabSelect, userRole }) => (  <aside className="h-screen w-64 bg-gradient-to-b from-blue-100 via-blue-200 to-purple-100 text-blue-900 flex flex-col shadow-xl fixed top-0 left-0 z-30">    {/* Logo at the very top */}
    <div style={{ background: 'linear-gradient(71deg, rgba(251, 78, 89, 1) 0%, rgba(24, 0, 58, 1) 100%)' }}>
    <div className="flex items-center justify-center px-4 pt-6 pb-2">
      <div className="p-1 rounded">
        <img src="/logo-01-300.png" alt="JBS Logo" className="h-12 w-auto" />
      </div>
    </div>
    </div>
    {/* AccelQuote branding and animated icon below logo */}
    <div className="flex items-center gap-4 px-4 pb-6 bg-gradient-to-r from-white via-blue-100 to-purple-100 rounded-b-2xl shadow-lg">
      <div>
        <h1 className="text-2xl font-extrabold bg-gradient-to-r from-blue-700 to-purple-600 bg-clip-text text-transparent tracking-tight">
          AccelQuote AGX™
        </h1>
        <p className="text-xs text-gray-500 font-medium">Agentic Gen AI eXperience</p>
      </div>
      <div className="relative flex items-center justify-center">
        <span className="block rounded-full bg-gradient-to-tr from-purple-400 via-blue-400 to-blue-600 p-2 shadow-xl">
          <svg width="32" height="32" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="animate-spin-slow">
            <ellipse cx="24" cy="24" rx="20" ry="16" fill="#ede9fe" />
            <path d="M16 24c0-4.418 3.582-8 8-8s8 3.582 8 8-3.582 8-8 8" stroke="#7c3aed" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="24" cy="24" r="3" fill="#6366f1" className="animate-pulse"/>
          </svg>
        </span>
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce-slow" style={{ animationDelay: '0.1s' }}></span>
        <span className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce-slow" style={{ animationDelay: '0.3s' }}></span>
        <span className="absolute top-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-purple-300 rounded-full animate-bounce-slow" style={{ animationDelay: '0.5s' }}></span>
        <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-blue-300 rounded-full animate-bounce-slow" style={{ animationDelay: '0.7s' }}></span>
      </div>
    </div>
    <nav className="flex-1 py-6 flex flex-col gap-2">
      {sidebarItems.map(item => {
        // Disable 'Processed Data' button if there is no processed data
        let isProcessedDataButton = item.key === 'extract';
        let disableProcessedData = false;
        if (isProcessedDataButton) {
          // Check if there is any processed data for the current user
          let processedFileIds = [];
          try {
            const user = JSON.parse(localStorage.getItem('current_user') || '{}');
            if (user && user.username) {
              const records = JSON.parse(localStorage.getItem('user_extraction_results_v1') || '[]');
              processedFileIds = (records as Array<{username: string}>).filter((r: {username: string}) => r.username === user.username);
            }
          } catch {}
          disableProcessedData = processedFileIds.length === 0;
        }
        return (
          <React.Fragment key={item.key}>
            <button
              className={`flex items-center gap-3 px-6 py-3 text-lg rounded-lg transition font-medium hover:bg-blue-200 focus:outline-none ${selected === item.key ? 'bg-gradient-to-r from-blue-200 to-purple-200 shadow-md text-blue-900' : 'bg-transparent'} ${isProcessedDataButton && disableProcessedData ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={() => {
                if (isProcessedDataButton && disableProcessedData) return;
                onSelect(item.key);
              }}
              disabled={isProcessedDataButton && disableProcessedData}
            >
              <i className={item.icon}></i>
              {item.label}
            </button>
            {item.key === 'extract' && selected === 'extract' && item.subTabs && (
              <div className="ml-8 flex flex-col gap-1 mt-2">
                {item.subTabs.map(sub => (
                  <button
                    key={sub.key}
                    className={`flex items-center gap-2 px-3 py-2 text-base rounded-lg transition font-medium hover:bg-blue-100 focus:outline-none ${extractTab === sub.key ? 'bg-gradient-to-r from-blue-100 to-purple-100 shadow text-blue-900' : 'bg-transparent'}`}
                    onClick={() => onExtractTabSelect && onExtractTabSelect(sub.key)}
                  >
                    <i className={`fas ${sub.icon}`}></i>
                    {sub.label}
                  </button>
                ))}
              </div>
            )}
          </React.Fragment>
        );
      })}
    </nav>
    {/* Profile section */}
    <div className="flex items-center gap-3 px-4 py-2 border-b border-blue-200 bg-white/80 relative">
      <div className="rounded-full bg-blue-200 text-blue-800 font-bold flex items-center justify-center w-9 h-9 text-lg">
        {(() => {
          const user = JSON.parse(localStorage.getItem('current_user') || '{}');
          if (user && user.username) return user.username[0]?.toUpperCase() || '?';
          return '?';
        })()}
        </div>      <div className="flex flex-col flex-1 min-w-0">
        <span className="font-semibold text-blue-900 text-base truncate">{(() => {
          const user = JSON.parse(localStorage.getItem('current_user') || '{}');
          return user && user.username ? user.username : 'Unknown User';
        })()}</span>
         <span className="text-xs text-gray-500">{(() => {
          const user = JSON.parse(localStorage.getItem('current_user') || '{}');
          return user && user.role ? user.role : 'Profile';
        })()}</span>
      </div>
      <button
        className="ml-auto p-2 rounded-full hover:bg-blue-100 transition-colors flex items-center justify-center"
        title="Logout"
        style={{ minWidth: 32, minHeight: 32 }}
        onClick={() => {
          // Logout: clear user and reload
          localStorage.removeItem('current_user');
          window.location.reload();
        }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" width="22" height="22">
          <path d="M16 17L21 12M21 12L16 7M21 12H9" stroke="#1e293b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M12 19C10.8954 19 10 18.1046 10 17V15M12 5C10.8954 5 10 5.89543 10 7V9" stroke="#1e293b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <rect x="3" y="3" width="12" height="18" rx="2" stroke="#1e293b" strokeWidth="2"/>
        </svg>
      </button>
    </div>
  </aside>
);

export default Sidebar;
