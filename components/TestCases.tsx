import React, { useState } from 'react';
import { TestCase, TestResult } from '../types';
import Button from './Button';
import { Copy, Check, Terminal, Play, XCircle, CheckCircle2, AlertCircle } from 'lucide-react';

interface TestCasesProps {
    code: string;
    language: string;
}

const TestCases: React.FC<TestCasesProps> = ({ code, language }) => {
    const [testCases, setTestCases] = useState<TestCase[]>([]);
    const [testResults, setTestResults] = useState<TestResult[] | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isRunning, setIsRunning] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const generateTests = async () => {
        setIsLoading(true);
        setError(null);
        setTestResults(null);
        try {
            const response = await fetch('http://localhost:8000/tests/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code, language }),
            });

            if (!response.ok) throw new Error('Failed to generate tests');

            const data = await response.json();
            setTestCases(data.test_cases);
        } catch (err) {
            setError('Failed to generate test cases. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const runTests = async () => {
        if (testCases.length === 0) return;
        setIsRunning(true);
        setError(null);
        try {
            const response = await fetch('http://localhost:8000/tests/run', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code, language, test_cases: testCases }),
            });

            if (!response.ok) throw new Error('Failed to run tests');

            const data = await response.json();
            setTestResults(data.results);
        } catch (err) {
            setError('Failed to execute tests. Please try again.');
        } finally {
            setIsRunning(false);
        }
    };

    return (
        <div className="bg-[#0f172a]/60 backdrop-blur-xl rounded-[40px] border border-white/10 p-8 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-black text-white flex items-center gap-3">
                    <Terminal className="w-6 h-6 text-blue-500" />
                    <span className="tracking-tighter">Smart <span className="text-blue-500">Test Generator</span></span>
                </h3>
                <div className="flex gap-4">
                    {testCases.length > 0 && !isRunning && (
                        <Button
                            onClick={runTests}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2"
                        >
                            <Play className="w-3 h-3 fill-current" />
                            Run Tests
                        </Button>
                    )}
                    {testCases.length === 0 && (
                        <Button
                            onClick={generateTests}
                            isLoading={isLoading}
                            className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest"
                        >
                            Generate Tests
                        </Button>
                    )}
                </div>
            </div>

            {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-bold mb-6">
                    {error}
                </div>
            )}

            {isRunning && (
                <div className="p-12 text-center space-y-4">
                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="text-slate-500 font-black uppercase tracking-widest text-[10px]">Simulating Code Execution...</p>
                </div>
            )}

            {testCases.length > 0 && !isRunning && (
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {testCases.map((test, index) => {
                            const result = testResults ? testResults[index] : null;
                            return (
                                <div key={index} className={`bg-white/5 border rounded-2xl p-5 transition-all group ${result ? (result.passed ? 'border-emerald-500/30' : 'border-red-500/30') : 'border-white/5 hover:border-blue-500/30'}`}>
                                    <div className="flex justify-between items-start mb-3">
                                        <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest bg-blue-500/10 px-2 py-1 rounded-lg">Case {index + 1}</span>
                                        {result && (
                                            result.passed ?
                                                <CheckCircle2 className="w-5 h-5 text-emerald-500" /> :
                                                <XCircle className="w-5 h-5 text-red-500" />
                                        )}
                                    </div>
                                    <p className="text-sm font-bold text-slate-300 mb-4 h-10 line-clamp-2">{test.description}</p>

                                    <div className="space-y-3">
                                        <div>
                                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-1">Input</span>
                                            <code className="block bg-black/40 rounded-lg p-2 text-[10px] font-mono text-emerald-400 truncate">{test.input}</code>
                                        </div>
                                        {result ? (
                                            <div>
                                                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-1">Actual Output</span>
                                                <code className={`block bg-black/40 rounded-lg p-2 text-[10px] font-mono ${result.passed ? 'text-emerald-400' : 'text-red-400'}`}>
                                                    {result.actual_output || result.error || 'No output'}
                                                </code>
                                            </div>
                                        ) : (
                                            <div>
                                                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-1">Expected Output</span>
                                                <code className="block bg-black/40 rounded-lg p-2 text-[10px] font-mono text-amber-400 truncate">{test.expected_output}</code>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    <div className="flex justify-end gap-4 mt-6">
                        <Button
                            onClick={() => { setTestCases([]); setTestResults(null); }}
                            className="mt-4 text-xs font-bold text-slate-500 hover:text-white uppercase tracking-widest"
                        >
                            Reset Generator
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TestCases;
