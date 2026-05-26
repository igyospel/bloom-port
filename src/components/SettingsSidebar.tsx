import { ChevronRight, Settings } from 'lucide-react';

export interface ModelOption {
  id: string;
  name: string;
  desc: string;
}

export const MODELS: ModelOption[] = [
  { id: 'mistralai/mistral-small-2603', name: 'BP011 - 3.0', desc: 'latestmodel by bloomport ai' }
];

interface SettingsSidebarProps {
  selectedModel: string;
  setSelectedModel: (modelId: string) => void;
  temperature: number;
  setTemperature: (temp: number) => void;
  contextLength: number;
  setContextLength: (len: number) => void;
  isOpen?: boolean;
}

export default function SettingsSidebar({
  selectedModel,
  setSelectedModel,
  temperature,
  setTemperature,
  contextLength,
  setContextLength,
  isOpen = true
}: SettingsSidebarProps) {
  const activeModel = MODELS.find(m => m.id === selectedModel) || MODELS[0];

  // Helper to map 16K, 64K, 128K, 200K indices to slider value
  const contextValues = [16, 64, 128, 200];
  const getContextIndex = (val: number) => {
    const idx = contextValues.indexOf(val);
    return idx !== -1 ? idx : 2; // default 128K
  };

  const handleContextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const idx = parseInt(e.target.value, 10);
    setContextLength(contextValues[idx]);
  };

  return (
    <aside className={`${isOpen ? 'flex' : 'hidden'} flex-col w-[320px] bg-black text-white h-full overflow-hidden border-l border-white/10 z-10 shrink-0`}>
      {/* Scrollable Container */}
      <div className="flex-1 overflow-y-auto scrollbar-hide p-5 space-y-6">
        
        {/* Model Selection Card */}
        <div className="space-y-3">
          <label className="text-[11px] font-semibold tracking-[0.15em] text-white/40 uppercase">Model</label>
          <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4 space-y-3 hover:border-white/20 transition-all">
            <div className="relative">
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full bg-white/[0.04] border border-white/10 rounded-lg py-2.5 px-3 text-sm text-white/80 focus:outline-none focus:border-white/30 cursor-pointer appearance-none pr-8"
              >
                {MODELS.map((model) => (
                  <option key={model.id} value={model.id} className="bg-neutral-900 text-white">
                    {model.name}
                  </option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-white/40">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                  <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/>
                </svg>
              </div>
            </div>
            <p className="text-[12px] text-white/40 leading-relaxed min-h-[36px]">
              {activeModel.desc}
            </p>
          </div>
        </div>

        {/* Sliders Card */}
        <div className="space-y-5">
          {/* Context Window Slider */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-[11px] font-semibold tracking-[0.15em] text-white/40 uppercase">Context Window</span>
              <span className="text-white/80 font-mono font-medium bg-white/[0.06] px-2 py-0.5 rounded">{contextLength}K</span>
            </div>
            <div className="space-y-1">
              <input
                type="range"
                min="0"
                max="3"
                value={getContextIndex(contextLength)}
                onChange={handleContextChange}
                className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-white"
              />
              <div className="flex justify-between text-[10px] text-white/20 px-0.5 font-mono">
                <span>16K</span>
                <span>64K</span>
                <span>128K</span>
                <span>200K</span>
              </div>
            </div>
          </div>

          {/* Temperature Slider */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-[11px] font-semibold tracking-[0.15em] text-white/40 uppercase">Temperature</span>
              <span className="text-white/80 font-mono font-medium bg-white/[0.06] px-2 py-0.5 rounded">{temperature.toFixed(1)}</span>
            </div>
            <div className="space-y-1">
              <input
                type="range"
                min="0"
                max="2.0"
                step="0.1"
                value={temperature}
                onChange={(e) => setTemperature(parseFloat(e.target.value))}
                className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-white"
              />
              <div className="flex justify-between text-[10px] text-white/20 px-0.5 font-mono">
                <span>0.0</span>
                <span>1.0</span>
                <span>2.0</span>
              </div>
            </div>
          </div>

          {/* Advanced Settings Row */}
          <button className="w-full flex items-center justify-between py-3 border-t border-b border-white/[0.06] hover:bg-white/[0.02] text-xs font-medium text-white/60 hover:text-white transition-colors cursor-pointer group px-1">
            <span className="flex items-center gap-2">
              <Settings className="w-3.5 h-3.5 text-white/40 group-hover:text-white transition-colors" />
              Advanced Settings
            </span>
            <ChevronRight className="w-4 h-4 text-white/30 group-hover:text-white transition-colors" />
          </button>
        </div>

        {/* Usage Stats Card */}
        <div className="space-y-4">
          <label className="text-[11px] font-semibold tracking-[0.15em] text-white/40 uppercase">Usage</label>
          <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4 space-y-4">
            
            {/* Messages Progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-white/50">
                <span>Messages</span>
                <span className="font-mono text-white/80 font-medium">128 <span className="text-white/30">/ 500</span></span>
              </div>
              <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                <div className="bg-white h-full rounded-full transition-all duration-300" style={{ width: '25.6%' }} />
              </div>
            </div>

            {/* Tokens Progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-white/50">
                <span>Tokens</span>
                <span className="font-mono text-white/80 font-medium">45K <span className="text-white/30">/ 200K</span></span>
              </div>
              <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                <div className="bg-white h-full rounded-full transition-all duration-300" style={{ width: '22.5%', background: 'linear-gradient(90deg, #ffffff 0%, rgba(255,255,255,0.4) 100%)' }} />
              </div>
            </div>

            <div className="flex justify-between items-center pt-1 text-[11px] text-white/30">
              <span>Resets in 3 days</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>

          </div>
        </div>

      </div>
    </aside>
  );
}
