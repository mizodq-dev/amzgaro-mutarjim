import React, { useRef, useState } from 'react';
import { InputMode, FileData } from '../types';
import { ICONS } from '../constants';

const MAX_CHARS = 50000;

interface InputAreaProps {
  mode: InputMode;
  textInput: string;
  onTextChange: (text: string) => void;
  onFileSelect: (file: FileData | null) => void;
  selectedFile: FileData | null;
}

export const InputArea: React.FC<InputAreaProps> = ({
  mode,
  textInput,
  onTextChange,
  onFileSelect,
  selectedFile
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [fileWarning, setFileWarning] = useState<string | null>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file: File) => {
    setFileWarning(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      let content = e.target?.result as string;
      if (content.length > MAX_CHARS) {
        content = content.substring(0, MAX_CHARS);
        setFileWarning(`File too large. Content truncated to ${MAX_CHARS.toLocaleString()} characters.`);
      }
      onFileSelect({
        name: file.name,
        type: file.type,
        content: content
      });
      onTextChange(content); // Pre-fill text area for visibility
    };
    reader.readAsText(file);
  };

  const clearFile = () => {
    onFileSelect(null);
    onTextChange('');
    setFileWarning(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  if (mode === InputMode.YOUTUBE) {
    return (
      <div className="flex flex-col h-full space-y-4">
         <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-blue-800 text-sm">
           <p className="font-semibold mb-1 flex items-center gap-2">
             <ICONS.Youtube className="w-4 h-4" /> YouTube Processing
           </p>
           Paste a YouTube URL below. The system will attempt to find the transcript or search for the video's content to generate a translation.
         </div>
        <input
          type="text"
          value={textInput}
          onChange={(e) => onTextChange(e.target.value)}
          placeholder="https://www.youtube.com/watch?v=..."
          className="w-full p-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-shadow"
        />
        <div className="flex-1 bg-slate-50 border border-slate-200 rounded-lg p-8 flex flex-col items-center justify-center text-slate-400">
          <ICONS.Youtube className="w-16 h-16 mb-4 opacity-50" />
          <p>Video content will be processed directly from the link.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full space-y-2">
      <div className="flex items-center justify-between mb-2">
         <label className="text-sm font-medium text-slate-700">Source Content</label>
         <div className="flex items-center gap-2">
            {fileWarning && (
              <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded border border-amber-200">
                {fileWarning}
              </span>
            )}
            {selectedFile && (
              <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-1 rounded-full flex items-center gap-1">
                <ICONS.File className="w-3 h-3" /> {selectedFile.name}
                <button onClick={clearFile} className="ml-1 hover:text-emerald-950">&times;</button>
              </span>
            )}
         </div>
      </div>

      <div className="relative flex-1">
        <textarea
          className="w-full h-full min-h-[300px] p-4 pb-8 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none resize-none transition-shadow font-mono text-sm leading-relaxed"
          placeholder="Paste your text here, or drop a text file..."
          value={textInput}
          maxLength={MAX_CHARS}
          onChange={(e) => onTextChange(e.target.value)}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        />
        
        {/* Drag Overlay */}
        {dragActive && (
          <div 
            className="absolute inset-0 bg-emerald-50 bg-opacity-90 border-2 border-dashed border-emerald-500 rounded-lg flex flex-col items-center justify-center text-emerald-700 z-10"
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <ICONS.File className="w-12 h-12 mb-2" />
            <p className="font-medium">Drop text file here</p>
          </div>
        )}

        <div className="absolute bottom-4 left-4 text-xs text-slate-400 bg-white/80 px-2 py-1 rounded backdrop-blur border border-slate-100 pointer-events-none">
            {textInput.length.toLocaleString()} / {MAX_CHARS.toLocaleString()} characters
        </div>

        <div className="absolute bottom-4 right-4">
           <input 
             type="file" 
             ref={fileInputRef}
             className="hidden" 
             accept=".txt,.md,.json,.csv"
             onChange={handleFileChange}
           />
           <button 
             onClick={() => fileInputRef.current?.click()}
             className="bg-white/90 backdrop-blur shadow-sm border border-slate-200 text-slate-600 hover:text-emerald-700 px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-2"
           >
             <ICONS.File className="w-4 h-4" /> Upload File
           </button>
        </div>
      </div>
    </div>
  );
};