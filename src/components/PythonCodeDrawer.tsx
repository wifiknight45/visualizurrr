/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { PatternDefinition, ColorPalette } from '../types/visualizer';
import { X, Copy, Check, Download, Terminal, Sliders, Code2, RotateCcw } from 'lucide-react';
import confetti from 'canvas-confetti';
import Prism from 'prismjs';
import 'prismjs/components/prism-python';

interface PythonCodeDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  pattern: PatternDefinition;
  palette: ColorPalette;
  params: Record<string, number>;
  onParamChange: (key: string, value: number) => void;
  onResetParams: () => void;
}

export const PythonCodeDrawer: React.FC<PythonCodeDrawerProps> = ({
  isOpen,
  onClose,
  pattern,
  palette,
  params,
  onParamChange,
  onResetParams,
}) => {
  const [copied, setCopied] = useState(false);
  const [copyFailed, setCopyFailed] = useState(false);
  const [activeTab, setActiveTab] = useState<'code' | 'params'>('code');

  const pythonSource = pattern.pythonCode(params, palette);

  // The generated scripts never declared their dependencies. Detect the
  // third-party imports actually present and prepend an install line,
  // so display, copy and download all carry a runnable script.
  const detectedDeps = Array.from(
    new Set(
      Array.from(pythonSource.matchAll(/^(?:import|from)\s+([a-zA-Z0-9_]+)/gm)).map(
        (m) => m[1]
      )
    )
  ).filter((m) => m === 'numpy' || m === 'matplotlib' || m === 'scipy');
  const exportSource =
    (detectedDeps.length > 0
      ? `# Requires: pip install ${detectedDeps.join(' ')}\n`
      : '') + pythonSource;

  useEffect(() => {
    if (isOpen) {
      Prism.highlightAll();
    }
  }, [isOpen, exportSource, activeTab]);

  if (!isOpen) return null;

  // Clipboard writes can fail (permissions, insecure origin such as a
  // plain-HTTP dev server). Only celebrate on actual success.
  const copyText = async (text: string): Promise<boolean> => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      return false;
    }
  };

  const handleCopy = async () => {
    if (await copyText(exportSource)) {
      setCopied(true);
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.8 },
      });
      setTimeout(() => setCopied(false), 2000);
    } else {
      setCopyFailed(true);
      setTimeout(() => setCopyFailed(false), 2000);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([exportSource], { type: 'text/x-python' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${pattern.id}_visualizer.py`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    // Revoking synchronously can cancel the download in Safari; give the
    // browser a moment to start it first.
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return (
    <div className="fixed inset-y-0 right-0 z-40 w-full sm:w-[500px] lg:w-[560px] bg-zinc-950 border-l border-zinc-800 shadow-2xl flex flex-col animate-in slide-in-from-right duration-200" role="dialog" aria-modal="true" aria-label="Python code inspector">
      {/* Drawer Header */}
      <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/60">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-400">
            <Code2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono bg-zinc-800 text-zinc-300 px-1.5 py-0.5 rounded">
                Python 3.x
              </span>
              <h2 className="text-sm font-semibold text-white truncate max-w-[220px]">
                {pattern.name}
              </h2>
            </div>
            <p className="text-xs text-zinc-400">Runnable scientific & turtle Python code</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4 py-2 border-b border-zinc-800 bg-zinc-900/30 flex items-center justify-between">
        <div className="flex items-center gap-1 bg-zinc-900 p-0.5 rounded-lg border border-zinc-800">
          <button
            onClick={() => setActiveTab('code')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-colors ${
              activeTab === 'code'
                ? 'bg-zinc-800 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Python Script</span>
          </button>
          <button
            onClick={() => setActiveTab('params')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-colors ${
              activeTab === 'params'
                ? 'bg-zinc-800 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Parameters ({pattern.parameters.length})</span>
          </button>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white transition-colors"
            title="Copy Python Code to Clipboard"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : copyFailed ? 'Copy failed' : 'Copy'}</span>
          </button>

          <button
            onClick={handleDownload}
            className="p-1 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
            title="Download .py script"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Bash CLI Command Tip Box */}
      <div className="px-4 py-2.5 bg-zinc-900/60 border-b border-zinc-800 flex items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-2 text-zinc-400 truncate">
          <Terminal className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span className="text-zinc-500">$</span>
          <span className="text-zinc-300 truncate">
            ./visualizurrr.py --pattern {pattern.number} --palette {palette.id}
          </span>
        </div>
        <button
          onClick={async () => {
            if (
              await copyText(
                `./visualizurrr.py --pattern ${pattern.number} --palette ${palette.id}`
              )
            ) {
              setCopied(true);
              setTimeout(() => setCopied(false), 1500);
            } else {
              setCopyFailed(true);
              setTimeout(() => setCopyFailed(false), 1500);
            }
          }}
          className="text-[10px] text-zinc-400 hover:text-white ml-2 shrink-0 underline"
        >
          Copy CLI
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'code' ? (
          <div className="relative">
            <pre className="p-4 rounded-xl bg-zinc-900/90 border border-zinc-800 text-xs font-mono text-zinc-200 overflow-x-auto leading-relaxed shadow-inner">
              <code className="language-python">{exportSource}</code>
            </pre>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-zinc-400">Live Mathematical Constants</span>
              <button
                onClick={onResetParams}
                className="flex items-center gap-1 text-xs text-zinc-400 hover:text-white"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset Defaults</span>
              </button>
            </div>

            <div className="space-y-3.5">
              {pattern.parameters.map((param) => {
                const val = params[param.id] ?? param.defaultValue;
                return (
                  <div key={param.id} className="p-3 rounded-xl bg-zinc-900/70 border border-zinc-800/80 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-white">{param.name}</span>
                      <span className="font-mono text-sky-400">
                        {val} {param.unit || ''}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min={param.min}
                        max={param.max}
                        step={param.step}
                        value={val}
                        onChange={(e) => onParamChange(param.id, parseFloat(e.target.value))}
                        className="flex-1 accent-sky-400 h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer"
                      />
                      <input
                        type="number"
                        min={param.min}
                        max={param.max}
                        step={param.step}
                        value={val}
                        onChange={(e) => onParamChange(param.id, parseFloat(e.target.value))}
                        className="w-16 px-1.5 py-0.5 text-right text-xs bg-zinc-800 border border-zinc-700 rounded text-white font-mono focus:outline-none focus:border-sky-500"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Footer info */}
      <div className="p-3 border-t border-zinc-800 bg-zinc-950 flex items-center justify-between text-xs text-zinc-500 font-mono">
        <span>Math: {pattern.formula}</span>
        <span>Runs in terminal & browser</span>
      </div>
    </div>
  );
};
