import { DonationItem } from '../types';

/**
 * Export donations to CSV format
 */
export const exportToCSV = (donations: DonationItem[], filename: string = 'donations') => {
    if (donations.length === 0) {
        alert('No donations to export.');
        return;
    }

    // Define CSV headers
    const headers = [
        'ID',
        'Item Name',
        'Description',
        'Quantity',
        'Category',
        'Donor Name',
        'Donor Phone',
        'Donor Address',
        'Status',
        'Submitted At',
        'Image URLs',
    ];

    // Convert donations to CSV rows
    const rows = donations.map(donation => [
        donation.id,
        `"${donation.itemName.replace(/"/g, '""')}"`,
        `"${donation.description.replace(/"/g, '""')}"`,
        donation.quantity,
        donation.category,
        `"${donation.donorName.replace(/"/g, '""')}"`,
        donation.donorPhoneNumber,
        `"${donation.donorAddress.replace(/"/g, '""')}"`,
        donation.status,
        donation.submittedAt.toISOString(),
        `"${(donation.imageUrls || [donation.imageUrl]).join('; ').replace(/"/g, '""')}"`,
    ]);

    // Combine headers and rows
    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
    ].join('\n');

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
};

/**
 * Export donations to JSON format
 */
export const exportToJSON = (donations: DonationItem[], filename: string = 'donations') => {
    if (donations.length === 0) {
        alert('No donations to export.');
        return;
    }

    const jsonContent = JSON.stringify(donations, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.json`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
};

/**
 * Generate PDF report using browser print functionality
 * This creates a printable report that can be saved as PDF
 */
export const exportToPDF = (donations: DonationItem[], reportType: string = 'donations') => {
    if (donations.length === 0) {
        alert('No donations to export.');
        return;
    }

    // Create a printable HTML report
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
        alert('Please allow popups to generate PDF report.');
        return;
    }

    const currentDate = new Date().toLocaleDateString();
    const reportTitle = reportType === 'donations' ? 'Donations Report' : reportType;

    const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>${reportTitle}</title>
            <style>
                @media print {
                    @page {
                        margin: 1cm;
                    }
                }
                body {
                    font-family: Arial, sans-serif;
                    margin: 20px;
                    color: #333;
                }
                h1 {
                    color: #14b8a6;
                    border-bottom: 2px solid #14b8a6;
                    padding-bottom: 10px;
                }
                .header {
                    margin-bottom: 30px;
                }
                .stats {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 15px;
                    margin-bottom: 30px;
                }
                .stat-card {
                    background: #f5f5f5;
                    padding: 15px;
                    border-radius: 5px;
                    border-left: 4px solid #14b8a6;
                }
                .stat-label {
                    font-size: 12px;
                    color: #666;
                    margin-bottom: 5px;
                }
                .stat-value {
                    font-size: 24px;
                    font-weight: bold;
                    color: #333;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 20px;
                    font-size: 12px;
                }
                th, td {
                    border: 1px solid #ddd;
                    padding: 8px;
                    text-align: left;
                }
                th {
                    background-color: #14b8a6;
                    color: white;
                    font-weight: bold;
                }
                tr:nth-child(even) {
                    background-color: #f9f9f9;
                }
                .footer {
                    margin-top: 30px;
                    padding-top: 20px;
                    border-top: 1px solid #ddd;
                    font-size: 11px;
                    color: #666;
                    text-align: center;
                }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>${reportTitle}</h1>
                <p><strong>Generated:</strong> ${currentDate}</p>
                <p><strong>Total Records:</strong> ${donations.length}</p>
            </div>

            <table>
                <thead>
                    <tr>
                        <th>Item Name</th>
                        <th>Category</th>
                        <th>Quantity</th>
                        <th>Donor</th>
                        <th>Status</th>
                        <th>Submitted Date</th>
                    </tr>
                </thead>
                <tbody>
                    ${donations.map(donation => `
                        <tr>
                            <td>${donation.itemName}</td>
                            <td>${donation.category}</td>
                            <td>${donation.quantity}</td>
                            <td>${donation.donorName}</td>
                            <td>${donation.status}</td>
                            <td>${donation.submittedAt.toLocaleDateString()}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>

            <div class="footer">
                <p>Charity Connect - Donation Management System</p>
                <p>Generated on ${currentDate}</p>
            </div>
        </body>
        </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    // Wait for content to load, then print
    printWindow.onload = () => {
        setTimeout(() => {
            printWindow.print();
        }, 250);
    };
};

