import React from 'react';
import { X, Settings, Shield, Cpu, Sliders, Sun, Moon } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultModel: string;
  onUpdateDefaultModel: (model: string) => void;
  theme: 'light' | 'dark';
  onUpdateTheme: (theme: 'light' | 'dark') => void;
}

export default function SettingsModal({
  isOpen,
  onClose,
  defaultModel,
  onUpdateDefaultModel,
  theme,
  onUpdateTheme,
}: SettingsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center px-4">
      <div className="bg-white dark:bg-[#1e1e1e] rounded-2xl shadow-2xl w-full max-w-lg border border-neutral-200 dark:border-neutral-800 overflow-hidden animate-in fade-in zoom-in-95 duration-200">

        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-2.5">
            <Settings className="w-5 h-5 text-neutral-800 dark:text-neutral-200" />
            <h3 className="font-semibold text-base text-neutral-900 dark:text-neutral-100">Platform Settings</h3>
          </div>
          <button onClick={onClose} className="p-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Appearance Section */}
          <div className="space-y-3">
            <label className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 uppercase tracking-wider flex items-center gap-2">
              <Sun className="w-4 h-4 text-amber-500" />
              <span>Appearance</span>
            </label>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Select your preferred visual theme for the AI platform workspace.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => onUpdateTheme('light')}
                className={`flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
                  theme === 'light'
                    ? 'border-neutral-900 bg-neutral-50 shadow-xs ring-1 ring-neutral-900 dark:border-neutral-100 dark:bg-neutral-800'
                    : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 bg-white dark:bg-[#242424]'
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 flex items-center justify-center text-amber-500 shadow-2xs">
                  <Sun className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-semibold text-xs text-neutral-900 dark:text-neutral-100">Light Theme</div>
                  <div className="text-[10px] text-neutral-500 dark:text-neutral-400">Clean & minimal</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => onUpdateTheme('dark')}
                className={`flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
                  theme === 'dark'
                    ? 'border-emerald-500 bg-neutral-900 text-white shadow-xs ring-1 ring-emerald-500'
                    : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 bg-white dark:bg-[#242424]'
                }`}
              >
                <div className="w-8 h-8 rounded-lg bg-neutral-800 border border-neutral-700 flex items-center justify-center text-emerald-400 shadow-2xs">
                  <Moon className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-semibold text-xs text-neutral-900 dark:text-neutral-100">Dark Theme</div>
                  <div className="text-[10px] text-neutral-500 dark:text-neutral-400">Immersive dark</div>
                </div>
              </button>
            </div>
          </div>

          {/* AI Provider configuration info */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 uppercase tracking-wider flex items-center gap-2">
              <Cpu className="w-4 h-4 text-emerald-600" />
              <span>AI Provider Architecture</span>
            </label>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              The backend utilizes a modular adapter pattern supporting Mock AI provider, OpenAI-compatible APIs, and self-hosted open-source models.
            </p>
            <div className="p-3 bg-neutral-50 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-700 dark:text-neutral-300 space-y-1">
              <div className="flex justify-between">
                <span className="font-medium">Active Provider:</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">Mock & OpenAI Adapter Ready</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Streaming Protocol:</span>
                <span className="font-semibold">Server-Sent Events (SSE)</span>
              </div>
            </div>
          </div>

          {/* Default Model */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 uppercase tracking-wider flex items-center gap-2">
              <Sliders className="w-4 h-4 text-sky-600" />
              <span>Default AI Model</span>
            </label>
            <select
              value={defaultModel}
              onChange={(e) => onUpdateDefaultModel(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-neutral-50 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900 font-medium text-neutral-900 dark:text-neutral-100"
            >
              <option value="ela-gpt-v4-turbo">Ela GPT v4 Turbo (Default)</option>
              <option value="ela-gpt-v4-reasoner">Ela GPT v4 Reasoner</option>
              <option value="gpt-4o-compatible">GPT-4o (OpenAI Adapter)</option>
              <option value="claude-3-5-sonnet">Claude 3.5 Sonnet (Adapter)</option>
            </select>
          </div>

          {/* Security & Data */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 uppercase tracking-wider flex items-center gap-2">
              <Shield className="w-4 h-4 text-purple-600" />
              <span>Persistence & Database</span>
            </label>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Conversations and messages are securely persisted using SQLAlchemy ORM with PostgreSQL / SQLite.
            </p>
          </div>
        </div>

        <div className="px-6 py-3.5 bg-neutral-50 dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-white bg-neutral-900 dark:bg-neutral-100 dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-white rounded-xl transition-all shadow-sm"
          >
            Save & Close
          </button>
        </div>

      </div>
    </div>
  );
}
