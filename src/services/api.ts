import { 
    mockFetchFileList, 
    mockExtractPdfData, 
    mockItemsPricing,
    mockCnpDiscount,
    mockComputePricing
} from './mockApi.new';

// Environment configuration
const USE_MOCK_API = process.env.REACT_APP_USE_MOCK_API === 'true';
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://172.203.227.114:8080';

// Log the current mode
console.log(`Running in ${USE_MOCK_API ? 'MOCK' : 'LIVE'} mode`);
console.log(`API URL: ${API_BASE_URL}`);

const handleResponse = async (response: Response) => {
    if (!response.ok) {
        const text = await response.text();
        try {
            const json = JSON.parse(text);
            throw new Error(json.message || `HTTP error! status: ${response.status}`);
        } catch (e) {
            throw new Error(`HTTP error! status: ${response.status} - ${text || response.statusText}`);
        }
    }
    return response.json();
};

export const extractPdfData = async (filePath: string) => {
    if (USE_MOCK_API) {
        return mockExtractPdfData(filePath);
    }

    try {
        // Clean up the file path: remove any "/pdf" prefix and full URL if present
        let cleanPath = filePath;
        if (cleanPath.includes('/pdf')) {
            cleanPath = cleanPath.split('/pdf').pop() || cleanPath;
        }
        // Remove API base URL if present
        cleanPath = cleanPath.replace(`${API_BASE_URL}/`, '');
        
        const response = await fetch(`${API_BASE_URL}/processpdf/?query=${encodeURIComponent(cleanPath)}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });
        return await handleResponse(response);
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
};

export const fetchFileList = async () => {
    if (USE_MOCK_API) {
        return mockFetchFileList();
    }

    try {
        const response = await fetch(`${API_BASE_URL}/get_file_list`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
            },
            mode: 'cors',
            credentials: 'omit',
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Server error: ${response.status} - ${errorText || response.statusText}`);
        }

        const data = await response.json();
        // Use file paths directly from the API
        const serverFiles = data.file_list || [];

        // Add local sample files if needed in development
        const localSampleFiles = USE_MOCK_API ? [
            'sample/EXTERNAL RFQ 6000243598.pdf'
        ] : [];

        // Combine server files with local sample files if any
        const combinedFiles = [
            ...localSampleFiles,
            ...serverFiles
        ];

        return combinedFiles;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
};

export const getItemsPricing = async (itemsString: string) => {
    // itemsString should be a stringified array, e.g. '[{...},{...}]'
    // The API expects the body to be a quoted string (not JSON object)
    const USE_MOCK_API = process.env.REACT_APP_USE_MOCK_API === 'true';
    if (USE_MOCK_API) {
        // mockItemsPricing expects an array, so parse the string
        const arr = JSON.parse(itemsString);
        return mockItemsPricing(arr);
    }
    try {
        const response = await fetch(`${API_BASE_URL}/items_price/`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            // The API expects a string in quotes, not a JSON object
            body: JSON.stringify(itemsString)
        });
        return await handleResponse(response);
    } catch (error) {
        console.error('Items price API Error:', error);
        throw error;
    }
};

export const getCnpDiscount = async (itemsString: string) => {
    const USE_MOCK_API = process.env.REACT_APP_USE_MOCK_API === 'true';
    if (USE_MOCK_API) {
        const arr = JSON.parse(itemsString);
        return mockCnpDiscount(arr);
    }
    try {
        const response = await fetch(`${API_BASE_URL}/cnp_discount/`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(itemsString)
        });
        return await handleResponse(response);
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
};

export const computePricing = async (data: any) => {
    if (USE_MOCK_API) {
        return mockComputePricing(data);
    }

    try {
        const response = await fetch(`${API_BASE_URL}/compute_pricing/`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        return await handleResponse(response);
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
};

export const getPdfDownloadUrl = (filename: string): string => {
    if (USE_MOCK_API) {
        // For mock mode, return local sample files
        if (filename.startsWith('/sample/') || filename.startsWith('sample/')) {
            return filename.startsWith('/') ? filename : `/${filename}`;
        }
        return `/sample/${filename}`;
    }

    // Clean up the filename: remove any "/pdf" prefix and full URL if present
    let cleanFilename = filename;
    if (cleanFilename.includes('/pdf')) {
        cleanFilename = cleanFilename.split('/pdf').pop() || cleanFilename;
    }
    // Remove API base URL if present
    cleanFilename = cleanFilename.replace(`${API_BASE_URL}/`, '');
    // Remove leading slash if present
    cleanFilename = cleanFilename.startsWith('/') ? cleanFilename.slice(1) : cleanFilename;
    
    // Extract just the filename from the path (remove any directory structure)
    // This handles cases like "Samples from France/EXTERNAL Demande de prix Y12PSV4001 et 4011.pdf"
    if (cleanFilename.includes('/')) {
        cleanFilename = cleanFilename.split('/').pop() || cleanFilename;
    }
    
    return `${API_BASE_URL}/download-pdf/?filename=${encodeURIComponent(cleanFilename)}`;
};