// Mock data for testing without actual API
import { ExtractionData } from '../types';

interface ItemInformation {
    "Item ID": string;
    "Quantity": number;
    "Item Description": string;
    "Manufacturer": string;
}

interface CustomerInformation {
    customer_name: string;
    email: string;
    phone: string;
    organization: string;
    website: string;
    address: string;
}

interface PriceDetail {
    "Item ID": string;
    "GlobalLP": string;
}

interface CompletePricingInfo {
    "Item ID": string;
    "Item Description": string;
    "Quantity": number;
    "Manufacturer": string;
    "GlobalLP": number;
    "CNP FACTOR USD": number;
    "Discount Authorization Sales Engineer": number;
    "CNP_Price": number;
    "CNP_with_dicsount": number;
}

const mockFileList = [
    '/sample/test_quote.pdf',
    '/sample/EXTERNAL RFQ 6000243598.pdf'
];

const mockItemsInformation: ItemInformation[] = [
    {
        "Item ID": "XSKEB1006EU6",
        "Quantity": 1,
        "Item Description": "KIT;SEAL;XSKEB1006EU6;KEYSTONE WINN KIT:SEAL ADDITIONAL INFORMATION: SOFT GOODS",
        "Manufacturer": "PUFFER SWEIVEN"
    },
    {
        "Item ID": "SPB2800",
        "Quantity": 6,
        "Item Description": "BELT,V;DRIVE;SPB2800;APPLETON SHORT_NAME:BELT,V TYPE:DRIVE",
        "Manufacturer": "APPLETON"
    },
    {
        "Item ID": "SPB2800",
        "Quantity": 3,
        "Item Description": "BELT,V;DRIVE;SPB2800;APPLETON SHORT_NAME:BELT,V TYPE:DRIVE",
        "Manufacturer": "APPLETON"
    },
    {
        "Item ID": "SPB2800",
        "Quantity": 6,
        "Item Description": "BELT,V;DRIVE;SPB2800;APPLETON SHORT_NAME:BELT,V TYPE:DRIVE",
        "Manufacturer": "APPLETON"
    },
    {
        "Item ID": "SPB2800",
        "Quantity": 12,
        "Item Description": "BELT,V;DRIVE;SPB2800;APPLETON SHORT_NAME:BELT,V TYPE:DRIVE",
        "Manufacturer": "APPLETON"
    },
    {
        "Item ID": "213921120360001",
        "Quantity": 5,
        "Item Description": "GSKT:SW;12 IN;GPH;213921120360001 GASKET:SPIRAL WOUND SIZE: 12 IN FILLER MATERIAL: GRAPHITE ADDITIONAL INFORMATION: BOTTOM COVER,BUTTER FLY VALVE,MFR:TYCO",
        "Manufacturer": "KEYSTONE"
    }
];

const mockPriceDetails: PriceDetail[] = [
    {
        "Item ID": "XSKEB1006EU6",
        "GlobalLP": "$90.00"
    },
    {
        "Item ID": "SPB2800",
        "GlobalLP": "$100.00"
    },
    {
        "Item ID": "SPB2800",
        "GlobalLP": "$100.00"
    },
    {
        "Item ID": "SPB2800",
        "GlobalLP": "$100.00"
    },
    {
        "Item ID": "SPB2800",
        "GlobalLP": "$100.00"
    },
    {
        "Item ID": "213921120360001",
        "GlobalLP": "$110.00"
    }
];

