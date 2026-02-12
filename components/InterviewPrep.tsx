import React, { useState } from 'react';
import { InterviewQuestion } from '../types';
import Button from './Button';
import { MessageSquare, ChevronDown, ChevronUp, BrainCircuit, CheckCircle2 } from 'lucide-react';

const TOPICS = [
    'General Programming', 'Python', 'JavaScript', 'React', 'Data Structures', 'Algorithms', 'System Design'
];

const LEVELS = ['Entry', 'Intermediate', 'Senior', 'Expert'];

const InterviewPrep: React.FC = () => {
    const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
    const [topic, setTopic] = useState('General Programming');
    const [level, setLevel] = useState('Intermediate');
    const [count, setCount] = useState(5);
    const [activeTab, setActiveTab] = useState<'practice' | 'ask'>('practice');
    const [userQuestion, setUserQuestion] = useState('');
    const [expertAnswer, setExpertAnswer] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [expandedId, setExpandedId] = useState<number | null>(null);

    const generateQuestions = async () => {
        setIsLoading(true);
        setQuestions([]);
        try {
            const response = await fetch('http://localhost:8000/interview/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ topic, level, count }),
            });

            if (!response.ok) throw new Error('Failed to generate questions');

            const data = await response.json();
            setQuestions(data.questions);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const askExpert = async () => {
        if (!userQuestion.trim()) return;
        setIsLoading(true);
        setExpertAnswer(null);
        try {
            const response = await fetch('http://localhost:8000/interview/ask', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ topic, question: userQuestion }),
            });

            if (!response.ok) throw new Error('Failed to get answer');

            const data = await response.json();
            setExpertAnswer(data.answer);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-700">
            <div className="flex flex-col gap-2">
                <h2 className="text-4xl font-black text-white tracking-tighter">Interview <span className="text-blue-500">Coach</span></h2>
                <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">AI-Powered Technical Preparation</p>
            </div>

            <div className="bg-[#0f172a]/60 backdrop-blur-xl rounded-[40px] border border-white/10 p-8 shadow-2xl">
                <div className="flex gap-4 mb-8 bg-black/20 p-1 rounded-2xl w-fit">
                    <button
                        onClick={() => setActiveTab('practice')}
                        className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'practice' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        Practice Mode
                    </button>
                    <button
                        onClick={() => setActiveTab('ask')}
                        className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'ask' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        Ask an Expert
                    </button>
                </div>

                {activeTab === 'practice' ? (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Topic</label>
                                <select
                                    value={topic}
                                    onChange={(e) => setTopic(e.target.value)}
                                    className="w-full bg-[#1e293b]/50 border border-white/5 rounded-2xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none font-bold"
                                >
                                    {TOPICS.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Difficulty</label>
                                <select
                                    value={level}
                                    onChange={(e) => setLevel(e.target.value)}
                                    className="w-full bg-[#1e293b]/50 border border-white/5 rounded-2xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none font-bold"
                                >
                                    {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Count</label>
                                <input
                                    type="number"
                                    min="1"
                                    max="20"
                                    value={count}
                                    onChange={(e) => setCount(parseInt(e.target.value) || 5)}
                                    className="w-full bg-[#1e293b]/50 border border-white/5 rounded-2xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-blue-500/50 font-bold"
                                />
                            </div>
                            <div className="flex items-end">
                                <Button
                                    onClick={generateQuestions}
                                    isLoading={isLoading}
                                    className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-blue-500/30"
                                >
                                    Start Session
                                </Button>
                            </div>
                        </div>

                        {questions.length > 0 && (
                            <div className="space-y-4">
                                {questions.map((q) => (
                                    <div key={q.id} className="bg-white/5 border border-white/5 rounded-2xl overflow-hidden transition-all">
                                        <div
                                            className="p-6 cursor-pointer hover:bg-white/5 flex gap-4"
                                            onClick={() => setExpandedId(expandedId === q.id ? null : q.id)}
                                        >
                                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400 font-bold text-sm">
                                                {q.id}
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="text-lg font-bold text-slate-200 mb-2">{q.question}</h4>
                                                <div className="flex items-center gap-3">
                                                    <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md ${q.difficulty === 'Easy' ? 'bg-emerald-500/10 text-emerald-400' :
                                                        q.difficulty === 'Medium' ? 'bg-amber-500/10 text-amber-400' :
                                                            'bg-red-500/10 text-red-400'
                                                        }`}>
                                                        {q.difficulty}
                                                    </span>
                                                    {q.options && <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Multiple Choice</span>}
                                                </div>
                                            </div>
                                            {expandedId === q.id ? <ChevronUp className="w-5 h-5 text-slate-500" /> : <ChevronDown className="w-5 h-5 text-slate-500" />}
                                        </div>

                                        {expandedId === q.id && (
                                            <div className="px-6 pb-6 pt-2 border-t border-white/5 bg-black/20">
                                                {q.options && (
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                                                        {q.options.map((opt, i) => (
                                                            <div key={i} className="p-3 rounded-xl border border-white/5 bg-white/5 text-slate-300 text-sm font-medium">
                                                                {opt}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}

                                                <div className="space-y-4">
                                                    <div className="bg-emerald-500/5 border border-emerald-500/10 p-4 rounded-xl">
                                                        <h5 className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                                                            <CheckCircle2 className="w-4 h-4" /> Correct Answer
                                                        </h5>
                                                        <p className="text-slate-300 font-bold">{q.answer}</p>
                                                    </div>

                                                    <div className="bg-blue-500/5 border border-blue-500/10 p-4 rounded-xl">
                                                        <h5 className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                                                            <BrainCircuit className="w-4 h-4" /> Explanation
                                                        </h5>
                                                        <p className="text-slate-400 text-sm leading-relaxed">{q.explanation}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                        {!isLoading && questions.length === 0 && (
                            <div className="text-center py-20">
                                <div className="w-20 h-20 rounded-full bg-slate-800 mx-auto mb-6 flex items-center justify-center">
                                    <MessageSquare className="w-8 h-8 text-slate-500" />
                                </div>
                                <h3 className="text-lg font-bold text-white mb-2">Ready for your interview?</h3>
                                <p className="text-slate-500 text-sm max-w-xs mx-auto">Select a topic and difficulty level above to generate a custom interview session.</p>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Select Topic</label>
                            <select
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                                className="w-full bg-[#1e293b]/50 border border-white/5 rounded-2xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none font-bold"
                            >
                                {TOPICS.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Your Question</label>
                            <textarea
                                value={userQuestion}
                                onChange={(e) => setUserQuestion(e.target.value)}
                                placeholder="E.g., What is the difference between useMemo and useCallback?"
                                className="w-full h-32 bg-[#1e293b]/50 border border-white/5 rounded-2xl px-6 py-4 text-white outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium resize-none"
                            />
                        </div>
                        <div className="flex justify-end">
                            <Button
                                onClick={askExpert}
                                isLoading={isLoading}
                                className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-blue-500/30"
                            >
                                Ask Expert
                            </Button>
                        </div>

                        {expertAnswer && (
                            <div className="bg-blue-500/5 border border-blue-500/10 p-6 rounded-3xl animate-in fade-in slide-in-from-bottom-2">
                                <h5 className="text-xs font-black text-blue-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <BrainCircuit className="w-4 h-4" /> Expert Answer
                                </h5>
                                <div className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap font-medium">
                                    {expertAnswer}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default InterviewPrep;
