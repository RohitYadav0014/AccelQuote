export const convertToMarkdown = (data: any): string => {
    if (!data) return '';

    const formatTitle = (key: string): string => {
        return key
            // Replace underscores with spaces
            .replace(/_/g, ' ')
            // Handle special cases like ID, USD
            .replace(/\b(id|usd|cnp|lp)\b/gi, match => match.toUpperCase())
            // Convert camelCase to spaces
            .replace(/([A-Z])/g, ' $1')
            // Trim extra spaces and capitalize first letter of each word
            .split(' ')
            .filter(word => word.length > 0)
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    };

    const createMarkdown = (obj: any, depth = 0): string => {
        let markdown = '';
        const indent = '  '.repeat(depth);

        for (const [key, value] of Object.entries(obj)) {
            if (value === null || value === undefined) continue;

            const title = formatTitle(key);

            if (typeof value === 'object' && !Array.isArray(value)) {
                markdown += `${indent}### ${title}\n\n`;
                markdown += createMarkdown(value, depth + 1);
            } else if (Array.isArray(value)) {
                markdown += `${indent}### ${title}\n\n`;
                value.forEach((item, index) => {
                    if (typeof item === 'object') {
                        markdown += `${indent}- Item ${index + 1}:\n`;
                        markdown += createMarkdown(item, depth + 1);
                    } else {
                        markdown += `${indent}- ${item}\n`;
                    }
                });
                markdown += '\n';
            } else {
                // Format currency values
                let formattedValue = value;
                if (typeof value === 'number' && (key.toLowerCase().includes('price') || key.toLowerCase().includes('lp'))) {
                    formattedValue = value.toLocaleString('en-US', { 
                        style: 'currency', 
                        currency: 'USD',
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                    });
                }
                markdown += `${indent}**${title}**: ${formattedValue}\n\n`;
            }
        }
        return markdown;
    };

    const timestamp = new Date().toLocaleString();
    let markdown = `# Extraction Results\n\n`;
    markdown += `*Generated on: ${timestamp}*\n\n`;
    markdown += createMarkdown(data);
    return markdown;
};

export const downloadMarkdown = (markdown: string, filename: string) => {
    try {
        if (!markdown.trim()) {
            throw new Error('Cannot download empty markdown content');
        }

        // Ensure filename has .md extension
        const finalFilename = filename.endsWith('.md') ? filename : `${filename}.md`;

        // Create blob with markdown content
        const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
        const url = URL.createObjectURL(blob);

        // Create temporary link element
        const link = document.createElement('a');
        link.style.display = 'none';
        link.href = url;
        link.download = finalFilename;

        // Add to document, trigger click, and cleanup
        document.body.appendChild(link);
        link.click();
        
        // Cleanup with longer timeout to ensure download starts
        setTimeout(() => {
            if (document.body.contains(link)) {
                document.body.removeChild(link);
            }
            URL.revokeObjectURL(url);
        }, 1000);

        return true;
    } catch (err) {
        console.error('Error downloading markdown:', err);
        throw new Error(
            err instanceof Error 
                ? err.message 
                : 'Failed to download markdown file'
        );
    }
};
