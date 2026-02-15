export const exportToCSV = (transactions) => {
    if (!transactions.length) return;

    const headers = ['Date', 'Description', 'Amount', 'Type', 'Category'];
    const rows = transactions.map(t => [
        t.date,
        `"${t.description}"`, // Quote description to handle commas
        Math.abs(t.amount),
        t.type,
        t.category
    ]);

    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `transactions_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};
