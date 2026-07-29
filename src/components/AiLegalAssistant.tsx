import React, { useState } from 'react';
import { Case } from '../types';
import { Bot, Send, Sparkles, Copy, Check, FileText, BookOpen, AlertCircle, RefreshCw, MessageSquare } from 'lucide-react';

interface AiLegalAssistantProps {
  cases: Case[];
  selectedCaseForAi?: Case | null;
}

export const AiLegalAssistant: React.FC<AiLegalAssistantProps> = ({
  cases,
  selectedCaseForAi,
}) => {
  const [activeAiTab, setActiveAiTab] = useState<'whatsapp' | 'order-format' | 'research'>('whatsapp');
  const [selectedCaseId, setSelectedCaseId] = useState<string>(
    selectedCaseForAi ? selectedCaseForAi.id : cases.length > 0 ? cases[0].id : ''
  );

  const activeCase = cases.find((c) => c.id === selectedCaseId) || cases[0];

  // AI draft states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aiResponse, setAiResponse] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  // Research topic states
  const [researchTopic, setResearchTopic] = useState('Bail grounds in Section 138 Negotiable Instruments Act');
  const [researchFacts, setResearchFacts] = useState('Accused appeared after bailable warrant, cheque amount ₹10 Lakhs, willing to deposit 20% under 143A.');

  const handleGenerateClientDraft = async () => {
    if (!activeCase) return;
    setLoading(true);
    setError(null);
    setAiResponse(null);

    try {
      const res = await fetch('/api/ai/draft-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientName: activeCase.clientName,
          caseTitle: activeCase.caseTitle,
          caseNumber: activeCase.caseNumber,
          courtName: activeCase.courtName,
          lastHearingDate: activeCase.previousHearingDate || 'Today',
          nextHearingDate: activeCase.nextHearingDate,
          stage: activeCase.stage,
          orderSummary: activeCase.notes || 'Matter heard and adjourned to next date.',
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate AI update');
      }

      setAiResponse(data);
    } catch (err: any) {
      setError(err.message || 'Error communicating with AI Assistant');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateResearch = async () => {
    setLoading(true);
    setError(null);
    setAiResponse(null);

    try {
      const res = await fetch('/api/ai/legal-brief', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: researchTopic,
          caseType: activeCase ? activeCase.caseType : 'General Legal',
          keyFacts: researchFacts,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate legal research');
      }

      setAiResponse(data);
    } catch (err: any) {
      setError(err.message || 'Error generating research');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Banner */}
      <div className="bg-[#0F172A] border border-white/10 p-4 flex items-center justify-between gap-3 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-sky-400/10 text-sky-400 border border-sky-400/30">
            <Bot className="w-6 h-6 text-sky-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-black text-lg text-white uppercase tracking-tight">AI LEGAL ADVOCATE ASSISTANT</h2>
              <span className="bg-sky-400 text-slate-950 text-[9px] font-black px-2 py-0.5 uppercase tracking-widest">
                GEMINI 3.6 FLASH
              </span>
            </div>
            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mt-0.5">
              AUTOMATE CLIENT MESSAGES, COURT ORDER SUMMARIES & LEGAL RESEARCH
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 bg-[#0F172A] p-2 border border-white/10 text-xs font-black uppercase tracking-wider">
        <button
          onClick={() => {
            setActiveAiTab('whatsapp');
            setAiResponse(null);
          }}
          className={`flex-1 py-2.5 px-3 transition-colors flex items-center justify-center gap-2 ${
            activeAiTab === 'whatsapp'
              ? 'bg-sky-400 text-slate-950 font-black'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Send className="w-4 h-4 stroke-[2.5]" />
          <span>Client WhatsApp Update</span>
        </button>

        <button
          onClick={() => {
            setActiveAiTab('research');
            setAiResponse(null);
          }}
          className={`flex-1 py-2.5 px-3 transition-colors flex items-center justify-center gap-2 ${
            activeAiTab === 'research'
              ? 'bg-sky-400 text-slate-950 font-black'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <BookOpen className="w-4 h-4 stroke-[2.5]" />
          <span>Legal Case Brief</span>
        </button>
      </div>

      {/* Select Case Context */}
      {cases.length > 0 && (
        <div className="bg-[#0F172A] border border-white/10 p-3 space-y-1">
          <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-widest">Active Case Context:</label>
          <select
            value={selectedCaseId}
            onChange={(e) => setSelectedCaseId(e.target.value)}
            className="w-full bg-[#1E293B] border border-white/10 text-white text-xs font-semibold p-2.5 uppercase focus:outline-none focus:border-sky-400"
          >
            {cases.map((c) => (
              <option key={c.id} value={c.id}>
                {c.caseNumber} - {c.caseTitle} ({c.clientName})
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Tab 1: WhatsApp Client Update */}
      {activeAiTab === 'whatsapp' && (
        <div className="bg-[#0F172A] border border-white/10 p-4 space-y-4 shadow-xl">
          <div className="bg-[#1E293B] p-3 border border-white/10 text-xs space-y-1 uppercase font-bold tracking-wider">
            <span className="text-[9px] text-slate-400 font-black block tracking-widest">SELECTED CASE CONTEXT:</span>
            <p className="font-black text-sky-400 text-sm">{activeCase?.caseTitle}</p>
            <p className="text-slate-300 text-[11px]">
              {activeCase?.caseNumber} | {activeCase?.courtName} | NEXT DATE: <strong className="text-white font-black">{activeCase?.nextHearingDate}</strong>
            </p>
          </div>

          <button
            onClick={handleGenerateClientDraft}
            disabled={loading}
            className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black uppercase text-xs tracking-wider flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 transition-all"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Generating Client Update via Gemini AI...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 stroke-[3]" />
                <span>Draft Professional Client WhatsApp Update</span>
              </>
            )}
          </button>

          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-bold uppercase tracking-wider flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {aiResponse && aiResponse.clientMessage && (
            <div className="space-y-3">
              <div className="bg-[#1E293B] p-4 border border-emerald-500/30 space-y-3">
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <span className="text-xs font-black text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                    <MessageSquare className="w-4 h-4" />
                    <span>WhatsApp / SMS Ready Message</span>
                  </span>
                  <button
                    onClick={() => copyToClipboard(aiResponse.clientMessage)}
                    className="flex items-center gap-1 px-3 py-1 bg-[#0F172A] hover:bg-slate-800 text-white text-[10px] font-black uppercase tracking-wider border border-white/10"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied!' : 'Copy Text'}</span>
                  </button>
                </div>

                <div className="bg-[#0F172A] p-3.5 text-slate-200 text-xs whitespace-pre-wrap font-sans leading-relaxed border border-white/10">
                  {aiResponse.clientMessage}
                </div>

                {activeCase?.clientPhone && (
                  <div className="pt-2 flex justify-end">
                    <a
                      href={`https://wa.me/${activeCase.clientPhone.replace(/\D/g, '')}?text=${encodeURIComponent(
                        aiResponse.clientMessage
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider inline-flex items-center gap-2 shadow-md"
                    >
                      <Send className="w-3.5 h-3.5 stroke-[3]" />
                      <span>Send directly via WhatsApp</span>
                    </a>
                  </div>
                )}
              </div>

              {aiResponse.actionItems && aiResponse.actionItems.length > 0 && (
                <div className="bg-[#1E293B] p-3 border border-white/10 text-xs space-y-1.5 uppercase font-bold tracking-wide">
                  <span className="font-black text-sky-400 block tracking-widest">SUGGESTED ADVOCATE ACTIONS:</span>
                  <ul className="list-disc list-inside text-slate-300 space-y-1">
                    {aiResponse.actionItems.map((item: string, idx: number) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Legal Research & Briefing */}
      {activeAiTab === 'research' && (
        <div className="bg-[#0F172A] border border-white/10 p-4 space-y-3.5 shadow-xl">
          <div>
            <label className="block text-[10px] font-bold text-slate-300 uppercase tracking-wider mb-1">Legal Topic / Section / Question</label>
            <input
              type="text"
              value={researchTopic}
              onChange={(e) => setResearchTopic(e.target.value)}
              placeholder="E.G. INJUNCTION UNDER ORDER 39 RULE 1 & 2 CPC"
              className="w-full bg-[#1E293B] border border-white/10 text-white text-xs font-semibold p-2.5 uppercase focus:outline-none focus:border-sky-400"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-300 uppercase tracking-wider mb-1">Case Facts / Context</label>
            <textarea
              rows={3}
              value={researchFacts}
              onChange={(e) => setResearchFacts(e.target.value)}
              placeholder="PROVIDE KEY FACTS OF THE CASE..."
              className="w-full bg-[#1E293B] border border-white/10 text-white text-xs font-semibold p-2.5 uppercase focus:outline-none focus:border-sky-400"
            />
          </div>

          <button
            onClick={handleGenerateResearch}
            disabled={loading}
            className="w-full py-3 bg-sky-400 hover:bg-sky-300 text-slate-950 font-black uppercase text-xs tracking-wider flex items-center justify-center gap-2 shadow-lg transition-colors disabled:opacity-50"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Analyzing Legal Precedents & Principles...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 stroke-[3]" />
                <span>Generate Legal Case Brief</span>
              </>
            )}
          </button>

          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-bold uppercase tracking-wider flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {aiResponse && aiResponse.summary && (
            <div className="bg-[#1E293B] p-4 border border-white/10 space-y-3 text-xs uppercase font-bold tracking-wide">
              <div>
                <h4 className="font-black text-sky-400 uppercase text-xs mb-1 tracking-wider">LEGAL PRINCIPLES SUMMARY</h4>
                <p className="text-slate-200 leading-relaxed font-normal">{aiResponse.summary}</p>
              </div>

              {aiResponse.keyArguments && (
                <div>
                  <h4 className="font-black text-sky-400 uppercase text-xs mb-1 tracking-wider">KEY COURT ARGUMENTS</h4>
                  <ul className="list-disc list-inside text-slate-300 space-y-1">
                    {aiResponse.keyArguments.map((arg: string, idx: number) => (
                      <li key={idx}>{arg}</li>
                    ))}
                  </ul>
                </div>
              )}

              {aiResponse.precedents && (
                <div>
                  <h4 className="font-black text-sky-400 uppercase text-xs mb-1 tracking-wider">RELEVANT STATUTORY SECTIONS & PRECEDENTS</h4>
                  <ul className="list-disc list-inside text-slate-300 space-y-1">
                    {aiResponse.precedents.map((p: string, idx: number) => (
                      <li key={idx}>{p}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
