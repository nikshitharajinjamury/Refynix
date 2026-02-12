import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import Plot from 'react-plotly.js';
import { Network, BarChart3, Binary, Zap, Cpu } from 'lucide-react';

interface VisualizerProps {
    visualizations: {
        metrics: any;
        flowchart: string;
        plotly: string;
        ast: any;
        efficiencyScore: number;
    };
}

const Visualizer: React.FC<VisualizerProps> = ({ visualizations }) => {
    const mermaidRef = useRef<HTMLDivElement>(null);
    const [plotlyData, setPlotlyData] = useState<any>(null);

    useEffect(() => {
        mermaid.initialize({ startOnLoad: true, theme: 'dark', securityLevel: 'loose' });
        if (mermaidRef.current) {
            mermaidRef.current.innerHTML = visualizations.flowchart;
            mermaid.contentLoaded();
        }
    }, [visualizations.flowchart]);

    useEffect(() => {
        try {
            setPlotlyData(JSON.parse(visualizations.plotly));
        } catch (e) {
            console.error("Failed to parse Plotly JSON", e);
        }
    }, [visualizations.plotly]);

    const renderAST = (node: any, depth = 0) => {
        if (!node) return null;
        return (
            <div key={Math.random()} className="ml-4 border-l border-white/10 pl-4 py-1">
                <div className={`flex items-center gap-2 group ${node.pruned ? 'opacity-40 line-through decoration-red-500/50' : ''}`}>
                    <Binary className={`w-3 h-3 ${node.pruned ? 'text-red-500' : 'text-slate-500'} group-hover:text-blue-500 transition-colors`} />
                    <span className={`text-[10px] font-mono ${node.pruned ? 'text-red-400' : 'text-slate-400'} group-hover:text-white`}>
                        {node.name}
                        {node.pruned && <span className="ml-2 px-1 rounded bg-red-500/10 text-[8px] font-black text-red-500 uppercase tracking-tighter">Pruned</span>}
                    </span>
                </div>
                {node.children && node.children.map((child: any) => renderAST(child, depth + 1))}
            </div>
        );
    };

    return (
        <div className="space-y-12 mt-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <div className="flex flex-col gap-2">
                <h3 className="text-2xl font-black text-white tracking-tighter flex items-center gap-3">
                    <Cpu className="w-6 h-6 text-indigo-500" />
                    Architectural <span className="text-indigo-500">Visualization</span>
                </h3>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                    Deep-dive efficiency analysis & structural delta
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Mermaid Flowchart */}
                <div className="bg-[#0f172a]/60 backdrop-blur-xl p-8 rounded-[40px] border border-white/10 shadow-2xl overflow-hidden relative group">
                    <div className="absolute top-4 right-8 text-[10px] font-black text-indigo-400 uppercase tracking-widest opacity-40 group-hover:opacity-100 transition-opacity">
                        Structural Flow
                    </div>
                    <div className="mt-8 mermaid flex justify-center scale-90" ref={mermaidRef}>
                        {visualizations.flowchart}
                    </div>
                </div>

                {/* Efficiency Score & Plotly Bar Chart */}
                <div className="space-y-8">
                    <div className="bg-gradient-to-br from-indigo-600 to-blue-700 p-8 rounded-[40px] shadow-2xl relative overflow-hidden group">
                        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <Zap className="absolute -right-4 -top-4 w-32 h-32 text-white/5 rotate-12" />
                        <h4 className="text-[10px] font-black text-blue-100 uppercase tracking-widest mb-2 relative z-10">Efficiency Score</h4>
                        <div className="text-6xl font-black text-white tracking-tighter relative z-10 flex items-baseline gap-2">
                            {visualizations.efficiencyScore}
                            <span className="text-xl font-bold text-blue-200">/ 100</span>
                        </div>
                        <p className="text-[10px] text-blue-100/60 font-medium mt-4 relative z-10 uppercase tracking-tighter font-bold">
                            Based on Δ of complexity, memory, and execution time
                        </p>
                    </div>

                    <div className="bg-[#0f172a]/60 backdrop-blur-xl p-8 rounded-[40px] border border-white/10 shadow-2xl h-64 overflow-hidden flex items-center justify-center">
                        {plotlyData && (
                            <Plot
                                data={[
                                    {
                                        x: plotlyData.labels,
                                        y: plotlyData.before,
                                        type: 'bar',
                                        name: 'Original',
                                        marker: { color: '#475569' }
                                    },
                                    {
                                        x: plotlyData.labels,
                                        y: plotlyData.after,
                                        type: 'bar',
                                        name: 'Optimized',
                                        marker: { color: '#3b82f6' }
                                    }
                                ]}
                                layout={{
                                    width: 400,
                                    height: 200,
                                    paper_bgcolor: 'transparent',
                                    plot_bgcolor: 'transparent',
                                    margin: { l: 30, r: 10, t: 10, b: 30 },
                                    font: { family: 'Inter', size: 10, color: '#94a3b8' },
                                    showlegend: true,
                                    legend: { x: 1, y: 1 },
                                    barmode: 'group'
                                }}
                                config={{ displayModeBar: false }}
                            />
                        )}
                    </div>
                </div>
            </div>

            {/* AST Analysis */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-[#0f172a]/60 backdrop-blur-xl p-8 rounded-[40px] border border-white/10 shadow-2xl overflow-hidden max-h-96 hover:shadow-indigo-500/10 transition-shadow">
                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                        <Network className="w-3 h-3" /> Original AST Hierarchy
                    </h4>
                    <div className="overflow-y-auto h-72 custom-scrollbar">
                        {visualizations.ast.before ? renderAST(visualizations.ast.before) : <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest text-center mt-20 italic">No AST data</p>}
                    </div>
                </div>

                <div className="bg-[#0f172a]/60 backdrop-blur-xl p-8 rounded-[40px] border border-white/10 shadow-2xl overflow-hidden max-h-96 hover:shadow-blue-500/10 transition-shadow">
                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                        <Network className="w-3 h-3 text-blue-500" /> Optimized AST Delta
                    </h4>
                    <div className="overflow-y-auto h-72 custom-scrollbar">
                        {visualizations.ast.after ? renderAST(visualizations.ast.after) : <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest text-center mt-20 italic">No AST data</p>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Visualizer;
