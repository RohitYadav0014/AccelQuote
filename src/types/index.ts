export interface CustomerInformation {
    customer_name: string;
    email: string;
    phone: string;
    organization: string;
    website: string;
    address: string;
}

export interface ItemInformation {
    'Item ID': string;
    Quantity: number;
    'Item Description': string;
    Manufacturer: string;
}

export interface PriceDetail {
    'Item ID': string;
    GlobalLP: string;
}

export interface DiscountInfo {
    Manufacturer: string;
    'Price List': string;
    'CNP FACTOR USD': number;
    'CNP FACTOR EURO': number;
    'CNP FACTOR UKP': number;
    'Discount Authorization Sales Engineer': number;
    'Discount Authorization Sales Director': number;
}

export interface FinalPricing {
    'Item ID': string;
    'Item Description': string;
    Quantity: number;
    Manufacturer: string;
    GlobalLP: number;
    'CNP FACTOR USD': number;
    'Discount Authorization Sales Engineer': number;
    CNP_Price: number;
    CNP_with_dicsount: number;
}

export interface ExtractionData {
    customer_information?: CustomerInformation;
    items_information?: ItemInformation[];
    geography?: { geography: string };
    item_price_details?: PriceDetail[];
    cnp_discount_info?: DiscountInfo[];
    complete_pricing_info?: FinalPricing[];
    markdown_text?: string;
    final_markdown_text?: string;
}
