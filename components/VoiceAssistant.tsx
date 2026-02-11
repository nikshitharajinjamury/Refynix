
import React, { useState, useRef } from 'react';
import { GoogleGenAI, Modality } from '@google/genai';
import Button from './Button';

interface Props {
  contextCode: string;
  language: string;
}

const VoiceAssistant: React.FC<Props> = ({ contextCode, language }) => {
  const [isActive, setIsActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const sessionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef(new Set<AudioBufferSourceNode>());

  const decode = (base64: string) => {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
    return bytes;
  };

  const decodeAudioData = async (data: Uint8Array, ctx: AudioContext) => {
    const dataInt16 = new Int16Array(data.buffer);
    const buffer = ctx.createBuffer(1, dataInt16.length, 24000);
    const channelData = buffer.getChannelData(0);
    for (let i = 0; i < dataInt16.length; i++) channelData[i] = dataInt16[i] / 32768.0;
    return buffer;
  };

  const startSession = async () => {
    const apiKey = process.env.API_KEY;
    if (!apiKey || apiKey === "undefined") {
      alert("API Key missing! Check your .env file.");
      return;
    }

    setIsConnecting(true);
    const ai = new GoogleGenAI({ apiKey });
    
    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    const outputNode = audioContextRef.current.createGain();
    outputNode.connect(audioContextRef.current.destination);

    const sessionPromise = ai.live.connect({
      model: 'gemini-2.5-flash-native-audio-preview-12-2025',
      config: {
        responseModalities: [Modality.AUDIO],
        systemInstruction: `You are the CodePulse AI Voice Assistant. Analyzing ${language} code.`,
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } }
      },
      callbacks: {
        onopen: async () => {
          setIsActive(true);
          setIsConnecting(false);
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          const inputCtx = new AudioContext({ sampleRate: 16000 });
          const source = inputCtx.createMediaStreamSource(stream);
          const processor = inputCtx.createScriptProcessor(4096, 1, 1);
          
          processor.onaudioprocess = (e) => {
            const inputData = e.inputBuffer.getChannelData(0);
            const int16 = new Int16Array(inputData.length);
            for (let i = 0; i < inputData.length; i++) int16[i] = inputData[i] * 32768;
            const bytes = new Uint8Array(int16.buffer);
            let binary = '';
            for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
            const base64 = btoa(binary);

            sessionPromise.then(s => s.sendRealtimeInput({ 
              media: { data: base64, mimeType: 'audio/pcm;rate=16000' } 
            }));
          };
          source.connect(processor);
          processor.connect(inputCtx.destination);
        },
        onmessage: async (msg) => {
          const audio = msg.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
          if (audio && audioContextRef.current) {
            const ctx = audioContextRef.current;
            nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
            const buffer = await decodeAudioData(decode(audio), ctx);
            const source = ctx.createBufferSource();
            source.buffer = buffer;
            source.connect(outputNode);
            source.start(nextStartTimeRef.current);
            nextStartTimeRef.current += buffer.duration;
            sourcesRef.current.add(source);
          }
        },
        onclose: () => stopSession(),
        onerror: () => stopSession()
      }
    });
    sessionRef.current = await sessionPromise;
  };

  const stopSession = () => {
    setIsActive(false);
    setIsConnecting(false);
    sessionRef.current?.close();
    sourcesRef.current.forEach(s => s.stop());
    sourcesRef.current.clear();
  };

  return (
    <div className="fixed bottom-6 right-6 z-[60]">
      {isActive && (
        <div className="absolute bottom-16 right-0 bg-slate-900 border border-slate-700 p-4 rounded-2xl shadow-2xl w-64">
           <p className="text-xs text-slate-400 mb-4 italic">"I'm listening..."</p>
           <Button variant="danger" className="w-full text-xs" onClick={stopSession}>End Session</Button>
        </div>
      )}
      <button
        onClick={isActive ? stopSession : startSession}
        disabled={isConnecting}
        className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
          isActive ? 'bg-red-500' : 'bg-blue-600 hover:bg-blue-500'
        }`}
      >
        {isActive ? '⏹' : '🎤'}
      </button>
    </div>
  );
};

export default VoiceAssistant;
