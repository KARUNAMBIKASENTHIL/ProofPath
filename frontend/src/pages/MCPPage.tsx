import React, { useState, useEffect } from 'react';
import { Cpu, Terminal, Play, CheckCircle2, ShieldCheck, ExternalLink, Code } from 'lucide-react';
import { api } from '../services/api';

export const MCPPage: React.FC = () => {
  const [toolsData, setToolsData] = useState<any>(null);
  const [selectedTool, setSelectedTool] = useState<string>('list_repositories');
  const [executing, setExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState<any>(null);

  useEffect(() => {
    api.getMCPTools().then(setToolsData).catch(console.error);
  }, []);

  const handleCallTool = async () => {
    setExecuting(true);
    try {
      const res = await api.callMCPTool(selectedTool, {
        repo_name: 'alexchen-ml/diabetes-prediction-service',
        file_path: 'src/train_model.py'
      });
      setExecutionResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setExecuting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-[#141721] border border-[#222634] space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
              <Cpu className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold text-white">Model Context Protocol (MCP) Integration</h1>
          </div>
          <span className="text-xs px-3 py-1 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 font-medium">
            Protocol: MCP JSON-RPC 2.0
          </span>
        </div>
        <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
          Standardized tool integration connecting verification engines to external evidence sources. 
          Enforces strict tool schemas, provenance tracking, and explicit sandboxed fallbacks without masquerading unauthorized access.
        </p>
      </div>

      {/* Discovered MCP Tools List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="p-5 rounded-2xl bg-[#141721] border border-[#222634] space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400 pb-2 border-b border-[#222634]">
            Discovered MCP Server Tools ({toolsData?.tools?.length || 5})
          </h2>

          <div className="space-y-2">
            {toolsData?.tools?.map((tool: any) => {
              const isSelected = selectedTool === tool.name;
              return (
                <div
                  key={tool.name}
                  onClick={() => { setSelectedTool(tool.name); setExecutionResult(null); }}
                  className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-indigo-600/20 border-indigo-500 text-white'
                      : 'bg-[#181c28] border-[#222634] text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between font-mono font-semibold mb-1">
                    <span>{tool.name}</span>
                    <span className="text-[10px] text-indigo-400">JSON-RPC</span>
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-2">{tool.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tool Execution Panel */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-[#141721] border border-[#222634] space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-[#222634] pb-3">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-bold text-white font-mono">mcp://tools/{selectedTool}</span>
              </div>
              <button
                onClick={handleCallTool}
                disabled={executing}
                className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-indigo-600/30 transition-all shrink-0"
              >
                <Play className="w-3 h-3 fill-current" />
                <span>{executing ? 'Invoking MCP Tool...' : 'Execute Tool Call'}</span>
              </button>
            </div>

            <div className="text-xs space-y-2">
              <span className="text-slate-400 font-medium block">Active Execution Context:</span>
              <pre className="p-3 rounded-xl bg-[#0c0e14] border border-[#222634] text-[11px] font-mono text-slate-300">
                {JSON.stringify({
                  tool: selectedTool,
                  protocol: "JSON-RPC 2.0",
                  target_repo: "alexchen-ml/diabetes-prediction-service",
                  target_file: "src/train_model.py"
                }, null, 2)}
              </pre>
            </div>

            {/* Results Display */}
            {executionResult && (
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Tool Execution Success</span>
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#1e2230] text-indigo-300">
                    Provenance: {executionResult.provenance}
                  </span>
                </div>
                <pre className="p-3.5 rounded-xl bg-[#0c0e14] border border-[#222634] text-[11px] font-mono text-emerald-300 overflow-x-auto max-h-64">
                  {JSON.stringify(executionResult, null, 2)}
                </pre>
              </div>
            )}
          </div>

          <div className="text-[11px] text-slate-500 flex items-center gap-2 pt-2 border-t border-[#1e2333]">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
            <span>Strict Provenance Tagging: Fallback adapters are transparently tagged and never disguised as live MCP servers.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
