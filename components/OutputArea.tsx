import React, { useState } from 'react';
import { ICONS } from '../constants';
import { Button } from './Button';
import ReactMarkdown from 'react-markdown';

interface OutputAreaProps {
  translation?: string;
  summary?: string;
  isLoading: boolean;
  error?: string;
}

export const OutputArea: React.FC<OutputAreaProps> = ({ translation, summary, isLoading, error }) => {
  const [activeTab, setActiveTab] = useState<'translation' | 'summary'>('translation');

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleDownload = (text: string, filename: string) => {
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (error) {
    return (
      <div className="h-full flex items-center justify-center border-2 border-dashed border-red-200 bg-red-50 rounded-lg p-8">
        <div className="text-center text-red-600">
           <p className="font-semibold text-lg mb-2">Processing Error</p>
           <p>{error}</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="h-full flex flex-col items-center justify-center border border-slate-200 bg-slate-50 rounded-lg">
        <div className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mb-4"></div>
        <p className="text-slate-500 font-medium animate-pulse">Processing content...</p>
        <p className="text-slate-400 text-sm mt-2">Translating to professional Arabic</p>
      </div>
    );
  }

  if (!translation && !summary) {
    return (
      <div className="h-full flex flex-col items-center justify-center border-2 border-dashed border-slate-200 bg-slate-50/50 rounded-lg text-slate-400">
        <ICONS.Book className="w-12 h-12 mb-3 opacity-20" />
        <p>Output will appear here</p>
      </div>
    );
  }

  // Determine which content to show
  const hasBoth = translation && summary;
  const currentContent = activeTab === 'translation' ? translation : summary;
  
  // If we only have summary but tab is translation, switch tab (and vice versa)
  if (!translation && summary && activeTab === 'translation') setActiveTab('summary');
  if (translation && !summary && activeTab === 'summary') setActiveTab('translation');

  return (
    <div className="flex flex-col h-full bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
      {/* Output Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-200">
        <div className="flex space-x-1">
          {translation && (
            <button
              onClick={() => setActiveTab('translation')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'translation' 
                  ? 'bg-white text-emerald-800 shadow-sm ring-1 ring-slate-200' 
                  : 'text-slate-600 hover:bg-slate-200/50'
              }`}
            >
              Translation
            </button>
          )}
          {summary && (
            <button
              onClick={() => setActiveTab('summary')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'summary' 
                  ? 'bg-white text-emerald-800 shadow-sm ring-1 ring-slate-200' 
                  : 'text-slate-600 hover:bg-slate-200/50'
              }`}
            >
              Summary
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
           <Button 
             variant="ghost" 
             size="sm" 
             onClick={() => currentContent && handleCopy(currentContent)}
             title="Copy to clipboard"
           >
             <ICONS.Copy className="w-4 h-4" />
           </Button>
           <Button 
             variant="ghost" 
             size="sm" 
             onClick={() => currentContent && handleDownload(currentContent, `amzgaro_${activeTab}_${Date.now()}.txt`)}
             title="Download TXT"
           >
             <ICONS.Download className="w-4 h-4" />
           </Button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-auto p-6 bg-white" dir="rtl">
        <div className="prose prose-lg prose-emerald max-w-none font-arabic-body leading-loose text-slate-800">
           {currentContent ? (
             <ReactMarkdown>{currentContent}</ReactMarkdown>
           ) : (
             <p className="text-slate-400 text-center mt-10">No content available.</p>
           )}
        </div>
      </div>
      
      <div className="bg-slate-50 px-4 py-2 border-t border-slate-200 text-xs text-slate-500 text-center flex justify-between">
        <span>Generated by Amzgaro AI</span>
        <span>Modern Standard Arabic</span>
      </div>
    </div>
  );
};