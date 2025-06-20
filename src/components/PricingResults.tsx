import React, { useState, useEffect } from 'react';
import { computePricing, getItemsPricing, getCnpDiscount } from '../services/api';
import { saveItemPrices, getItemPrices, saveCnpDiscount, getCnpDiscountData, saveFinalPricing, getFinalPricing, saveAppliedDiscounts, getAppliedDiscounts } from '../services/userExtractionStore';
import LoadingSpinner from './LoadingSpinner';
import toast from 'react-hot-toast';
import { Tabs, Tab, TabList, TabPanel } from 'react-tabs';
import InvoiceDownload from './InvoiceDownload';

interface PricingResultsProps {
    extractionData: any;
    onDownloadQuote?: (finalPricing: any) => void;
    fileName?: string;
    userRole?: string;
}

type Currency = 'USD' | 'EUR' | 'UKP';

const PricingResults: React.FC<PricingResultsProps> = ({ extractionData, onDownloadQuote, fileName, userRole }) => {
    const [itemPrices, setItemPrices] = useState<any>(null);
    const [discountInfo, setDiscountInfo] = useState<any>(null);
    const [finalPricing, setFinalPricing] = useState<any>(null);
    const [loading, setLoading] = useState<string | null>(null);
    const [selectedCurrency, setSelectedCurrency] = useState<Currency>('USD');
    const [discountRole, setDiscountRole] = useState<'Sales Engineer' | 'Sales Director'>('Sales Engineer');    const [activeTabIndex, setActiveTabIndex] = useState(0);    const [showQuotePreview, setShowQuotePreview] = useState(false);
    const [quotePreviewData, setQuotePreviewData] = useState<any>([]);
    const [showEmailModal, setShowEmailModal] = useState(false);
    const [emailAddress, setEmailAddress] = useState('');
    const [isEditingFinalDiscounts, setIsEditingFinalDiscounts] = useState(false);
    const [editedFinalDiscounts, setEditedFinalDiscounts] = useState<Record<string, number>>({});
    const [appliedDiscounts, setAppliedDiscounts] = useState<Record<string, { salesEngineer: number; salesDirector?: number }>>({});    // Reset all state when extractionData changes (new PDF processed)
    React.useEffect(() => {
        setItemPrices(null);
        setDiscountInfo(null);
        setFinalPricing(null);
        setLoading(null);          setSelectedCurrency('USD');
        setDiscountRole('Sales Engineer');
        setShowEmailModal(false);
        setEmailAddress('');
        setIsEditingFinalDiscounts(false);
        setEditedFinalDiscounts({});
        // Check if in quote mode and navigate to Final Pricing Details tab
        if (extractionData && extractionData._isQuoteMode) {
            setActiveTabIndex(2); // Final Pricing Details tab        } else {
            setActiveTabIndex(0); // Default to first tab
        }
        setIsEditingFinalDiscounts(false);
        setEditedFinalDiscounts({});
    }, [extractionData]);// Parse geography and customer info if present
    let geography = extractionData?.geography;
    let customerInfo = extractionData?.customer_information;
    try {
        if (typeof geography === 'string') {
            geography = JSON.parse(geography.replace(/^```json|```$/g, '').trim());
        }
    } catch {}
    try {
        if (typeof customerInfo === 'string') {
            customerInfo = JSON.parse(customerInfo.replace(/^```json|```$/g, '').trim());
        }
    } catch {}

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
            address: 'Address'
        };
        return labelMap[fieldName] || fieldName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    };

    // Enhanced customer info with geography
    const getEnhancedCustomerInfo = () => {
        if (!customerInfo) return null;
        
        const enhanced = { ...customerInfo };
        
        // Add geography if available
        if (geography?.geography) {
            enhanced.geography = geography.geography;
        }
        
        return enhanced;
    };

    // Set default currency based on geography
    React.useEffect(() => {
        if (geography?.geography) {
            if (geography.geography.toLowerCase().includes('europe')) setSelectedCurrency('EUR');
            else if (geography.geography.toLowerCase().includes('uk')) setSelectedCurrency('UKP');
            else setSelectedCurrency('USD');
        }
    }, [extractionData]);    // Function to get relevant CNP factor based on geography
    const getRelevantCnpFactor = (info: any) => {
        // Determine currency based on geography
        let currencyToShow = 'USD';
        if (geography?.geography) {
            if (geography.geography.toLowerCase().includes('europe')) currencyToShow = 'EUR';
            else if (geography.geography.toLowerCase().includes('uk')) currencyToShow = 'UKP';
        }

        // Return only the relevant CNP factor
        switch (currencyToShow) {
            case 'EUR': return { label: 'EUR', value: info['CNP FACTOR EURO'], key: 'CNP FACTOR EURO' };
            case 'UKP': return { label: 'GBP', value: info['CNP FACTOR UKP'], key: 'CNP FACTOR UKP' };
            default: return { label: 'USD', value: info['CNP FACTOR USD'], key: 'CNP FACTOR USD' };
        }
    };    // Function to get items associated with a manufacturer (with duplicate removal)
    const getItemsForManufacturer = (manufacturer: string) => {
        if (!extractionData.items_information) return [];
        
        const items = Array.isArray(extractionData.items_information)
            ? extractionData.items_information
            : (typeof extractionData.items_information === 'string'
                ? (() => {
                    let str = extractionData.items_information.trim();
                    str = str.replace(/^```(?:json)?[\r\n]*/i, '').replace(/```$/i, '').trim();
                    try {
                        return JSON.parse(str);
                    } catch {
                        return [];
                    }
                })()
                : [extractionData.items_information]);
        
        const filteredItems = items.filter((item: any) => item.Manufacturer === manufacturer);
        
        // Remove duplicates based on Item ID and Item Description
        const uniqueItems = filteredItems.reduce((acc: any[], current: any) => {
            const existingItem = acc.find(item => 
                item["Item ID"] === current["Item ID"] && 
                item["Item Description"] === current["Item Description"]
            );
            if (!existingItem) {
                acc.push(current);
            }
            return acc;        }, []);
        
        return uniqueItems;
    };

    // Function to consolidate discount information by grouping by manufacturer
    const getConsolidatedDiscountInfo = (discountData: any[]) => {
        if (!discountData) return [];
        
        // Create a map to group by manufacturer
        const manufacturerMap = new Map();
        
        discountData.forEach((discount: any) => {
            const manufacturer = discount.Manufacturer;
            if (!manufacturerMap.has(manufacturer)) {
                manufacturerMap.set(manufacturer, discount);
            }
        });
        
        // Return unique manufacturers
        return Array.from(manufacturerMap.values());
    };

    const getCnpFactorKey = (currency: Currency) => {
        switch (currency) {
            case 'EUR': return 'CNP FACTOR EURO';
            case 'UKP': return 'CNP FACTOR UKP';
            default: return 'CNP FACTOR USD';
        }
    };const user = JSON.parse(localStorage.getItem('current_user') || '{}');
    const fileId = fileName || extractionData?.fileId || '';    // Check if current user can edit discount (both Sales Engineer and Sales Director can edit)
    const canEditDiscount = userRole === 'Sales Director' || user?.role === 'Sales Director' || 
                           userRole === 'Sales Engineer' || user?.role === 'Sales Engineer';    // Get max discount range based on user role and CNP discount response
    const getMaxDiscountRange = () => {
        if (!discountInfo || !Array.isArray(discountInfo) || discountInfo.length === 0) {
            // Fallback to hardcoded values if no discount info available
            if (userRole === 'Sales Director' || user?.role === 'Sales Director') {
                return 25;
            } else if (userRole === 'Sales Engineer' || user?.role === 'Sales Engineer') {
                return 5;
            }
            return 0;
        }

        // Get max discount from all manufacturers in the CNP discount response
        let maxDiscount = 0;
        discountInfo.forEach((discount: any) => {
            let currentDiscount = 0;
            if (userRole === 'Sales Director' || user?.role === 'Sales Director') {
                currentDiscount = discount['Discount Authorization Sales Director'] || 0;
            } else if (userRole === 'Sales Engineer' || user?.role === 'Sales Engineer') {
                currentDiscount = discount['Discount Authorization Sales Engineer'] || 0;
            }
            
            // Convert to number if it's a string and handle percentage format
            if (typeof currentDiscount === 'string') {
                currentDiscount = parseFloat(currentDiscount);
            }
            
            // If the value is greater than 1, assume it's already in percentage format
            if (typeof currentDiscount === 'number' && !isNaN(currentDiscount)) {
                if (currentDiscount > 1) {
                    // Value is already in percentage (e.g., 25 for 25%)
                    maxDiscount = Math.max(maxDiscount, currentDiscount);
                } else {
                    // Value is in decimal (e.g., 0.25 for 25%)
                    maxDiscount = Math.max(maxDiscount, currentDiscount * 100);
                }
            }
        });

        return maxDiscount > 0 ? maxDiscount : (
            // Fallback if no valid discount found
            userRole === 'Sales Director' || user?.role === 'Sales Director' ? 25 : 5
        );
    };// Removed unused edit functions for CNP & Discount Information tab    // Removed unused handleDiscountValueChange function - discount editing now happens in Final Pricing Details tab    // Function to handle final discount editing
    const handleFinalDiscountChange = (itemId: string, newDiscount: number) => {
        const maxRange = getMaxDiscountRangeForItem(itemId);
        if (newDiscount > maxRange) {
            newDiscount = maxRange;
            toast.error(`Check discount range`);
        }
        setEditedFinalDiscounts(prev => ({
            ...prev,
            [itemId]: newDiscount
        }));
    };const handleStartFinalDiscountEdit = () => {
        setIsEditingFinalDiscounts(true);
        // Initialize with current discount values, following approval workflow
        const currentDiscounts: Record<string, number> = {};
        if (discountInfo && extractionData.items_information) {
            const items = Array.isArray(extractionData.items_information) 
                ? extractionData.items_information 
                : [extractionData.items_information];
            
            items.forEach((item: any) => {
                const itemId = item["Item ID"];
                let currentDiscount = 0;
                
                // Follow the approval workflow
                const itemAppliedDiscount = appliedDiscounts[itemId];
                
                if (itemAppliedDiscount) {
                    if (discountRole === 'Sales Engineer') {
                        // SE edits their own discount
                        if (itemAppliedDiscount.salesEngineer !== undefined) {
                            currentDiscount = itemAppliedDiscount.salesEngineer;
                        }
                    } else if (discountRole === 'Sales Director') {
                        // SD can approve/override SE discount
                        if (itemAppliedDiscount.salesDirector !== undefined) {
                            // SD has already made a decision, edit that
                            currentDiscount = itemAppliedDiscount.salesDirector;
                        } else if (itemAppliedDiscount.salesEngineer !== undefined) {
                            // SD reviewing SE discount, start with SE value
                            currentDiscount = itemAppliedDiscount.salesEngineer;
                        }
                    }
                }
                  // If no applied discount found, default to 0 (not manufacturer default)
                // This ensures discounts start at 0 when not previously set
                
                currentDiscounts[itemId] = currentDiscount;
            });
        }
        setEditedFinalDiscounts(currentDiscounts);
    };

    const handleCancelFinalDiscountEdit = () => {
        setIsEditingFinalDiscounts(false);
        setEditedFinalDiscounts({});
    };    // Handler for sending quote via email (non-functional placeholder)
    const handleSendQuoteEmail = () => {
        if (!emailAddress.trim()) {
            toast.error('Please enter a valid email address');
            return;
        }
        
        // This is a placeholder function - email functionality would be implemented here
        toast.success(`Quote would be sent to: ${emailAddress} (Feature not implemented yet)`);
        setShowEmailModal(false);
        setEmailAddress('');
    };

    const handleSaveFinalDiscountEdit = () => {
        // Save applied discounts separately
        if (editedFinalDiscounts && user && user.username && fileId) {
            // Convert the edited discounts to the format expected by applied discounts
            const appliedDiscountsData: Record<string, { salesEngineer: number; salesDirector?: number }> = {};
            
            Object.entries(editedFinalDiscounts).forEach(([itemId, newDiscount]) => {
                const existingApplied = appliedDiscounts[itemId] || { salesEngineer: 0 };
                
                if (discountRole === 'Sales Engineer') {
                    // Sales Engineer sets their discount
                    appliedDiscountsData[itemId] = {
                        salesEngineer: newDiscount,
                        // Keep existing Sales Director approval/override if it exists
                        salesDirector: existingApplied.salesDirector
                    };
                } else if (discountRole === 'Sales Director') {
                    // Sales Director can approve (use SE discount) or override with their own
                    appliedDiscountsData[itemId] = {
                        salesEngineer: existingApplied.salesEngineer || 0, // Keep SE discount
                        salesDirector: newDiscount // SD's decision (approval or override)
                    };
                }
            });
            
            // Merge with existing applied discounts
            const updatedAppliedDiscounts = { ...appliedDiscounts, ...appliedDiscountsData };
            setAppliedDiscounts(updatedAppliedDiscounts);
            
            // Save to localStorage
            saveAppliedDiscounts(user.username, fileId, updatedAppliedDiscounts);
        }

        // Update the discount info with new values (keep existing functionality for backward compatibility)
        if (discountInfo && editedFinalDiscounts) {
            const newDiscountInfo = [...discountInfo];
            
            Object.entries(editedFinalDiscounts).forEach(([itemId, newDiscount]) => {
                // Find the item to get manufacturer
                const items = Array.isArray(extractionData.items_information) 
                    ? extractionData.items_information 
                    : [extractionData.items_information];
                const item = items.find((i: any) => i["Item ID"] === itemId);
                
                if (item) {
                    const discountIndex = newDiscountInfo.findIndex((d: any) => d["Manufacturer"] === item["Manufacturer"]);
                    if (discountIndex >= 0) {
                        if (discountRole === 'Sales Engineer') {
                            newDiscountInfo[discountIndex]['Discount Authorization Sales Engineer'] = newDiscount;
                        } else if (discountRole === 'Sales Director') {
                            newDiscountInfo[discountIndex]['Discount Authorization Sales Director'] = newDiscount;
                        }
                    }
                }
            });
            
            setDiscountInfo(newDiscountInfo);
            
            // Persist the updated discount info
            if (user && user.username && fileId) {
                saveCnpDiscount(user.username, fileId, newDiscountInfo);
            }
        }
        
        setIsEditingFinalDiscounts(false);
        setEditedFinalDiscounts({});
        
        // Clear final pricing to force recalculation
        setFinalPricing(null);
        if (user && user.username && fileId) {
            saveFinalPricing(user.username, fileId, null);
        }
        
        if (discountRole === 'Sales Engineer') {
            toast.success('Discounts applied and submitted for approval');
        } else {
            toast.success('Discounts approved/overridden successfully');
        }
    };// Load itemPrices, cnpDiscountInfo, finalPricing, and appliedDiscounts from storage if available
    useEffect(() => {
        if (user && user.username && fileId) {
            const storedPrices = getItemPrices(user.username, fileId);
            if (storedPrices) setItemPrices(storedPrices);            const storedCnp = getCnpDiscountData(user.username, fileId);
            if (storedCnp) {
                setDiscountInfo(storedCnp);
            }
            const storedFinal = getFinalPricing(user.username, fileId);
            if (storedFinal) setFinalPricing(storedFinal);
            
            const storedAppliedDiscounts = getAppliedDiscounts(user.username, fileId);
            if (storedAppliedDiscounts) setAppliedDiscounts(storedAppliedDiscounts);
        }
    }, [user, fileId]);

    // Set discountRole based on userRole prop (fix: run on mount and when userRole changes)
    useEffect(() => {
        if (userRole === 'Sales Director') setDiscountRole('Sales Director');
        else if (userRole === 'Sales Engineer') setDiscountRole('Sales Engineer');
        else if (user && user.role === 'Sales Director') setDiscountRole('Sales Director');
        else if (user && user.role === 'Sales Engineer') setDiscountRole('Sales Engineer');
    }, [userRole, user.role]);

    const handleGetPrices = async () => {
        let items = extractionData?.items_information;
        setLoading('prices');
        try {
            const itemsString = JSON.stringify(items);
            const result = await getItemsPricing(itemsString);
            let itemPriceDetails = result.message.item_price_details;
            if (typeof itemPriceDetails === 'string') {
                let str = itemPriceDetails.trim();
                str = str.replace(/^```(?:json)?[\r\n]*/i, '').replace(/```$/i, '').trim();
                try {
                    const parsed = JSON.parse(str);
                    itemPriceDetails = Array.isArray(parsed) ? parsed : [parsed];
                } catch (e) {
                    console.error('Error parsing item_price_details:', e);
                    itemPriceDetails = [];
                }
            }
            if (!itemPriceDetails || itemPriceDetails.length === 0) {
                toast.error('No item prices available.');
                setItemPrices(null);
                setLoading(null);
                return;
            }
            setItemPrices(itemPriceDetails);
            // Persist item prices
            if (user && user.username && fileId) {
                saveItemPrices(user.username, fileId, itemPriceDetails);
            }
            toast.success('Item prices retrieved successfully');
            setActiveTabIndex(0);
        } catch (error) {
            console.error('API Error details:', error);
            toast.error('Failed to retrieve item prices');
        } finally {
            setLoading(null);
        }
    };

    const handleGetDiscount = async () => {
        let items = extractionData?.items_information;
        setLoading('discount');
        try {
            const itemsString = JSON.stringify(items);
            const result = await getCnpDiscount(itemsString);
            let discountInfoData = result.message.cnp_discount_info;
            if (typeof discountInfoData === 'string') {
                let str = discountInfoData.trim();
                str = str.replace(/^```(?:json)?[\r\n]*/i, '').replace(/```$/i, '').trim();
                try {
                    const parsed = JSON.parse(str);
                    discountInfoData = Array.isArray(parsed) ? parsed : [parsed];
                } catch (e) {
                    console.error('Error parsing cnp_discount_info:', e);
                    discountInfoData = [];
                }
            }
            if (!discountInfoData || discountInfoData.length === 0) {
                toast.error('No discount information available.');
                setDiscountInfo(null);
                setLoading(null);
                return;            }            setDiscountInfo(discountInfoData);
            // Persist CNP discount info
            if (user && user.username && fileId) {
                saveCnpDiscount(user.username, fileId, discountInfoData);
                // Dispatch custom event to notify FileList component
                window.dispatchEvent(new CustomEvent('discount-data-updated'));
            }
            toast.success('Discount information retrieved successfully');
            setActiveTabIndex(1);
        } catch (error) {
            toast.error('Failed to retrieve discount information');
            console.error(error);
        } finally {
            setLoading(null);
        }
    };

    const handleComputePricing = async () => {
        if (!itemPrices || !discountInfo) {
            toast.error('Please get item prices and discount information first');
            return;
        }
        setLoading('pricing');
        try {
            let items = extractionData.items_information;
            if (typeof items === 'string') {
                let str = items.trim();
                str = str.replace(/^```(?:json)?[\r\n]*/i, '').replace(/```$/i, '').trim();
                try {
                    items = JSON.parse(str);
                } catch (e) {
                    items = [];
                }
            }
            const priceMap = new Map();
            itemPrices.forEach((p: any) => priceMap.set(p["Item ID"], p));
            const discountMap = new Map();
            discountInfo.forEach((d: any) => discountMap.set(d["Manufacturer"], d));
            const cnpKey = getCnpFactorKey(selectedCurrency);
            const discountKey = discountRole === 'Sales Engineer' ? 'Discount Authorization Sales Engineer' : 'Discount Authorization Sales Director';
            const completePricingInfo = items.map((item: any) => {
                const price = priceMap.get(item["Item ID"]);
                const discount = discountMap.get(item["Manufacturer"]);
                let glp = price && price["GlobalLP"];
                if (typeof glp === 'string') glp = parseFloat(glp.replace(/[^\d.]/g, ''));
                if (typeof glp !== 'number' || isNaN(glp)) glp = 0;
                let cnpFactor = discount && discount[cnpKey];
                if (typeof cnpFactor === 'string') cnpFactor = parseFloat(cnpFactor);
                if (typeof cnpFactor !== 'number' || isNaN(cnpFactor)) cnpFactor = 0;
                // Discount Factor (as decimal)
                let discountFactor = 0;
                if (discountRole === 'Sales Engineer') {
                    discountFactor = discount && discount['Discount Authorization Sales Engineer'];
                } else if (discountRole === 'Sales Director') {
                    discountFactor = discount && discount['Discount Authorization Sales Director'];
                }
                if (typeof discountFactor === 'string') discountFactor = parseFloat(discountFactor);
                if (discountFactor > 1) discountFactor = discountFactor / 100;
                if (typeof discountFactor !== 'number' || isNaN(discountFactor)) discountFactor = 0;
                const cnp = glp * cnpFactor;
                const cnpWithDiscount = cnp * (1 - discountFactor);
                const qty = item.Quantity || 1;
                return {
                    "Item ID": item["Item ID"],
                    "Item Description": item["Item Description"],
                    "Quantity": qty,
                    "Manufacturer": item["Manufacturer"],
                    "GlobalLP": glp,
                    [cnpKey]: cnpFactor,
                    [discountKey]: discountFactor,
                    "CNP_Price": cnp,
                    "CNP_with_discount": cnpWithDiscount
                };
            });
            if (!completePricingInfo || completePricingInfo.length === 0) {
                toast.error('No final pricing could be computed.');
                setFinalPricing(null);
                setLoading(null);
                return;
            }            setFinalPricing(completePricingInfo);
            // Persist final pricing
            if (user && user.username && fileId) {
                saveFinalPricing(user.username, fileId, completePricingInfo);
                // Dispatch custom event to notify FileList component
                window.dispatchEvent(new CustomEvent('final-pricing-updated'));
            }
            toast.success(`Final pricing computed successfully in ${selectedCurrency}`);
            setActiveTabIndex(2);
        } catch (error) {
            toast.error('Failed to compute final pricing');
            console.error(error);
        } finally {
            setLoading(null);
        }
    };    const renderPriceTable = (data: any) => {
        if (!data || !Array.isArray(data) || data.length === 0) return null;
        
        // Dynamically get columns from the first item
        const columns = Object.keys(data[0]);
        
        // Function to get user-friendly column names
        const getColumnDisplayName = (columnName: string): string => {
            const columnMap: Record<string, string> = {
                'GlobalLP': 'Global List Price',
                'Item ID': 'Item ID',
                'Item Description': 'Item Description',
                'Manufacturer': 'Manufacturer',
                'Quantity': 'Quantity'
            };
            
            return columnMap[columnName] || columnName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        };
        
        return (
            <div className="overflow-x-auto">
                <table className="min-w-full table-auto">
                    <thead>
                        <tr className="bg-gray-100">
                            {columns.map((col) => (
                                <th key={col} className="px-4 py-2">{getColumnDisplayName(col)}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((item: any, index: number) => (
                            <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                {columns.map((col) => (
                                    <td key={col} className="border px-4 py-2">{item[col]}</td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    // Fallback: show warning if extractionData or items_information is missing
    if (!extractionData || !extractionData.items_information) {
        return (
            <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-3 rounded mb-4">
                <strong className="font-bold">Warning: </strong>
                <span className="block sm:inline">No processed item information available. Please process data from a PDF first.</span>
            </div>
        );
    }

    // Helper function to check pending approvals
    const getPendingApprovalsCount = () => {
        if (!appliedDiscounts || discountRole !== 'Sales Director') return 0;
        
        let count = 0;
        Object.values(appliedDiscounts).forEach((discount: any) => {
            if (discount.salesEngineer !== undefined && discount.salesDirector === undefined) {
                count++;
            }
        });
        return count;
    };

    // Helper function to get workflow status for display
    const getWorkflowStatus = () => {
        if (!appliedDiscounts || Object.keys(appliedDiscounts).length === 0) {
            return null;
        }

        if (discountRole === 'Sales Director') {
            const pendingCount = getPendingApprovalsCount();
            if (pendingCount > 0) {
                return {
                    type: 'warning',
                    message: `${pendingCount} discount${pendingCount > 1 ? 's' : ''} pending your approval`
                };
            }
        }

        return null;
    };

    // Get max discount range for a specific item/manufacturer
    const getMaxDiscountRangeForItem = (itemId: string) => {
        if (!discountInfo || !extractionData.items_information) {
            return getMaxDiscountRange();
        }

        // Find the item to get its manufacturer
        const items = Array.isArray(extractionData.items_information) 
            ? extractionData.items_information 
            : [extractionData.items_information];
        const item = items.find((i: any) => i["Item ID"] === itemId);
        
        if (!item) {
            return getMaxDiscountRange();
        }

        // Find the discount info for this manufacturer
        const manufacturerDiscount = discountInfo.find((d: any) => d["Manufacturer"] === item["Manufacturer"]);
        
        if (!manufacturerDiscount) {
            return getMaxDiscountRange();
        }

        let maxDiscount = 0;
        if (userRole === 'Sales Director' || user?.role === 'Sales Director') {
            maxDiscount = manufacturerDiscount['Discount Authorization Sales Director'] || 0;
        } else if (userRole === 'Sales Engineer' || user?.role === 'Sales Engineer') {
            maxDiscount = manufacturerDiscount['Discount Authorization Sales Engineer'] || 0;
        }

        // Convert to number if it's a string and handle percentage format
        if (typeof maxDiscount === 'string') {
            maxDiscount = parseFloat(maxDiscount);
        }
        
        if (typeof maxDiscount === 'number' && !isNaN(maxDiscount)) {
            if (maxDiscount > 1) {
                return maxDiscount; // Already in percentage
            } else {
                return maxDiscount * 100; // Convert from decimal
            }
        }

        return getMaxDiscountRange(); // Fallback to general max
    };

    return (
        <div className="space-y-6 h-full overflow-y-auto">

            
            {/* Progress Steps */}
            <div className="mb-8">
                <div className="flex items-center justify-center">
                    <div className="flex items-center w-full max-w-3xl">
                        {[
                            { id: 'prices', label: 'Get Prices', icon: 'fa-tags', state: itemPrices ? 'complete' : loading === 'prices' ? 'current' : 'pending' },
                            { id: 'discount', label: 'Get Discount', icon: 'fa-percentage', state: discountInfo ? 'complete' : loading === 'discount' ? 'current' : 'pending' },
                            { id: 'pricing', label: 'Final Pricing', icon: 'fa-calculator', state: finalPricing ? 'complete' : loading === 'pricing' ? 'current' : 'pending' }
                        ].map((step, index) => (
                            <React.Fragment key={step.id}>
                                <div className="relative flex flex-col items-center flex-1">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                        step.state === 'complete' ? 'bg-green-500' :
                                        step.state === 'current' ? 'bg-blue-500' :
                                        'bg-gray-200'
                                    } text-white`}>
                                        <i className={`fas ${step.icon}`}></i>
                                    </div>
                                    <div className="mt-2 text-sm font-medium text-gray-600">{step.label}</div>
                                    {index < 2 && (
                                        <div className={`absolute left-1/2 top-5 h-0.5 w-full ${
                                            step.state === 'complete' ? 'bg-green-500' : 'bg-gray-200'
                                        }`}></div>
                                    )}
                                </div>
                            </React.Fragment>
                        ))}
                    </div>
                </div>
            </div>

            {/* Action Buttons - each in its own section */}
            {/* 1. Get Items Info */}
            {!itemPrices && (
                <div className="flex justify-center mb-6">
                    <button
                        onClick={handleGetPrices}
                        disabled={loading !== null}
                        className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 flex items-center gap-3 shadow-md transition-all"
                    >
                        {loading === 'prices' ? (
                            <><LoadingSpinner size="sm" className="text-white" /> <span>Getting Prices...</span></>
                        ) : (
                            <><i className="fas fa-tags"></i> <span>Get Pricing Details</span></>
                        )}
                    </button>
                </div>
            )}
            {/* 2. Get Discount */}
            {itemPrices && !discountInfo && (
                <div className="flex justify-center mb-6">
                    <button
                        onClick={handleGetDiscount}
                        disabled={loading !== null}
                        className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 disabled:opacity-50 flex items-center gap-3 shadow-md transition-all"
                    >
                        {loading === 'discount' ? (
                            <><LoadingSpinner size="sm" className="text-white" /> <span>Gathering ...</span></>
                        ) : (
                            <><i className="fas fa-percentage"></i> <span>Get CNP & Discount Details</span></>
                        )}
                    </button>
                </div>            )}

            {/* 3. Discount Role Selection and Compute Final Pricing */}
            {itemPrices && discountInfo && (
                <>
                    {/* Discount role is now auto-set by userRole, so no manual selection */}
                    <div className="flex justify-center mb-6">
                        <button
                            onClick={handleComputePricing}
                            disabled={loading !== null}
                            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 disabled:opacity-50 flex items-center gap-3 shadow-md transition-all"
                        >
                            {loading === 'pricing' ? (
                                <><LoadingSpinner size="sm" className="text-white" /> <span>Computing...</span></>
                            ) : (
                                <><i className="fas fa-calculator"></i> <span>Compute Final Pricing</span></>
                            )}
                        </button>
                    </div>
                </>
            )}

            {/* Tabbed Results Display */}
            <div className="mt-8 border-t pt-6">
                <Tabs selectedIndex={activeTabIndex} onSelect={setActiveTabIndex}>
                    <TabList className="flex border-b mb-4">
                        <Tab className="px-4 py-2 cursor-pointer" selectedClassName="border-b-2 border-blue-500 text-blue-600 font-semibold">Item Prices</Tab>
                        <Tab className="px-4 py-2 cursor-pointer" selectedClassName="border-b-2 border-blue-500 text-blue-600 font-semibold">Discount Information</Tab>
                        <Tab className="px-4 py-2 cursor-pointer" selectedClassName="border-b-2 border-blue-500 text-blue-600 font-semibold">Final Pricing Details</Tab>
                    </TabList>
                    <TabPanel>
                        {itemPrices ? (                            <div className="rounded-lg border border-gray-200 overflow-hidden mb-6">
                                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                                    <h3 className="text-lg font-semibold text-gray-800">Item Prices</h3>
                                </div>
                                <div className="p-6">{renderPriceTable(itemPrices)}</div>
                            </div>
                        ) : <div className="text-gray-500">No item prices available.</div>}
                    </TabPanel>                    <TabPanel>
                        {discountInfo ? (
                            <div className="mt-6 rounded-lg border border-gray-200 overflow-hidden mb-6">                                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                                    <h3 className="text-lg font-semibold text-gray-800">CNP & Discount Information</h3>
                                </div>                                
                                <div className="p-6 bg-white">
                                    <div className="space-y-6">                                        {(() => {
                                            const consolidatedData = getConsolidatedDiscountInfo(discountInfo);
                                            return consolidatedData.map((info: any, index: number) => {
                                                const relevantCnpFactor = getRelevantCnpFactor(info);
                                                const associatedItems = getItemsForManufacturer(info.Manufacturer);
                                                
                                                return (
                                                    <div key={`${info.Manufacturer}-${index}`} className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                                                        <div className="bg-gradient-to-r from-gray-50 to-white px-6 py-4 border-b border-gray-200">
                                                            <h4 className="text-xl font-semibold text-gray-800 mb-2">
                                                                {info.Manufacturer}
                                                            </h4>
                                                            <div className="flex flex-wrap gap-2 text-sm">
                                                                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                                                                    {info['Price List']}
                                                                </span>
                                                                {geography?.geography && (
                                                                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full">
                                                                        Geography: {geography.geography}
                                                                    </span>
                                                                )}
                                                                {associatedItems.length > 0 && (
                                                                    <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full">
                                                                        {associatedItems.length} Item{associatedItems.length > 1 ? 's' : ''}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="p-6">
                                                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                                                {/* Left Column: CNP Factor */}
                                                                <div className="space-y-4">
                                                                    <div>
                                                                        <h5 className="text-lg font-medium text-gray-700 mb-3">
                                                                            CNP Factor ({relevantCnpFactor.label})
                                                                        </h5>                                                                        <div className="bg-blue-50 p-4 rounded-lg">
                                                                            <div className="text-center">
                                                                                <span className="text-3xl font-bold text-blue-700">
                                                                                    {relevantCnpFactor.value}
                                                                                </span>
                                                                            </div>
                                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                {/* Right Column: Associated Items and Discount Range */}
                                                <div className="space-y-4">
                                                    {/* Discount Range Section */}                                                    <div>
                                                        <h5 className="text-lg font-medium text-gray-700 mb-3">
                                                            Discount Range ({discountRole})
                                                        </h5>                                                        <div className="bg-green-50 p-4 rounded-lg">
                                                            <div className="text-center">
                                                                <span className="text-3xl font-bold text-green-700">
                                                                    {(() => {
                                                                        const currentDiscount = discountRole === 'Sales Engineer' 
                                                                            ? info['Discount Authorization Sales Engineer']
                                                                            : info['Discount Authorization Sales Director'];
                                                                        return currentDiscount || 0;
                                                                    })()}%
                                                                </span>
                                                                <div className="text-sm text-gray-600 mt-1">
                                                                    Current Discount ({discountRole})
                                                                </div>
                                                                <div className="text-xs text-gray-500 mt-2">
                                                                    Max Range: 0% - {getMaxDiscountRange()}%
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {associatedItems.length > 0 && (
                                                                        <div>
                                                                            <h5 className="text-lg font-medium text-gray-700 mb-3">
                                                                                Associated Items
                                                                            </h5>
                                                                            <div className="bg-gray-50 p-4 rounded-lg max-h-80 overflow-y-auto">
                                                                                <div className="space-y-3">
                                                                                    {associatedItems.map((item: any, itemIndex: number) => (
                                                                                        <div key={`${item["Item ID"]}-${itemIndex}`} className="bg-white p-3 rounded border-l-4 border-blue-400">
                                                                                            <div className="flex justify-between items-start">
                                                                                                <div className="flex-1">
                                                                                                    <div className="font-semibold text-blue-700 text-lg">
                                                                                                        {item["Item ID"]}
                                                                                                    </div>
                                                                                                    <div className="text-gray-700 mt-1 text-sm leading-relaxed">
                                                                                                        {item["Item Description"] || item["Item Name"] || 'N/A'}
                                                                                                    </div>
                                                                                                    
                                                                                                </div>
                                                                                            </div>
                                                                                        </div>
                                                                                    ))}
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            });
                                        })()}
                                    </div>
                                </div>
                            </div>
                        ) : <div className="text-gray-500">No discount information available.</div>}
                    </TabPanel>
                    <TabPanel>
                        {itemPrices && discountInfo ? (
                            (() => {
                                // Build a map for quick lookup
                                const priceMap = new Map();
                                itemPrices.forEach((p: any) => priceMap.set(p["Item ID"], p));
                                const discountMap = new Map();
                                discountInfo.forEach((d: any) => discountMap.set(d["Manufacturer"], d));
                                // Use items_information as the source of truth for rows
                                const items = Array.isArray(extractionData.items_information)
                                    ? extractionData.items_information
                                    : (typeof extractionData.items_information === 'string'
                                        ? (() => {
                                            let str = extractionData.items_information.trim();
                                            str = str.replace(/^```(?:json)?[\r\n]*/i, '').replace(/```$/i, '').trim();
                                            try {
                                                return JSON.parse(str);
                                            } catch {
                                                return [];
                                            }
                                        })()
                                        : [extractionData.items_information]);
                                // Get the correct keys for CNP factor and discount
                                const cnpKey = getCnpFactorKey(selectedCurrency);
                                const discountKey = discountRole === 'Sales Engineer' ? 'Discount Authorization Sales Engineer' : 'Discount Authorization Sales Director';                                // Table columns - add Item Name
                                const columns = [
                                    'Item ID',
                                    'Item Name',
                                    'Quantity',
                                    'Manufacturer',
                                    'GLP',
                                    'CNP Factor',
                                    'CNP',
                                    'Discount',
                                    'Applied Discount',
                                    'FINAL CNP',
                                    'Total Price'
                                ];
                                // Compute rows
                                const rows = items.map((item: any) => {
                                    const price = priceMap.get(item["Item ID"]);
                                    const discount = discountMap.get(item["Manufacturer"]);
                                    // Parse GLP (may be string with $)
                                    let glp = price && price["GlobalLP"];
                                    if (typeof glp === 'string') glp = parseFloat(glp.replace(/[^\d.]/g, ''));
                                    if (typeof glp !== 'number' || isNaN(glp)) glp = 0;
                                    // CNP Factor
                                    let cnpFactor = discount && discount[cnpKey];
                                    if (typeof cnpFactor === 'string') cnpFactor = parseFloat(cnpFactor);
                                    if (typeof cnpFactor !== 'number' || isNaN(cnpFactor)) cnpFactor = 0;                                    // CNP
                                    const cnp = glp * cnpFactor;                                    // Discount Factor (as decimal)
                                    let discountFactor = 0;
                                    let appliedDiscountValue = 0;
                                    
                                    // Check if we're editing final discounts and have a custom value
                                    if (isEditingFinalDiscounts && editedFinalDiscounts[item["Item ID"]] !== undefined) {
                                        discountFactor = editedFinalDiscounts[item["Item ID"]] / 100;
                                        appliedDiscountValue = editedFinalDiscounts[item["Item ID"]];
                                    } else {
                                        // Follow the approval workflow: SE applies -> SD approves/overrides
                                        const itemAppliedDiscount = appliedDiscounts[item["Item ID"]];
                                        
                                        if (itemAppliedDiscount) {
                                            if (discountRole === 'Sales Engineer') {
                                                // Sales Engineer sees their own discount
                                                if (itemAppliedDiscount.salesEngineer !== undefined) {
                                                    appliedDiscountValue = itemAppliedDiscount.salesEngineer;
                                                    discountFactor = appliedDiscountValue / 100;
                                                }
                                            } else if (discountRole === 'Sales Director') {
                                                // Sales Director: use their override if exists, otherwise use SE discount
                                                if (itemAppliedDiscount.salesDirector !== undefined) {
                                                    // SD has made a decision (approval or override)
                                                    appliedDiscountValue = itemAppliedDiscount.salesDirector;
                                                    discountFactor = appliedDiscountValue / 100;
                                                } else if (itemAppliedDiscount.salesEngineer !== undefined) {
                                                    // SD sees SE discount for approval/override
                                                    appliedDiscountValue = itemAppliedDiscount.salesEngineer;
                                                    discountFactor = appliedDiscountValue / 100;
                                                }
                                            }                                        }
                                        
                                        // If no applied discount found, keep discount at 0% (no fallback to manufacturer defaults)
                                        // This ensures that discounts start at 0% unless explicitly set by users
                                        if (discountFactor === 0 && appliedDiscountValue === 0) {
                                            // Keep both at 0 - no discount applied
                                            discountFactor = 0;
                                            appliedDiscountValue = 0;
                                        }
                                    }
                                    
                                    // FINAL CNP
                                    const finalCnp = cnp * (1 - discountFactor);// Quantity
                                    const qty = item.Quantity || 1;
                                    // Total Price
                                    const totalPrice = finalCnp * qty;                                    return {                                        'Item ID': item["Item ID"],
                                        'Item Name': item["Item Description"] || item["Item Name"] || 'N/A',
                                        'Quantity': qty,
                                        'Manufacturer': item["Manufacturer"],
                                        'GLP': glp.toLocaleString(undefined, { style: 'currency', currency: 'USD' }),
                                        'CNP Factor': cnpFactor,
                                        'CNP': cnp.toLocaleString(undefined, { style: 'currency', currency: 'USD' }),                                        'Discount': isEditingFinalDiscounts ? (
                                            <div className="flex items-center">
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    max={getMaxDiscountRangeForItem(item["Item ID"])}
                                                    value={editedFinalDiscounts[item["Item ID"]] || (discountFactor * 100)}
                                                    onChange={(e) => handleFinalDiscountChange(item["Item ID"], parseFloat(e.target.value) || 0)}
                                                    className="w-16 p-1 text-sm border rounded"
                                                />
                                                <span className="ml-1 text-sm">%</span>
                                            </div>
                                        ) : (discountFactor * 100).toFixed(2) + '%','Applied Discount': (() => {
                                            // Check if this item has applied discounts
                                            const itemAppliedDiscount = appliedDiscounts[item["Item ID"]];
                                            
                                            if (itemAppliedDiscount) {
                                                const seDiscount = itemAppliedDiscount.salesEngineer;
                                                const sdDiscount = itemAppliedDiscount.salesDirector;
                                                
                                                if (discountRole === 'Sales Engineer') {
                                                    // Show SE's discount and approval status
                                                    if (seDiscount !== undefined) {
                                                        if (sdDiscount !== undefined) {
                                                            // SD has reviewed
                                                            if (sdDiscount === seDiscount) {
                                                                return (
                                                                    <div className="text-green-600 font-semibold">
                                                                        <div>{seDiscount.toFixed(2)}% (SE)</div>
                                                                        <div className="text-xs text-green-500">✓ Approved by SD</div>
                                                                    </div>
                                                                );
                                                            } else {
                                                                return (
                                                                    <div className="text-orange-600 font-semibold">
                                                                        <div className="line-through">{seDiscount.toFixed(2)}% (SE)</div>
                                                                        <div className="text-xs text-red-500">Overridden by SD: {sdDiscount.toFixed(2)}%</div>
                                                                    </div>
                                                                );
                                                            }
                                                        } else {
                                                            return (
                                                                <div className="text-blue-600 font-semibold">
                                                                    <div>{seDiscount.toFixed(2)}% (SE)</div>
                                                                    <div className="text-xs text-orange-500">⏳ Pending SD approval</div>
                                                                </div>
                                                            );
                                                        }
                                                    }
                                                } else if (discountRole === 'Sales Director') {
                                                    // Show SD's view of the workflow
                                                    if (sdDiscount !== undefined) {
                                                        // SD has made a decision
                                                        if (sdDiscount === seDiscount) {
                                                            return (
                                                                <div className="text-green-600 font-semibold">
                                                                    <div>{sdDiscount.toFixed(2)}% (Approved)</div>
                                                                    <div className="text-xs text-gray-500">SE: {seDiscount?.toFixed(2)}%</div>
                                                                </div>
                                                            );
                                                        } else {
                                                            return (
                                                                <div className="text-blue-600 font-semibold">
                                                                    <div>{sdDiscount.toFixed(2)}%</div>
                                                                    <div className="text-xs text-gray-500">SE: {seDiscount?.toFixed(2)}%</div>
                                                                </div>
                                                            );
                                                        }
                                                    } else if (seDiscount !== undefined) {
                                                        // SE discount pending SD review
                                                        return (
                                                            <div className="text-orange-600 font-semibold">
                                                                <div>{seDiscount.toFixed(2)}% (SE)</div>
                                                                <div className="text-xs text-orange-500">🔍 Needs your approval</div>
                                                            </div>
                                                        );
                                                    }
                                                }
                                            }
                                            return <span className="text-gray-400">0% (No discount)</span>;
                                        })(),
                                        'FINAL CNP': finalCnp.toLocaleString(undefined, { style: 'currency', currency: 'USD' }),
                                        'Total Price': totalPrice.toLocaleString(undefined, { style: 'currency', currency: 'USD' }),
                                        '_itemId': item["Item ID"] // Hidden field for reference
                                    };
                                });
                                
                                // Helper function to filter out Applied Discount column for downloads
                                const getDownloadableRows = (rows: any[]) => {
                                    return rows.map(row => {
                                        const { 'Applied Discount': _, '_itemId': __, ...downloadRow } = row;
                                        return downloadRow;
                                    });
                                };
                                
                                return (
                                    <div className="rounded-lg border border-gray-200 overflow-hidden">                                        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-800">Final Pricing Details</h3>
                                                {(() => {
                                                    const workflowStatus = getWorkflowStatus();
                                                    if (workflowStatus) {
                                                        return (
                                                            <div className={`mt-2 px-3 py-1 rounded-full text-sm font-medium ${
                                                                workflowStatus.type === 'warning' 
                                                                    ? 'bg-orange-100 text-orange-800 border border-orange-200' 
                                                                    : 'bg-blue-100 text-blue-800 border border-blue-200'
                                                            }`}>
                                                                <i className={`fas ${workflowStatus.type === 'warning' ? 'fa-clock' : 'fa-info-circle'} mr-1`}></i>
                                                                {workflowStatus.message}
                                                            </div>
                                                        );
                                                    }
                                                    return null;
                                                })()}
                                            </div>{rows.length > 0 && (
                                                <div className="flex gap-2">
                                                    {/* Discount Edit Controls */}
                                                    {canEditDiscount && !isEditingFinalDiscounts && (                                                        <button
                                                            onClick={handleStartFinalDiscountEdit}
                                                            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center gap-2"
                                                        >
                                                            <i className="fas fa-percentage"></i>
                                                            {discountRole === 'Sales Engineer' ? 'Apply Discounts' : 'Review/Approve Discounts'}
                                                        </button>
                                                    )}
                                                    {canEditDiscount && isEditingFinalDiscounts && (
                                                        <>
                                                            <button
                                                                onClick={handleSaveFinalDiscountEdit}
                                                                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
                                                            >
                                                                <i className="fas fa-save"></i>
                                                                {discountRole === 'Sales Engineer' ? 'Submit for Approval' : 'Approve/Override'}
                                                            </button>
                                                            <button
                                                                onClick={handleCancelFinalDiscountEdit}
                                                                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2"
                                                            >
                                                                <i className="fas fa-times"></i>
                                                                Cancel
                                                            </button>
                                                        </>
                                                    )}                                                    {/* Show Quote Button */}
                                                    <button
                                                        onClick={() => {
                                                            setQuotePreviewData(getDownloadableRows(rows));
                                                            setShowQuotePreview(true);
                                                        }}
                                                        className="px-5 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold shadow hover:from-blue-700 hover:to-blue-700 transition"
                                                    >
                                                        <i className="fas fa-eye mr-2"></i>Show Quote
                                                    </button>

                                                    {/* Send Quote via Email Button */}
                                                    <button
                                                        onClick={() => {
                                                            setQuotePreviewData(getDownloadableRows(rows));
                                                            setShowEmailModal(true);
                                                        }}
                                                        className="px-5 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 text-white font-semibold shadow hover:from-purple-700 hover:to-purple-700 transition"
                                                    >
                                                        <i className="fas fa-envelope mr-2"></i>Send via Email
                                                    </button>{/* Download Quote Button */}
                                                    {onDownloadQuote && (
                                                        <button
                                                            onClick={() => onDownloadQuote(getDownloadableRows(rows))}
                                                            className="px-5 py-2 rounded-lg bg-gradient-to-r from-green-600 to-green-500 text-white font-semibold shadow hover:from-green-700 hover:to-green-600 transition"
                                                        >
                                                            <i className="fas fa-file-download mr-2"></i>Download Quote
                                                        </button>
                                                    )}
                                                    <InvoiceDownload customerInfo={getEnhancedCustomerInfo()} finalPricing={getDownloadableRows(rows)} fileName={fileName} />
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-6">
                                            <div className="overflow-x-auto">
                                                <table className="min-w-full table-auto">
                                                    <thead>
                                                        <tr className="bg-gray-100">
                                                            {columns.map((col) => (
                                                                <th key={col} className="px-4 py-2">{col}</th>
                                                            ))}
                                                        </tr>
                                                    </thead>                                                    <tbody>
                                                        {rows.map((row: Record<string, string | number>, idx: number) => (
                                                            <tr key={row['Item ID']} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                                                {columns.map((col) => (
                                                                    <td key={col} className="border px-4 py-2">
                                                                        {typeof row[col] === 'object' ? row[col] : row[col]}
                                                                    </td>
                                                                ))}
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })()
                        ) : <div className="text-gray-500">No final pricing available.</div>}
                    </TabPanel>
                </Tabs>
            </div>

            {/* Off-canvas for quote preview */}
            {showQuotePreview && (
                <div className="fixed inset-0 z-50 flex justify-end bg-black bg-opacity-40">
                    <div className="w-full max-w-5xl bg-white h-full shadow-xl p-6 overflow-y-auto relative animate-slide-in-right">
                        <button
                            className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-2xl"
                            onClick={() => setShowQuotePreview(false)}
                            aria-label="Close preview"
                        >
                            <i className="fas fa-times"></i>
                        </button>
                        <h2 className="text-xl font-bold mb-4 text-blue-800">Quote Preview</h2>
                        {/* Reference and intro */}
                        <div className="mb-4 text-gray-700 text-base">
                            <div className="mb-2">
                                <span className="font-semibold">Reference to your request for quote</span> (file: <span className="italic">{fileName || 'N/A'}</span>),
                            </div>
                            <div>
                                The detailed quote as follows:
                            </div>
                        </div>                        {/* Customer Info Section */}
                        {customerInfo && (
                            <div className="mb-6 border rounded p-4 bg-gray-50">
                                <h3 className="font-semibold text-gray-700 mb-2">Customer Information</h3>
                                <ul className="text-sm text-gray-700 space-y-1">
                                    {Object.entries(getEnhancedCustomerInfo() || {}).map(([key, value]) => (
                                        <li key={key}>
                                            <span className="font-medium">{getCustomerFieldLabel(key)}:</span> {value as string}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        {/* Quote Table Section */}
                        <div className="overflow-x-auto mb-6">
                            <table className="min-w-full table-auto border">
                                <thead>
                                    <tr className="bg-gray-100">
                                        {quotePreviewData.length > 0 && Object.keys(quotePreviewData[0]).map((col) => (
                                            <th key={col} className="px-4 py-2 border-b">{col}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {quotePreviewData.map((row: any, idx: number) => (
                                        <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                            {Object.keys(row).map((col) => (
                                                <td key={col} className="border px-4 py-2">{row[col]}</td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {/* Pricing validity and contact note */}
                        <div className="mb-4 text-gray-700 text-base">
                            The prices are valid for the period of two months. In case there is any revision of pricing before that period, we will send you updated quote. If you have any queries please reach out to the signatory mentioned below and we will be glad to respond to you with any clarification necessary.
                        </div>
                        {/* Thank you note */}
                        <div className="mb-6 text-gray-700 text-base font-semibold">Thank you.</div>
                        <div className="flex justify-end gap-2">
                            <button
                                className="px-4 py-2 rounded bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300"
                                onClick={() => setShowQuotePreview(false)}
                            >
                                Close
                            </button>                        </div>
                    </div>
                </div>
            )}

            {/* Email Modal */}
            {showEmailModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 shadow-xl">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-gray-800">Send Quote via Email</h3>
                            <button
                                onClick={() => {
                                    setShowEmailModal(false);
                                    setEmailAddress('');
                                }}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <i className="fas fa-times text-xl"></i>
                            </button>
                        </div>
                        
                        <div className="mb-4">
                            <label htmlFor="emailAddress" className="block text-sm font-medium text-gray-700 mb-2">
                                Email Address
                            </label>
                            <input
                                id="emailAddress"
                                type="email"
                                value={emailAddress}
                                onChange={(e) => setEmailAddress(e.target.value)}
                                placeholder="Enter recipient's email address"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                        </div>
                        
                        <div className="text-sm text-gray-600 mb-4">
                            <p>The quote will be sent as a PDF attachment via email.</p>
                            <p className="mt-1 text-xs text-orange-600">
                                <i className="fas fa-info-circle mr-1"></i>
                                Note: This feature is currently non-functional (placeholder)
                            </p>
                        </div>
                        
                        <div className="flex gap-3">
                            <button
                                onClick={handleSendQuoteEmail}
                                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold"
                            >
                                <i className="fas fa-paper-plane mr-2"></i>Send Quote
                            </button>
                            <button
                                onClick={() => {
                                    setShowEmailModal(false);
                                    setEmailAddress('');
                                }}
                                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-semibold"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PricingResults;

