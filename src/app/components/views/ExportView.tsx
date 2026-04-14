import { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { Download, FileText, FileSpreadsheet, Calendar, CheckCircle } from 'lucide-react';
import { EmptyState } from '../EmptyState';
import { ReviewData } from '../../../api/client';

interface ExportViewProps {
  reviews?: ReviewData[];
  appId?: string;
}

// ── CSV export ────────────────────────────────────────────────────────────────

function exportCSV(data: ReviewData[], filename: string) {
  const esc = (v: string | number) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const headers = ['Date', 'Author', 'Rating', 'Review', 'Version', 'Thumbs Up', 'Sentiment', 'Developer Reply'];
  const rows = data.map(r => [
    r.date,
    esc(r.author ?? ''),
    r.rating,
    esc(r.review ?? ''),
    esc(r.app_version ?? ''),
    r.thumbs_up,
    r.sentiment,
    esc(r.reply ?? ''),
  ].join(','));

  const csv = '\ufeff' + [headers.join(','), ...rows].join('\n'); // BOM for Excel UTF-8
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  triggerDownload(blob, filename + '.csv');
}

// ── Excel (SpreadsheetML / .xls) — no external deps ──────────────────────────

function exportExcel(data: ReviewData[], filename: string) {
  const x = (v: string | number) =>
    String(v ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  const headers = ['Date', 'Author', 'Rating', 'Review', 'Version', 'Thumbs Up', 'Sentiment', 'Developer Reply'];

  const headerRow = headers
    .map(h => `<Cell><Data ss:Type="String">${h}</Data></Cell>`)
    .join('');

  const dataRows = data
    .map(r => {
      const cells = [
        r.date, r.author ?? '', String(r.rating), r.review ?? '',
        r.app_version ?? '', String(r.thumbs_up), r.sentiment, r.reply ?? '',
      ];
      return (
        '<Row>' +
        cells.map(v => `<Cell><Data ss:Type="String">${x(v)}</Data></Cell>`).join('') +
        '</Row>'
      );
    })
    .join('');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
 <Styles>
  <Style ss:ID="header">
   <Font ss:Bold="1"/>
   <Interior ss:Color="#EEF2FF" ss:Pattern="Solid"/>
  </Style>
 </Styles>
 <Worksheet ss:Name="Reviews">
  <Table>
   <Row>${headerRow}</Row>
   ${dataRows}
  </Table>
 </Worksheet>
</Workbook>`;

  const blob = new Blob([xml], { type: 'application/vnd.ms-excel;charset=utf-8' });
  triggerDownload(blob, filename + '.xls');
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a   = document.createElement('a');
  a.href     = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ── Component ─────────────────────────────────────────────────────────────────

export function ExportView({ reviews, appId }: ExportViewProps) {
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo,   setDateTo]   = useState('');
  const [format,   setFormat]   = useState<'csv' | 'excel'>('csv');
  const [exported, setExported] = useState(false);

  const hasData = reviews && reviews.length > 0;

  // Bounds of available data
  const bounds = useMemo(() => {
    if (!hasData) return { min: '', max: '' };
    const dates = reviews!.map(r => r.date).filter(d => d && d !== 'N/A').sort();
    return { min: dates[0] ?? '', max: dates[dates.length - 1] ?? '' };
  }, [reviews, hasData]);

  const filtered = useMemo(() => {
    if (!hasData) return [];
    return reviews!.filter(r => {
      if (dateFrom && r.date < dateFrom) return false;
      if (dateTo   && r.date > dateTo)   return false;
      return true;
    });
  }, [reviews, dateFrom, dateTo, hasData]);

  const handleExport = () => {
    if (filtered.length === 0) return;
    const safe    = (appId ?? 'reviews').replace(/[^a-zA-Z0-9_]/g, '_');
    const stamp   = new Date().toISOString().split('T')[0];
    const name    = `${safe}_reviews_${stamp}`;
    if (format === 'csv') exportCSV(filtered, name);
    else                  exportExcel(filtered, name);
    setExported(true);
    setTimeout(() => setExported(false), 3000);
  };

  // Breakdown for preview
  const sentimentBreakdown = useMemo(() => {
    const pos = filtered.filter(r => r.sentiment === 'positive').length;
    const neg = filtered.filter(r => r.sentiment === 'negative').length;
    const neu = filtered.filter(r => r.sentiment === 'neutral').length;
    return { pos, neg, neu };
  }, [filtered]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl mb-2 flex items-center gap-3" style={{ fontWeight: 700 }}>
          <Download className="w-7 h-7 text-indigo-600" />
          Export Reviews
        </h1>
        <p className="text-muted-foreground">Download all reviews as CSV or Excel with optional date filtering</p>
      </div>

      {!hasData ? (
        <EmptyState
          icon={Download}
          title="No Reviews to Export"
          description="Analyze a Play Store app first to load reviews, then come back here to export them."
          hint="Paste a URL above → click Analyze"
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left: controls */}
          <div className="lg:col-span-2 space-y-5">

            {/* Date range card */}
            <div className="p-6 glass rounded-2xl border border-white/60 shadow-lg">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-5 h-5 text-indigo-600" />
                <h3 className="text-lg" style={{ fontWeight: 700 }}>Date Range</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Available data: {bounds.min || '—'} → {bounds.max || '—'}
              </p>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <div className="flex-1 w-full">
                  <label className="text-xs text-muted-foreground mb-1 block">From</label>
                  <input
                    type="date"
                    value={dateFrom}
                    min={bounds.min}
                    max={dateTo || bounds.max}
                    onChange={e => setDateFrom(e.target.value)}
                    className="w-full px-3 py-2.5 bg-white/60 rounded-xl border border-white/80 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  />
                </div>
                <span className="text-sm text-muted-foreground pt-5 hidden sm:block">to</span>
                <div className="flex-1 w-full">
                  <label className="text-xs text-muted-foreground mb-1 block">To</label>
                  <input
                    type="date"
                    value={dateTo}
                    min={dateFrom || bounds.min}
                    max={bounds.max}
                    onChange={e => setDateTo(e.target.value)}
                    className="w-full px-3 py-2.5 bg-white/60 rounded-xl border border-white/80 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  />
                </div>
                {(dateFrom || dateTo) && (
                  <button
                    onClick={() => { setDateFrom(''); setDateTo(''); }}
                    className="px-3 py-2.5 bg-white/40 rounded-xl border border-white/60 text-sm hover:bg-white/60 transition-colors mt-5"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Format card */}
            <div className="p-6 glass rounded-2xl border border-white/60 shadow-lg">
              <h3 className="text-lg mb-4" style={{ fontWeight: 700 }}>Export Format</h3>
              <div className="grid grid-cols-2 gap-3">
                {/* CSV option */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setFormat('csv')}
                  className={`p-4 rounded-xl border-2 transition-all text-left ${
                    format === 'csv'
                      ? 'border-indigo-500 bg-indigo-500/10'
                      : 'border-white/60 bg-white/40 hover:bg-white/60'
                  }`}
                >
                  <FileText className={`w-7 h-7 mb-2 ${format === 'csv' ? 'text-indigo-600' : 'text-muted-foreground'}`} />
                  <p className="text-sm" style={{ fontWeight: 600 }}>CSV</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Works in Excel, Google Sheets, Numbers</p>
                </motion.button>

                {/* Excel option */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setFormat('excel')}
                  className={`p-4 rounded-xl border-2 transition-all text-left ${
                    format === 'excel'
                      ? 'border-emerald-500 bg-emerald-500/10'
                      : 'border-white/60 bg-white/40 hover:bg-white/60'
                  }`}
                >
                  <FileSpreadsheet className={`w-7 h-7 mb-2 ${format === 'excel' ? 'text-emerald-600' : 'text-muted-foreground'}`} />
                  <p className="text-sm" style={{ fontWeight: 600 }}>Excel (.xls)</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Opens directly in Microsoft Excel</p>
                </motion.button>
              </div>
            </div>

            {/* Export button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleExport}
              disabled={filtered.length === 0}
              className={`w-full py-4 rounded-xl shadow-lg flex items-center justify-center gap-3 text-base transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                exported
                  ? 'bg-emerald-500 text-white'
                  : 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white glow-primary'
              }`}
              style={{ fontWeight: 700 }}
            >
              {exported ? (
                <>
                  <CheckCircle className="w-5 h-5" />
                  Downloaded!
                </>
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  Download {filtered.length.toLocaleString()} Reviews
                  {format === 'csv' ? ' (.csv)' : ' (.xls)'}
                </>
              )}
            </motion.button>
          </div>

          {/* Right: preview summary */}
          <div className="space-y-4">
            <div className="p-5 glass rounded-2xl border border-white/60 shadow-lg">
              <h3 className="text-base mb-4" style={{ fontWeight: 700 }}>Export Preview</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total reviews</span>
                  <span style={{ fontWeight: 700 }}>{filtered.length.toLocaleString()}</span>
                </div>
                <div className="h-px bg-white/40" />
                <div className="flex justify-between text-sm">
                  <span className="text-emerald-600">Positive</span>
                  <span style={{ fontWeight: 600 }}>{sentimentBreakdown.pos.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Neutral</span>
                  <span style={{ fontWeight: 600 }}>{sentimentBreakdown.neu.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-rose-600">Negative</span>
                  <span style={{ fontWeight: 600 }}>{sentimentBreakdown.neg.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Columns info */}
            <div className="p-5 glass rounded-2xl border border-white/60 shadow-lg">
              <h3 className="text-base mb-3" style={{ fontWeight: 700 }}>Columns Included</h3>
              <ul className="space-y-1.5 text-sm text-muted-foreground">
                {['Date', 'Author', 'Rating', 'Review', 'Version', 'Thumbs Up', 'Sentiment', 'Developer Reply'].map(col => (
                  <li key={col} className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                    {col}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
