/** Export data array to CSV and trigger download */
export function exportToCSV(data: object[], filename: string): void {
  if (!data.length) return;

  const headers = Object.keys(data[0] as Record<string, unknown>);
  const rows = data.map((row) =>
    headers.map((h) => {
      const val = (row as Record<string, unknown>)[h];
      const str = val === null || val === undefined ? '' : String(val);
      return `"${str.replace(/"/g, '""')}"`;
    }).join(',')
  );

  const csv = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  downloadBlob(blob, `${filename}.csv`);
}

/** Export data to a simple PDF-like HTML document */
export function exportToPDF(title: string, sections: { heading: string; content: string }[], filename: string): void {
  const html = `
    <!DOCTYPE html>
    <html><head>
      <title>${title}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 40px; color: #333; }
        h1 { color: #1d4ed8; border-bottom: 2px solid #1d4ed8; padding-bottom: 10px; }
        h2 { color: #475569; margin-top: 24px; }
        table { width: 100%; border-collapse: collapse; margin-top: 12px; }
        th, td { border: 1px solid #e2e8f0; padding: 8px 12px; text-align: left; font-size: 13px; }
        th { background: #f1f5f9; }
        .meta { color: #64748b; font-size: 12px; margin-bottom: 24px; }
      </style>
    </head><body>
      <h1>${title}</h1>
      <p class="meta">Generated: ${new Date().toLocaleString()} | Smart Parking Management System</p>
      ${sections.map((s) => `<h2>${s.heading}</h2>${s.content}`).join('')}
    </body></html>
  `;

  const blob = new Blob([html], { type: 'text/html' });
  downloadBlob(blob, `${filename}.html`);
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/** Build HTML table from data */
export function buildTable(data: object[]): string {
  if (!data.length) return '<p>No data available</p>';
  const headers = Object.keys(data[0] as Record<string, unknown>);
  return `<table>
    <thead><tr>${headers.map((h) => `<th>${h}</th>`).join('')}</tr></thead>
    <tbody>${data.map((row) =>
      `<tr>${headers.map((h) => `<td>${(row as Record<string, unknown>)[h] ?? ''}</td>`).join('')}</tr>`
    ).join('')}</tbody>
  </table>`;
}
