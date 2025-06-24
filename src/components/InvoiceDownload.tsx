import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import React from 'react';

interface InvoiceDownloadProps {
  customerInfo: any;
  finalPricing: any[];
  fileName?: string;
}

const InvoiceDownload: React.FC<InvoiceDownloadProps> = ({ customerInfo, finalPricing, fileName }) => {
  
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

  const handleDownload = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    // Title
    doc.setFontSize(20);
    doc.text('AccelQuote by Gen AI', 14, 18);
    // Date (top right)
    doc.setFontSize(10);
    const today = new Date();
    const dateStr = today.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    doc.text(`Date: ${dateStr}`, pageWidth - 14 - doc.getTextWidth(`Date: ${dateStr}`), 18);
    // Horizontal line
    doc.setLineWidth(0.5);
    doc.line(14, 22, pageWidth - 14, 22);    // Customer Info Section
    let y = 30;
    if (customerInfo) {
      doc.setFontSize(12);
      doc.text('To:', 14, y);
      y += 7;
      doc.setFontSize(10);
      // Display customer information with proper labels
      Object.entries(customerInfo).forEach(([key, value]) => {
        const label = getCustomerFieldLabel(key);
        doc.text(`${label}: ${value}`, 18, y);
        y += 6;
      });
    }
    y += 4;
    // Reference message above table
    let rfqRef = `Reference to your request for quote (file: ${fileName}),\nwe are sending you the detailed quote as follows.`;
    doc.setFontSize(10);
    doc.text(doc.splitTextToSize(rfqRef, pageWidth - 28), 14, y);
    y += 10;
    // Final Pricing Table
    if (finalPricing && finalPricing.length > 0) {
      const columns = Object.keys(finalPricing[0]);
      const data = finalPricing.map(row => columns.map(col => row[col]));
      autoTable(doc, {
        startY: y,
        head: [columns],
        body: data,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [41, 128, 185], textColor: 255 },
        alternateRowStyles: { fillColor: [245, 245, 245] },
        margin: { left: 14, right: 14 },
      });
      y = (doc as any).lastAutoTable.finalY + 8;
    }
    // Message below the table
    const belowMsg =
      'Les prix sont valables pour une période de deux mois. En cas de révision des prix avant cette période, nous vous enverrons un devis mis à jour. Si vous avez des questions, veuillez contacter le signataire mentionné ci-dessous et nous serons ravis de vous répondre avec les clarifications nécessaires.';
    doc.setFontSize(10);
    doc.text(doc.splitTextToSize(belowMsg, pageWidth - 28), 14, y);
    y += 16;
    // Footer
    const footerY = doc.internal.pageSize.getHeight() - 15;
    doc.setFontSize(9);
    doc.setTextColor(150);
    doc.text('Thank you!', 14, footerY);
    // Use fileName for PDF if available
    const safeFileName = fileName ? fileName.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '_') : 'invoice';
    doc.save(`${safeFileName}_quote.pdf`);
  };

  return (
    <button
      onClick={handleDownload}
      className="px-5 py-2 rounded-lg bg-gradient-to-r from-yellow-600 to-yellow-500 text-white font-semibold shadow hover:from-yellow-700 hover:to-yellow-600 transition"
    >
      <i className="fas fa-file-invoice mr-2"></i>Download Quote
    </button>
  );
};

export default InvoiceDownload;
