import React, { useState } from 'react';
import {
  X,
  Download,
  Copy,
  Check,
  FileCode,
  FileText,
  FileJson,
} from 'lucide-react';
import { ExamPackage } from '../types/exam';
import {
  formatAsMarkdown,
  formatAsPlainText,
  downloadFile,
} from '../utils/exportFormats';

interface ExportModalProps {
  exam: ExamPackage;
  isOpen: boolean;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  exam,
  isOpen,
  onClose,
}) => {
  const [format, setFormat] = useState<'markdown' | 'text' | 'json'>('markdown');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const getExportContent = () => {
    switch (format) {
      case 'markdown':
        return formatAsMarkdown(exam);
      case 'text':
        return formatAsPlainText(exam);
      case 'json':
        return JSON.stringify(exam, null, 2);
    }
  };

  const content = getExportContent();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard', err);
    }
  };

  const handleDownload = () => {
    const slug = exam.metadata.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .slice(0, 30);

    if (format === 'markdown') {
      downloadFile(content, `${slug}.md`, 'text/markdown');
    } else if (format === 'text') {
      downloadFile(content, `${slug}.txt`, 'text/plain');
    } else {
      downloadFile(content, `${slug}.json`, 'application/json');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl rounded-3xl bg-slate-900 border border-slate-700/80 shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white">
              Export Exam & Quiz Questions
            </h3>
            <p className="text-xs text-slate-400">
              Download or copy questions with verified answer keys for your LMS or docs.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Format Selector */}
        <div className="p-4 bg-slate-950/60 border-b border-slate-800 flex gap-2">
          <button
            onClick={() => setFormat('markdown')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              format === 'markdown'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>Markdown (.md)</span>
          </button>

          <button
            onClick={() => setFormat('text')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              format === 'text'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Plain Text (.txt)</span>
          </button>

          <button
            onClick={() => setFormat('json')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              format === 'json'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileJson className="w-3.5 h-3.5" />
            <span>JSON (.json)</span>
          </button>
        </div>

        {/* Content Preview */}
        <div className="p-4 flex-1 overflow-y-auto bg-slate-950/80">
          <pre className="font-mono text-xs text-slate-300 whitespace-pre-wrap leading-relaxed select-all">
            {content}
          </pre>
        </div>

        {/* Action Footer */}
        <div className="p-4 border-t border-slate-800 flex justify-between gap-3 bg-slate-900">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all active:scale-95"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied to Clipboard!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy to Clipboard</span>
              </>
            )}
          </button>

          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 transition-all active:scale-95"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download File</span>
          </button>
        </div>
      </div>
    </div>
  );
};