const mockCompletePricing: CompletePricingInfo[] = [
    {
        "Item ID": "XSKEB1006EU6",
        "Item Description": "KIT;SEAL;XSKEB1006EU6;KEYSTONE WINN KIT:SEAL ADDITIONAL INFORMATION: SOFT GOODS",
        "Quantity": 1,
        "Manufacturer": "PUFFER SWEIVEN",
        "GlobalLP": 90.00,
        "CNP FACTOR USD": 0.81,
        "Discount Authorization Sales Engineer": 0.15,
        "CNP_Price": 72.90,
        "CNP_with_dicsount": 61.96
    },
    {
        "Item ID": "SPB2800",
        "Item Description": "BELT,V;DRIVE;SPB2800;APPLETON SHORT_NAME:BELT,V TYPE:DRIVE",
        "Quantity": 6,
        "Manufacturer": "APPLETON",
        "GlobalLP": 100.00,
        "CNP FACTOR USD": 0.819,
        "Discount Authorization Sales Engineer": 0.15,
        "CNP_Price": 81.90,
        "CNP_with_dicsount": 69.62
    },
    {
        "Item ID": "SPB2800",
        "Item Description": "BELT,V;DRIVE;SPB2800;APPLETON SHORT_NAME:BELT,V TYPE:DRIVE",
        "Quantity": 3,
        "Manufacturer": "APPLETON",
        "GlobalLP": 100.00,
        "CNP FACTOR USD": 0.819,
        "Discount Authorization Sales Engineer": 0.15,
        "CNP_Price": 81.90,
        "CNP_with_dicsount": 69.62
    },
    {
        "Item ID": "SPB2800",
        "Item Description": "BELT,V;DRIVE;SPB2800;APPLETON SHORT_NAME:BELT,V TYPE:DRIVE",
        "Quantity": 6,
        "Manufacturer": "APPLETON",
        "GlobalLP": 100.00,
        "CNP FACTOR USD": 0.819,
        "Discount Authorization Sales Engineer": 0.15,
        "CNP_Price": 81.90,
        "CNP_with_dicsount": 69.62
    },
    {
        "Item ID": "SPB2800",
        "Item Description": "BELT,V;DRIVE;SPB2800;APPLETON SHORT_NAME:BELT,V TYPE:DRIVE",
        "Quantity": 12,
        "Manufacturer": "APPLETON",
        "GlobalLP": 100.00,
        "CNP FACTOR USD": 0.819,
        "Discount Authorization Sales Engineer": 0.15,
        "CNP_Price": 81.90,
        "CNP_with_dicsount": 69.62
    },
    {
        "Item ID": "213921120360001",
        "Item Description": "GSKT:SW;12 IN;GPH;213921120360001 GASKET:SPIRAL WOUND SIZE: 12 IN FILLER MATERIAL: GRAPHITE ADDITIONAL INFORMATION: BOTTOM COVER,BUTTER FLY VALVE,MFR:TYCO",
        "Quantity": 5,
        "Manufacturer": "KEYSTONE",
        "GlobalLP": 110.00,
        "CNP FACTOR USD": 0.625,
        "Discount Authorization Sales Engineer": 0.25,
        "CNP_Price": 68.75,
        "CNP_with_dicsount": 51.56
    }
];

export const mockFetchFileList = async (): Promise<string[]> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    return mockFileList;
};

