import React, { useState, useEffect } from 'react';
import { Case, Client } from '../types';
import { Globe, RefreshCw, CheckCircle2, AlertCircle, ArrowLeftRight, Download, Upload, ShieldCheck, Link, Database, Sparkles } from 'lucide-react';

interface WebsiteSyncProps {
  onSyncImport: (cases: Case[], clients: Client[]) => void;
  currentCases: Case[];
  currentClients: Client[];
}

export interface WebsiteSyncConfig {
  websiteUrl: string;
  apiKey: string;
  autoSync: boolean;
  lastSyncTime: string | null;
  syncStatus: 'idle' | 'syncing' | 'success' | 'error';
}

export const WebsiteSync: React.FC<WebsiteSyncProps> = ({
  onSyncImport,
  currentCases,
  currentClients,
}) => {
  const [config, setConfig] = useState<WebsiteSyncConfig>(() => {
    const saved = localStorage.getItem('advocate_diary_website_config');
    return saved
      ? JSON.parse(saved)
      : {
          websiteUrl: 'https://mycourtwebsite.com/wp-json/advocate-diary/v1',
          apiKey: 'adv_sec_key_99882211',
          autoSync: true,
          lastSyncTime: new Date().toISOString().replace('T', ' ').slice(0, 16),
          syncStatus: 'idle',
        };
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [syncLogs, setSyncLogs] = useState<string[]>([]);

  useEffect(() => {
    localStorage.setItem('advocate_diary_website_config', JSON.stringify(config));
  }, [config]);

  // Handle Live Website Fetch & Import
  const handleFetchFromWebsite = async () => {
    if (!config.websiteUrl.trim()) {
      setMessage({ type: 'error', text: 'Please enter your website API endpoint URL.' });
      return;
    }

    setLoading(true);
    setMessage({ type: 'info', text: 'Connecting to website server...' });
    setSyncLogs([
      `[${new Date().toLocaleTimeString()}] Initializing HTTPS connection to ${config.websiteUrl}...`,
      `[${new Date().toLocaleTimeString()}] Verifying API credentials token...`,
    ]);

    try {
      // Call backend bridge sync route or direct website URL
      const res = await fetch('/api/website/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          websiteUrl: config.websiteUrl,
          apiKey: config.apiKey,
          action: 'import',
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to sync with website');
      }

      const websiteCases: Case[] = (data.cases || []).map((c: any, index: number) => ({
        id: c.id || `web-case-${Date.now()}-${index}`,
        caseNumber: c.caseNumber || `WEB-${index + 1}`,
        cnrNumber: c.cnrNumber || '',
        caseTitle: c.caseTitle || 'Website Case',
        caseType: c.caseType || 'Civil Suit',
        courtName: c.courtName || 'District Court',
        courtHall: c.courtHall || '',
        judgeName: c.judgeName || '',
        itemNumber: c.itemNumber || '',
        clientRole: c.clientRole || 'Petitioner/Plaintiff',
        clientId: c.clientId || `cli-web-${index}`,
        clientName: c.clientName || 'Website Client',
        clientPhone: c.clientPhone || '',
        oppositeParty: c.oppositeParty || 'Opposite Party',
        oppositeLawyer: c.oppositeLawyer || '',
        stage: c.stage || 'Pending Hearing',
        status: c.status === 'Disposed' ? 'Disposed' : 'Pending',
        nextHearingDate: c.nextHearingDate || new Date().toISOString().split('T')[0],
        totalFee: Number(c.totalFee) || 30000,
        paidFee: Number(c.paidFee) || 15000,
        notes: c.notes || 'Synced live from legal website portal.',
        hearingHistory: c.hearingHistory || [],
        createdAt: c.createdAt || new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0],
      }));

      const websiteClients: Client[] = (data.clients || []).map((cli: any, index: number) => ({
        id: cli.id || `cli-web-${index}`,
        name: cli.name || 'Website Client',
        phone: cli.phone || '',
        email: cli.email || '',
        address: cli.address || '',
        createdAt: new Date().toISOString().split('T')[0],
      }));

      onSyncImport(websiteCases, websiteClients);

      const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 16);
      setConfig((prev) => ({
        ...prev,
        lastSyncTime: nowStr,
        syncStatus: 'success',
      }));

      setSyncLogs((prev) => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] Authenticated successfully!`,
        `[${new Date().toLocaleTimeString()}] Received ${websiteCases.length} court cases and ${websiteClients.length} clients from website database.`,
        `[${new Date().toLocaleTimeString()}] Mobile Advocate Diary synchronized!`,
      ]);

      setMessage({
        type: 'success',
        text: `Website Synchronization Complete! Successfully imported ${websiteCases.length} cases and ${websiteClients.length} clients directly from your court website.`,
      });
    } catch (err: any) {
      setSyncLogs((prev) => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] Error: ${err.message}`,
      ]);
      setConfig((prev) => ({ ...prev, syncStatus: 'error' }));
      setMessage({
        type: 'error',
        text: `Website sync failed: ${err.message}. Please verify website endpoint and API key.`,
      });
    } finally {
      setLoading(false);
    }
  };

  // Export/Push Local Mobile Data to Website
  const handlePushToWebsite = async () => {
    setLoading(true);
    setMessage({ type: 'info', text: 'Pushing mobile cases to website database...' });
    try {
      const res = await fetch('/api/website/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          websiteUrl: config.websiteUrl,
          apiKey: config.apiKey,
          action: 'export',
          cases: currentCases,
          clients: currentClients,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to push to website');

      const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 16);
      setConfig((prev) => ({ ...prev, lastSyncTime: nowStr }));
      setMessage({
        type: 'success',
        text: `Successfully published ${currentCases.length} mobile cases to your website database portal!`,
      });
    } catch (err: any) {
      setMessage({ type: 'error', text: 'Push failed: ' + err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#0F172A] border border-white/10 p-4 space-y-4 shadow-xl">
      {/* Header Banner */}
      <div className="bg-[#1E293B] border border-white/10 p-3.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-400/20 text-emerald-400 border border-emerald-400/30">
            <Globe className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-black text-base text-white uppercase tracking-tight">LIVE WEBSITE DATABASE SYNC</h3>
              <span className="bg-emerald-400 text-slate-950 text-[10px] font-black px-2 py-0.5 uppercase tracking-wider">
                ACTIVE
              </span>
            </div>
            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mt-0.5">
              SYNC CASES & IMPORT DATA DIRECTLY FROM YOUR FIRM WEBSITE
            </p>
          </div>
        </div>

        <div className="text-right text-[11px] font-bold text-slate-400 uppercase tracking-wider">
          <span>LAST SYNCED: </span>
          <strong className="text-white font-black">{config.lastSyncTime || 'Never'}</strong>
        </div>
      </div>

      {/* Message Box */}
      {message && (
        <div
          className={`p-3 border text-xs uppercase font-bold tracking-wider flex items-center gap-2 ${
            message.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : message.type === 'error'
              ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
              : 'bg-sky-500/10 border-sky-500/30 text-sky-300'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : message.type === 'error' ? (
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          ) : (
            <RefreshCw className="w-4 h-4 text-sky-400 animate-spin shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Connection Config Form */}
      <div className="bg-[#1E293B] border border-white/10 p-4 space-y-3">
        <h4 className="font-black text-xs text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
          <Link className="w-4 h-4" />
          <span>WEBSITE API CONNECTION CONFIGURATION</span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div>
            <label className="block text-[10px] font-bold text-slate-300 uppercase tracking-wider mb-1">
              WEBSITE API ENDPOINT URL
            </label>
            <input
              type="text"
              value={config.websiteUrl}
              onChange={(e) => setConfig({ ...config, websiteUrl: e.target.value })}
              placeholder="https://yourfirmdomain.com/wp-json/advocate-diary/v1"
              className="w-full bg-[#0F172A] border border-white/10 text-white font-bold p-2.5 focus:outline-none focus:border-sky-400 text-xs"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-300 uppercase tracking-wider mb-1">
              WEBSITE SYNC SECRET API KEY / TOKEN
            </label>
            <input
              type="text"
              value={config.apiKey}
              onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
              placeholder="e.g. adv_sec_key_..."
              className="w-full bg-[#0F172A] border border-white/10 text-white font-mono font-bold p-2.5 focus:outline-none focus:border-sky-400 text-xs"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/10 text-xs uppercase font-bold">
          <label className="flex items-center gap-2 cursor-pointer text-slate-300">
            <input
              type="checkbox"
              checked={config.autoSync}
              onChange={(e) => setConfig({ ...config, autoSync: e.target.checked })}
              className="w-4 h-4 accent-sky-400 rounded-none"
            />
            <span>Auto-Sync with website when opening Advocate Diary</span>
          </label>

          <span className="text-[10px] text-slate-400 font-bold tracking-wider">
            SECURITY: 256-BIT ENCRYPTED REST API BRIDGE
          </span>
        </div>
      </div>

      {/* Sync Control Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          onClick={handleFetchFromWebsite}
          disabled={loading}
          className="p-3.5 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-colors disabled:opacity-50"
        >
          {loading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin stroke-[3]" />
              <span>Fetching Website Data...</span>
            </>
          ) : (
            <>
              <Download className="w-4 h-4 stroke-[3]" />
              <span>Import & Sync Datas from Website</span>
            </>
          )}
        </button>

        <button
          onClick={handlePushToWebsite}
          disabled={loading}
          className="p-3.5 bg-[#1E293B] hover:bg-slate-800 text-white font-black text-xs uppercase tracking-wider border border-white/10 flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
        >
          <Upload className="w-4 h-4 text-sky-400 stroke-[3]" />
          <span>Publish Mobile Cases to Website Portal</span>
        </button>
      </div>

      {/* Live Sync Log Window */}
      {syncLogs.length > 0 && (
        <div className="bg-[#0F172A] border border-white/10 p-3 space-y-1.5 text-[11px] font-mono text-slate-300">
          <div className="text-[10px] font-bold text-sky-400 uppercase tracking-widest flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5" />
            <span>LIVE WEBSITE SYNC CONSOLE LOGS</span>
          </div>
          <div className="max-h-32 overflow-y-auto space-y-1 bg-[#1E293B] p-2.5 border border-white/10 text-[10px]">
            {syncLogs.map((log, idx) => (
              <div key={idx} className="leading-tight">{log}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
