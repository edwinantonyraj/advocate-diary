import React, { useState } from 'react';
import { Case, Client } from '../types';
import { WebsiteSync } from './WebsiteSync';
import { ArrowLeftRight, Download, Upload, FileSpreadsheet, Database, CheckCircle2, AlertCircle, RefreshCw, Sparkles, FileText, Globe } from 'lucide-react';

interface DataImporterProps {
  onImportData: (cases: Case[], clients: Client[]) => void;
  currentCases: Case[];
  currentClients: Client[];
}

export const DataImporter: React.FC<DataImporterProps> = ({
  onImportData,
  currentCases,
  currentClients,
}) => {
  const [activeImportMode, setActiveImportMode] = useState<'website' | 'ai' | 'file' | 'sample'>('website');
  const [rawText, setRawText] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // AI Smart Converter for WordPress / PC Exe Text
  const handleAiParse = async () => {
    if (!rawText.trim()) {
      setMessage({ type: 'error', text: 'Please paste WordPress or PC Exe export text first.' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch('/api/ai/parse-import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawText }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to parse import data');
      }

      if ((!data.cases || data.cases.length === 0) && (!data.clients || data.clients.length === 0)) {
        throw new Error('No cases or clients were recognized in the provided text.');
      }

      // Format parsed cases into valid App Case objects
      const importedCases: Case[] = (data.cases || []).map((c: any, index: number) => ({
        id: `imp-case-${Date.now()}-${index}`,
        caseNumber: c.caseNumber || `WP-CASE-${index + 1}`,
        cnrNumber: c.cnrNumber || '',
        caseTitle: c.caseTitle || 'Untitled Case',
        caseType: c.caseType || 'Civil Suit',
        courtName: c.courtName || 'District Court',
        courtHall: c.courtHall || 'Court Hall 1',
        judgeName: c.judgeName || '',
        itemNumber: c.itemNumber || '',
        clientRole: c.clientRole || 'Petitioner/Plaintiff',
        clientId: `imp-cli-${index}`,
        clientName: c.clientName || 'Client',
        clientPhone: c.clientPhone || '',
        oppositeParty: c.oppositeParty || 'Opposite Party',
        oppositeLawyer: c.oppositeLawyer || '',
        stage: c.stage || 'Hearing',
        status: c.status === 'Disposed' ? 'Disposed' : 'Pending',
        nextHearingDate: c.nextHearingDate || new Date().toISOString().split('T')[0],
        totalFee: Number(c.totalFee) || 25000,
        paidFee: Number(c.paidFee) || 10000,
        notes: c.notes || 'Imported from WP / PC Exe database.',
        hearingHistory: [],
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0],
      }));

      const importedClients: Client[] = (data.clients || []).map((cli: any, index: number) => ({
        id: `imp-cli-${index}`,
        name: cli.name || 'Client',
        phone: cli.phone || '',
        email: cli.email || '',
        address: cli.address || '',
        createdAt: new Date().toISOString().split('T')[0],
      }));

      onImportData(importedCases, importedClients);
      setMessage({
        type: 'success',
        text: `Successfully converted and imported ${importedCases.length} cases and ${importedClients.length} clients into your Advocate Diary!`,
      });
      setRawText('');
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Error processing import data.' });
    } finally {
      setLoading(false);
    }
  };

  // Direct File Upload (JSON / CSV)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        if (file.name.endsWith('.json')) {
          const parsed = JSON.parse(content);
          const cases = parsed.cases || (Array.isArray(parsed) ? parsed : []);
          const clients = parsed.clients || [];

          if (cases.length > 0) {
            onImportData(cases, clients);
            setMessage({
              type: 'success',
              text: `Imported ${cases.length} cases successfully from JSON file.`,
            });
          } else {
            throw new Error('No cases found in JSON structure');
          }
        } else if (file.name.endsWith('.csv')) {
          // Basic CSV Parser
          const lines = content.split('\n').filter((l) => l.trim().length > 0);
          if (lines.length < 2) throw new Error('CSV file is empty or missing headers');

          const newCases: Case[] = lines.slice(1).map((line, idx) => {
            const cols = line.split(',').map((s) => s.replace(/^"|"$/g, '').trim());
            return {
              id: `csv-case-${Date.now()}-${idx}`,
              caseNumber: cols[0] || `CSV-${idx + 1}`,
              caseTitle: cols[1] || 'Untitled Case',
              courtName: cols[2] || 'District Court',
              clientName: cols[3] || 'Client',
              clientPhone: cols[4] || '',
              oppositeParty: cols[5] || 'Opposite Party',
              stage: cols[6] || 'Pending',
              nextHearingDate: cols[7] || new Date().toISOString().split('T')[0],
              status: 'Pending',
              caseType: 'Civil Suit',
              clientRole: 'Petitioner/Plaintiff',
              clientId: `cli-${idx}`,
              totalFee: Number(cols[8]) || 20000,
              paidFee: Number(cols[9]) || 5000,
              hearingHistory: [],
              createdAt: new Date().toISOString().split('T')[0],
              updatedAt: new Date().toISOString().split('T')[0],
            };
          });

          onImportData(newCases, []);
          setMessage({
            type: 'success',
            text: `Imported ${newCases.length} cases successfully from CSV file!`,
          });
        }
      } catch (err: any) {
        setMessage({ type: 'error', text: 'Failed to parse file: ' + err.message });
      }
    };

    reader.readAsText(file);
  };

  // Export current data as JSON or CSV
  const exportAsJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify({ cases: currentCases, clients: currentClients }, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `advocate_diary_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const exportAsCsv = () => {
    const headers = ['CaseNumber', 'CaseTitle', 'CourtName', 'ClientName', 'ClientPhone', 'OppositeParty', 'Stage', 'NextHearingDate', 'TotalFee', 'PaidFee'];
    const rows = currentCases.map((c) => [
      `"${c.caseNumber}"`,
      `"${c.caseTitle.replace(/"/g, '""')}"`,
      `"${c.courtName}"`,
      `"${c.clientName}"`,
      `"${c.clientPhone}"`,
      `"${c.oppositeParty}"`,
      `"${c.stage}"`,
      `"${c.nextHearingDate}"`,
      c.totalFee,
      c.paidFee,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', encodeURI(csvContent));
    downloadAnchor.setAttribute('download', `advocate_diary_cases_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Banner */}
      <div className="bg-[#0F172A] border border-white/10 p-4 flex items-center justify-between gap-3 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-sky-400/10 text-sky-400 border border-sky-400/30">
            <ArrowLeftRight className="w-6 h-6 text-sky-400" />
          </div>
          <div>
            <h2 className="font-black text-lg text-white uppercase tracking-tight">WORDPRESS PLUGIN & PC EXE MIGRATION TOOL</h2>
            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mt-0.5">
              CONVERT EXISTING ADVOCATE DIARY WEBSITE PLUGIN DATA OR PC SOFTWARE EXPORTS TO MOBILE APP
            </p>
          </div>
        </div>
      </div>

      {/* Mode Selectors */}
      <div className="flex flex-wrap items-center gap-2 bg-[#0F172A] p-2 border border-white/10 text-xs font-black uppercase tracking-wider">
        <button
          onClick={() => setActiveImportMode('website')}
          className={`flex-1 py-2.5 px-3 transition-colors flex items-center justify-center gap-2 min-w-[140px] ${
            activeImportMode === 'website'
              ? 'bg-emerald-400 text-slate-950 font-black'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Globe className="w-4 h-4 stroke-[2.5]" />
          <span>Website Live Sync</span>
        </button>

        <button
          onClick={() => setActiveImportMode('ai')}
          className={`flex-1 py-2.5 px-3 transition-colors flex items-center justify-center gap-2 min-w-[140px] ${
            activeImportMode === 'ai'
              ? 'bg-sky-400 text-slate-950 font-black'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Sparkles className="w-4 h-4 stroke-[2.5]" />
          <span>AI Converter (WP/EXE)</span>
        </button>

        <button
          onClick={() => setActiveImportMode('file')}
          className={`flex-1 py-2.5 px-3 transition-colors flex items-center justify-center gap-2 min-w-[140px] ${
            activeImportMode === 'file'
              ? 'bg-sky-400 text-slate-950 font-black'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Upload className="w-4 h-4 stroke-[2.5]" />
          <span>Upload File (JSON / CSV)</span>
        </button>

        <button
          onClick={() => setActiveImportMode('sample')}
          className={`flex-1 py-2.5 px-3 transition-colors flex items-center justify-center gap-2 min-w-[140px] ${
            activeImportMode === 'sample'
              ? 'bg-sky-400 text-slate-950 font-black'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Download className="w-4 h-4 stroke-[2.5]" />
          <span>Backup & Export</span>
        </button>
      </div>

      {/* Mode 0: Live Website Sync */}
      {activeImportMode === 'website' && (
        <WebsiteSync
          onSyncImport={onImportData}
          currentCases={currentCases}
          currentClients={currentClients}
        />
      )}

      {/* Messages */}
      {message && (
        <div
          className={`p-3 border text-xs uppercase font-bold tracking-wider flex items-center gap-2 ${
            message.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Mode 1: AI Smart Converter */}
      {activeImportMode === 'ai' && (
        <div className="bg-[#0F172A] border border-white/10 p-4 space-y-3 shadow-xl">
          <div className="bg-[#1E293B] p-3 border border-white/10 text-xs space-y-1 uppercase font-bold tracking-wider">
            <span className="font-black text-sky-400 block tracking-widest">HOW TO CONVERT WORDPRESS PLUGIN OR PC EXE DATA:</span>
            <p className="text-slate-300 text-[11px] font-medium leading-relaxed">
              PASTE RAW DATABASE ROWS, CSV TEXT, OR EXPORTED TEXT FROM YOUR WORDPRESS ADVOCATE DIARY WEBSITE PLUGIN OR PC EXE SOFTWARE.
              OUR GEMINI AI PARSER WILL AUTOMATICALLY IDENTIFY CASE NUMBERS, PARTIES, COURTS, NEXT HEARING DATES, AND CLIENT CONTACTS!
            </p>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-300 uppercase tracking-wider mb-1">
              PASTE WORDPRESS / PC EXE EXPORT TEXT:
            </label>
            <textarea
              rows={8}
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder={`EXAMPLE TEXT FROM WP PLUGIN OR PC EXE:
Case No: WP 1042/2024, Client: Rajesh Malhotra (+91 9876543210), Court: Delhi High Court, Stage: Arguments, Next Date: 2026-08-10, Fee: 50000
Case No: OS 88/2023, Title: Suman vs Anita, Court: District Court Jaipur, Stage: Evidence, Next Date: 2026-08-12`}
              className="w-full bg-[#1E293B] border border-white/10 text-white text-xs font-mono p-3 uppercase focus:outline-none focus:border-sky-400"
            />
          </div>

          <button
            onClick={handleAiParse}
            disabled={loading}
            className="w-full py-3 bg-sky-400 hover:bg-sky-300 text-slate-950 font-black uppercase text-xs tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all disabled:opacity-50"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Converting WP / PC Exe Data into Mobile App...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 stroke-[3]" />
                <span>Auto-Convert & Import into Mobile App</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Mode 2: Direct File Upload */}
      {activeImportMode === 'file' && (
        <div className="bg-[#0F172A] border border-white/10 p-6 text-center space-y-4 shadow-xl">
          <div className="w-12 h-12 bg-sky-400/10 text-sky-400 border border-sky-400/30 flex items-center justify-center mx-auto">
            <Upload className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <h3 className="font-black text-base text-white uppercase tracking-tight">UPLOAD JSON OR CSV FILE</h3>
            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest max-w-sm mx-auto mt-1">
              UPLOAD YOUR EXPORTED `.JSON` OR `.CSV` CASE FILE DIRECTLY FROM YOUR PC SOFTWARE OR WORDPRESS DATABASE.
            </p>
          </div>

          <label className="inline-flex items-center gap-2 bg-sky-400 hover:bg-sky-300 text-slate-950 font-black px-5 py-2.5 text-xs uppercase tracking-wider cursor-pointer transition-colors shadow-md">
            <FileSpreadsheet className="w-4 h-4 stroke-[3]" />
            <span>Select File from PC / Mobile</span>
            <input
              type="file"
              accept=".json,.csv"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>
      )}

      {/* Mode 3: Backup & Export */}
      {activeImportMode === 'sample' && (
        <div className="bg-[#0F172A] border border-white/10 p-4 space-y-4 shadow-xl">
          <div>
            <h3 className="font-black text-base text-white uppercase tracking-tight">EXPORT & BACKUP MOBILE DIARY</h3>
            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mt-0.5">
              DOWNLOAD ALL YOUR CASES AND CLIENT RECORDS IN STANDARD FORMAT TO TRANSFER BACK TO PC OR STORE SAFELY.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={exportAsJson}
              className="p-4 bg-[#1E293B] hover:bg-slate-800 border border-white/10 text-left space-y-1 transition-colors uppercase font-bold tracking-wider"
            >
              <div className="flex items-center justify-between">
                <span className="font-black text-xs text-sky-400">EXPORT FULL JSON BACKUP</span>
                <Download className="w-4 h-4 text-sky-400 stroke-[3]" />
              </div>
              <p className="text-[10px] text-slate-400 font-semibold">CONTAINS FULL CASE HISTORY, HEARING LOGS & CLIENT DIRECTORY.</p>
            </button>

            <button
              onClick={exportAsCsv}
              className="p-4 bg-[#1E293B] hover:bg-slate-800 border border-white/10 text-left space-y-1 transition-colors uppercase font-bold tracking-wider"
            >
              <div className="flex items-center justify-between">
                <span className="font-black text-xs text-emerald-400">EXPORT EXCEL / CSV SHEET</span>
                <FileSpreadsheet className="w-4 h-4 text-emerald-400 stroke-[3]" />
              </div>
              <p className="text-[10px] text-slate-400 font-semibold">STANDARD SPREADSHEET COMPATIBLE WITH EXCEL, WP PLUGINS & PC EXE.</p>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