export const mockExtractPdfData = async (fileId: string): Promise<{ message: ExtractionData }> => {
    // Simulate network delay and processing time
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Create the formatted result with properly stringified JSON    // Parse the stringified data back to objects since the API returns them as parsed JSON
    const geography = { geography: "Europe" };
    const customerInfo: CustomerInformation = {
        customer_name: "Teresa Lobo",
        email: "teresa.lobo@group-etis.com",
        phone: "+33 1 80 24 00 40",
        organization: "group-etis",
        website: "www.group-etis.com",
        address: "5 rue du Cimetière • 93290 Tremblay-en-France • France"
    };
    
    return {
        message: {
            markdown_text: `# RFQ 6000243598\n\n**From:** Teresa Lobo (<teresa.lobo@group-etis.com>)\n\n**Date:** Wednesday, March 5, 2025 6:22 AM\n\n**Geography:** Europe\n\n---\n\n## Customer Information\n\n| Field | Value |\n|-------|-------|\n| Name | Teresa Lobo |\n| Email | teresa.lobo@group-etis.com |\n| Phone | +33 1 80 24 00 40 |\n| Organization | group-etis |\n| Website | www.group-etis.com |\n| Address | 5 rue du Cimetière • 93290 Tremblay-en-France • France |\n\n---\n\n## Items Information\n\n| Item ID | Description | Quantity | Manufacturer |\n|---------|-------------|----------|--------------|\n| XSKEB1006EU6 | KIT;SEAL;XSKEB1006EU6;KEYSTONE WINN KIT:SEAL ADDITIONAL INFORMATION: SOFT GOODS | 1 | PUFFER SWEIVEN |\n| SPB2800 | BELT,V;DRIVE;SPB2800;APPLETON SHORT_NAME:BELT,V TYPE:DRIVE | 6 | APPLETON |\n| SPB2800 | BELT,V;DRIVE;SPB2800;APPLETON SHORT_NAME:BELT,V TYPE:DRIVE | 3 | APPLETON |\n| SPB2800 | BELT,V;DRIVE;SPB2800;APPLETON SHORT_NAME:BELT,V TYPE:DRIVE | 6 | APPLETON |\n| SPB2800 | BELT,V;DRIVE;SPB2800;APPLETON SHORT_NAME:BELT,V TYPE:DRIVE | 12 | APPLETON |\n| 213921120360001 | GSKT:SW;12 IN;GPH;213921120360001 GASKET:SPIRAL WOUND SIZE: 12 IN FILLER MATERIAL: GRAPHITE ADDITIONAL INFORMATION: BOTTOM COVER,BUTTER FLY VALVE,MFR:TYCO | 5 | KEYSTONE |\n\n---\n\n## Pricing Information\n\n| Item ID | GlobalLP |\n|---------|----------|\n| XSKEB1006EU6 | $90.00 |\n| SPB2800 | $100.00 |\n| SPB2800 | $100.00 |\n| SPB2800 | $100.00 |\n| SPB2800 | $100.00 |\n| 213921120360001 | $110.00 |\n\n---\n\n*This is a mock extraction for demonstration purposes.*`,
            final_markdown_text: `# RFQ 6000243598\n\n**From:** Teresa Lobo (<teresa.lobo@group-etis.com>)\n\n**Date:** Wednesday, March 5, 2025 6:22 AM\n\n**Geography:** Europe\n\n---\n\n## Customer Information\n\n| Field | Value |\n|-------|-------|\n| Name | Teresa Lobo |\n| Email | teresa.lobo@group-etis.com |\n| Phone | +33 1 80 24 00 40 |\n| Organization | group-etis |\n| Website | www.group-etis.com |\n| Address | 5 rue du Cimetière • 93290 Tremblay-en-France • France |\n\n---\n\n## Items Information\n\n| Item ID | Description | Quantity | Manufacturer |\n|---------|-------------|----------|--------------|\n| XSKEB1006EU6 | KIT;SEAL;XSKEB1006EU6;KEYSTONE WINN KIT:SEAL ADDITIONAL INFORMATION: SOFT GOODS | 1 | PUFFER SWEIVEN |\n| SPB2800 | BELT,V;DRIVE;SPB2800;APPLETON SHORT_NAME:BELT,V TYPE:DRIVE | 6 | APPLETON |\n| SPB2800 | BELT,V;DRIVE;SPB2800;APPLETON SHORT_NAME:BELT,V TYPE:DRIVE | 3 | APPLETON |\n| SPB2800 | BELT,V;DRIVE;SPB2800;APPLETON SHORT_NAME:BELT,V TYPE:DRIVE | 6 | APPLETON |\n| SPB2800 | BELT,V;DRIVE;SPB2800;APPLETON SHORT_NAME:BELT,V TYPE:DRIVE | 12 | APPLETON |\n| 213921120360001 | GSKT:SW;12 IN;GPH;213921120360001 GASKET:SPIRAL WOUND SIZE: 12 IN FILLER MATERIAL: GRAPHITE ADDITIONAL INFORMATION: BOTTOM COVER,BUTTER FLY VALVE,MFR:TYCO | 5 | KEYSTONE |\n\n---\n\n## Pricing Information\n\n| Item ID | GlobalLP |\n|---------|----------|\n| XSKEB1006EU6 | $90.00 |\n| SPB2800 | $100.00 |\n| SPB2800 | $100.00 |\n| SPB2800 | $100.00 |\n| SPB2800 | $100.00 |\n| 213921120360001 | $110.00 |\n\n---\n\n*This is a mock extraction for demonstration purposes.*`,
            geography: geography,
            customer_information: customerInfo,
            items_information: mockItemsInformation,
            item_price_details: mockPriceDetails,
            complete_pricing_info: mockCompletePricing
        }
    };
};

