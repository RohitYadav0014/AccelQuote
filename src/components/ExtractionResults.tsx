import React, { useState, useEffect } from 'react';
import PricingResults from './PricingResults';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import toast from 'react-hot-toast';

interface ExtractionResultsProps {
    data: any;
    onDownload: () => void;
    fileName?: string;
    activeTab?: 'summary' | 'customer' | 'pricing' | 'original-markdown' | 'final-markdown';
    onTabChange?: (tab: 'summary' | 'customer' | 'pricing' | 'original-markdown' | 'final-markdown') => void;
}

const ExtractionResults: React.FC<ExtractionResultsProps> = ({ data, onDownload, fileName, activeTab, onTabChange }) => {
    const [showRawData, setShowRawData] = useState(true); // default to true
    const [internalTab, setInternalTab] = useState<'summary' | 'customer' | 'pricing' | 'original-markdown' | 'final-markdown'>('summary');
    const currentTab = activeTab || internalTab;
    const setActiveTab = (tab: 'summary' | 'customer' | 'pricing' | 'original-markdown' | 'final-markdown') => {
        if (onTabChange) onTabChange(tab);
        else setInternalTab(tab);
    };

    // Reset tab and raw data view when new data is loaded
    useEffect(() => {
        // If it's quote mode, go directly to pricing tab
        if (data && data._isQuoteMode) {
            setActiveTab('pricing');
        } else {
            setActiveTab('original-markdown');
        }
        setShowRawData(true); // default to true on new data
    }, [data]);

    if (!data) return null;

    // Helper to extract and clean markdown string from code block
    const getMarkdownText = () => {
        let md = data.final_markdown_text || data.markdown_text || '';
        // Remove any code block wrappers (```markdown, ```json, or ```
        md = md.replace(/^```(?:markdown|json)?[\r\n]*/i, '').replace(/```$/i, '').trim();
        // Remove duplicate table headers
        md = md.replace(/\n{2,}/g, '\n\n'); // Normalize blank lines
        md = md.replace(/(\|[\s\S]+?\|)\n\|[-| ]+\|\n(?=\|[\s\S]+?\|\n\|[-| ]+\|)/g, '');
        // Ensure a professional title at the top
        if (!/^# /m.test(md)) {
            md = `# Extraction Results\n\n${md}`;
        }
        // Add a summary section if not present
        if (!/^## Summary/m.test(md) && data.summary) {
            md = md.replace(/^# .+$/m, (match: string) => `${match}\n\n## Summary\n${data.summary}\n`);
        }
        // Trim leading/trailing whitespace
        md = md.trim();
        return md;
    };

    // Helper to get the original markdown (unprocessed)
    const getOriginalMarkdown = () => {
        return data.markdown_text || data.final_markdown_text || '';
    };

    // Copy markdown to clipboard (always copy the cleaned markdown)
    const handleCopyMarkdown = () => {
        const markdown = getMarkdownText();
        if (markdown) {
            navigator.clipboard.writeText(markdown)
                .then(() => {
                    toast.success('Markdown copied to clipboard!');
                })
                .catch(() => {
                    toast.error('Failed to copy to clipboard');
                });
        }
    };    const renderCustomerInfo = () => {
        // Defensive: parse and normalize customer_information from extractionData
        let customerInfo = data.customer_information;
        let geography = data.geography;
        
        try {
            if (typeof customerInfo === 'string') {
                customerInfo = JSON.parse(customerInfo.replace(/^```json|```$/g, '').trim());
            }
        } catch {}
        
        try {
            if (typeof geography === 'string') {
                geography = JSON.parse(geography.replace(/^```json|```$/g, '').trim());
            }
        } catch {}
        
        if (!customerInfo) return null;

        // Function to get proper label for customer info fields
        const getCustomerFieldLabel = (fieldName: string): string => {
            const labelMap: Record<string, string> = {
                customer_name: 'Name',
                customer_email: 'Email',
                customer_company: 'Company',
                delivery_location: 'Delivery Location',
                email: 'Email',
                phone: 'Phone',
                organization: 'Company',
                website: 'Website',
                address: 'Address',
                geography: 'Geography'
            };
            return labelMap[fieldName] || fieldName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        };

        // Enhanced customer info with geography
        const enhancedCustomerInfo = { ...customerInfo };
        if (geography?.geography) {
            enhancedCustomerInfo.geography = geography.geography;
        }        return (
            <div className="p-4 border border-gray-200 rounded-lg">
                <h3 className="text-lg font-semibold mb-4 text-gray-900">Customer Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {Object.entries(enhancedCustomerInfo).map(([key, value]: [string, any]) => (
                        <div key={key} className="py-2">
                            <span className="text-gray-600 font-medium">{getCustomerFieldLabel(key)}: </span>
                            <span className="text-gray-900">{String(value)}</span>
                        </div>
                    ))}
                </div>
            </div>
        );
    };    return (
        <div className="space-y-6 h-full overflow-hidden flex flex-col">
            {/* Header */}
            <div className="border-b pb-4 flex-shrink-0">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {data && data._isQuoteMode ? 'Quote Generation' : 'Processed Data'}
                </h2>
                <p className="text-gray-600">
                    {data && data._isQuoteMode 
                        ? 'Generate final quote with pricing and discounts' 
                        : 'View and manage processed PDF data'
                    }
                </p>
                {fileName && (
                    <p className="text-sm text-gray-500 mt-1">
                        <span className="font-medium">File:</span> {fileName}
                    </p>
                )}
                
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden">
                {currentTab === 'summary' && showRawData && (
                    <div className="bg-gray-50 p-4 rounded-lg overflow-auto h-full border border-gray-200">
                        <pre className="whitespace-pre-wrap font-mono text-sm">{JSON.stringify(data, null, 2)}</pre>
                    </div>
                )}
                {currentTab === 'customer' && (
                    <div className="h-full overflow-y-auto">
                        {renderCustomerInfo()}
                    </div>
                )}                {currentTab === 'pricing' && (
                    <div className="h-full overflow-y-auto">
                        <PricingResults extractionData={data} fileName={fileName} userRole={JSON.parse(localStorage.getItem('current_user') || '{}')?.role} />
                    </div>
                )}
                {currentTab === 'original-markdown' && (
                    <div className="p-4 border border-gray-200 rounded-lg prose max-w-none h-full overflow-y-auto">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{getOriginalMarkdown()}</ReactMarkdown>
                    </div>
                )}
                {currentTab === 'final-markdown' && (
                    <div className="p-4 border border-gray-200 rounded-lg prose max-w-none h-full overflow-y-auto">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{getMarkdownText()}</ReactMarkdown>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ExtractionResults;
