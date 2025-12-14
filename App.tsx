import React, { useState } from 'react';
import { ICONS, APP_NAME, APP_TAGLINE } from './constants';
import { InputMode, SummaryType, ProcessingOptions, FileData, ProcessingResult } from './types';
import { processContent } from './services/geminiService';
import { InputArea } from './components/InputArea';
import { OutputArea } from './components/OutputArea';
import { Button } from './components/Button';

export default function App() {
  // State
  const [inputMode, setInputMode] = useState<InputMode>(InputMode.TEXT);
  const [textInput, setTextInput] = useState('');
  const [selectedFile, setSelectedFile] = useState<FileData | null>(null);
  
  const [processingOptions, setProcessingOptions] = useState<ProcessingOptions>({
    translate: true,
    summarize: false,
    summaryType: SummaryType.CONCISE
  });
  
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [result, setResult] = useState<ProcessingResult>({});

  // Handlers
  const handleProcess = async () => {
    if (!textInput.trim()) return;

    setStatus('loading');
    setResult({});

    try {
      const isUrl = inputMode === InputMode.YOUTUBE;
      const response = await processContent(textInput, isUrl, processingOptions);
      
      setResult({
        translation: response.translation,
        summary: response.summary
      });
      setStatus('success');
    } catch (err: any) {
      setResult({ error: err.message || "An unexpected error occurred." });
      setStatus('error');
    }
  };

  const reset = () => {
    setTextInput('');
    setSelectedFile(null);
    setResult({});
    setStatus('idle');
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50">
      
      {/* Header */}
      <header className="bg-emerald-900 text-white shadow-lg z-10">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-amber-500 p-1.5 rounded-lg text-emerald-950">
               <ICONS.Book className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight font-arabic-heading">{APP_NAME}</h1>
              <p className="text-emerald-300 text-xs hidden sm:block">{APP_TAGLINE}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
             {/* Optional: User profile or extra links could go here */}
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <main className="flex-1 overflow-hidden flex flex-col md:flex-row max-w-7xl mx-auto w-full p-4 gap-4">
        
        {/* Left Column: Input & Controls */}
        <div className="flex flex-col w-full md:w-1/2 lg:w-5/12 gap-4 h-full overflow-hidden">
          
          {/* Mode Selector */}
          <div className="bg-white p-1 rounded-lg border border-slate-200 shadow-sm flex shrink-0">
            <button
              onClick={() => { setInputMode(InputMode.TEXT); reset(); }}
              className={`flex-1 py-2 text-sm font-medium rounded-md flex items-center justify-center gap-2 transition-all ${
                inputMode === InputMode.TEXT 
                ? 'bg-emerald-100 text-emerald-800 shadow-sm' 
                : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <ICONS.File className="w-4 h-4" /> Document / Text
            </button>
            <button
              onClick={() => { setInputMode(InputMode.YOUTUBE); reset(); }}
              className={`flex-1 py-2 text-sm font-medium rounded-md flex items-center justify-center gap-2 transition-all ${
                inputMode === InputMode.YOUTUBE 
                ? 'bg-red-50 text-red-700 shadow-sm' 
                : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <ICONS.Youtube className="w-4 h-4" /> YouTube Video
            </button>
          </div>

          {/* Options Panel */}
          <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm shrink-0">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Output Configuration</h3>
            <div className="space-y-3">
              <label className="flex items-center space-x-3 cursor-pointer group">
                <input 
                  type="checkbox" 
                  checked={processingOptions.translate}
                  onChange={(e) => setProcessingOptions(prev => ({ ...prev, translate: e.target.checked }))}
                  className="w-4 h-4 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500 transition-colors"
                />
                <span className="text-sm text-slate-700 group-hover:text-emerald-900">Translate to Modern Standard Arabic</span>
              </label>

              <div className="flex items-start space-x-3">
                <div className="pt-1">
                   <input 
                    type="checkbox" 
                    checked={processingOptions.summarize}
                    onChange={(e) => setProcessingOptions(prev => ({ ...prev, summarize: e.target.checked }))}
                    className="w-4 h-4 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500 transition-colors"
                  />
                </div>
                <div className="flex-1">
                  <span className="text-sm text-slate-700 block mb-2 cursor-pointer" onClick={() => setProcessingOptions(prev => ({ ...prev, summarize: !prev.summarize }))}>Generate Summary</span>
                  
                  {processingOptions.summarize && (
                    <div className="flex items-center gap-2 pl-1 animate-in slide-in-from-top-2 duration-200">
                      <button 
                        onClick={() => setProcessingOptions(prev => ({ ...prev, summaryType: SummaryType.CONCISE }))}
                        className={`text-xs px-2 py-1 rounded border ${
                          processingOptions.summaryType === SummaryType.CONCISE 
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
                          : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                        }`}
                      >
                        Concise
                      </button>
                      <button 
                         onClick={() => setProcessingOptions(prev => ({ ...prev, summaryType: SummaryType.DETAILED }))}
                         className={`text-xs px-2 py-1 rounded border ${
                          processingOptions.summaryType === SummaryType.DETAILED 
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
                          : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                        }`}
                      >
                        Detailed
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Input Area */}
          <div className="flex-1 bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex flex-col min-h-[200px]">
            <InputArea 
              mode={inputMode}
              textInput={textInput}
              onTextChange={setTextInput}
              onFileSelect={setSelectedFile}
              selectedFile={selectedFile}
            />
          </div>

          {/* Action Button */}
          <div className="shrink-0">
            <Button 
              className="w-full h-12 text-lg shadow-emerald-900/10" 
              onClick={handleProcess}
              isLoading={status === 'loading'}
              disabled={!textInput.trim() || (!processingOptions.translate && !processingOptions.summarize)}
            >
              {status === 'loading' ? 'Processing...' : 'Start Translation'}
            </Button>
          </div>
        </div>

        {/* Right Column: Output */}
        <div className="flex flex-col w-full md:w-1/2 lg:w-7/12 h-full">
           <OutputArea 
             translation={result.translation}
             summary={result.summary}
             isLoading={status === 'loading'}
             error={result.error}
           />
        </div>
      </main>
    </div>
  );
}