export const mockItemsPricing = async (items: ItemInformation[]): Promise<{ message: { csv_data_pricing: string; item_price_details: PriceDetail[] } }> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return {
        message: {
            csv_data_pricing: "I have loaded the data from the CSV file. The data includes columns such as Qty, GlobalPN, Legacy PN, Description, Material/Comments, In Stock, Manchester, Request Lead Time, Units, QuickShip, GlobalLP, Buy Multiplier, Buy Price Each, and Currency.",
            item_price_details: mockPriceDetails
        }
    };
};

interface CnpDiscountInfo {
    Manufacturer: string;
    "Price List": string;
    "CNP FACTOR USD": number;
    "CNP FACTOR EURO": number;
    "CNP FACTOR UKP": number;
    "Discount Authorization Sales Engineer": number;
    "Discount Authorization Sales Director": number;
}

export const mockCnpDiscount = async (items: ItemInformation[]): Promise<{ message: { csv_data_cnp: string; cnp_discount_info: CnpDiscountInfo[] } }> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return {
        message: {
            csv_data_cnp: "I have loaded the CSV file and the data is in JSON format.",
            cnp_discount_info: items.map(() => ({
                "Manufacturer": "Anderson",
                "Price List": "Global PRV Pricebook",
                "CNP FACTOR USD": 0.5,
                "CNP FACTOR EURO": 0.51,
                "CNP FACTOR UKP": 0.448,
                "Discount Authorization Sales Engineer": 5,
                "Discount Authorization Sales Director": 25
            }))
        }
    };
};

interface ComputePricingData {
    items_information: ItemInformation[];
    item_price_details: PriceDetail[];
    cnp_discount_info: CnpDiscountInfo[];
}

export const mockComputePricing = async (data: ComputePricingData): Promise<{ message: { complete_pricing_info: CompletePricingInfo[] } }> => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const { items_information, item_price_details, cnp_discount_info } = data;
    return {
        message: {
            complete_pricing_info: items_information.map((item, index) => {
                const price = parseFloat(item_price_details[index].GlobalLP.replace('$', ''));
                const cnpFactor = cnp_discount_info[index]["CNP FACTOR USD"];
                const seDiscount = cnp_discount_info[index]["Discount Authorization Sales Engineer"] / 100;
                const sdDiscount = cnp_discount_info[index]["Discount Authorization Sales Director"] / 100;
                const cnpPrice = price * cnpFactor;
                // Set both discounts for use in UI
                return {
                    "Item ID": item["Item ID"],
                    "Item Description": item["Item Description"],
                    "Quantity": item["Quantity"],
                    "Manufacturer": item["Manufacturer"],
                    "GlobalLP": price,
                    "CNP FACTOR USD": cnpFactor,
                    "Discount Authorization Sales Engineer": seDiscount,
                    "Discount Authorization Sales Director": sdDiscount,
                    "CNP_Price": cnpPrice,
                    "CNP_with_dicsount": cnpPrice * (1 - seDiscount), // default to SE for compatibility
                    "CNP_with_dicsount_SD": cnpPrice * (1 - sdDiscount) // for SD
                };
            })
        }
    };
};
