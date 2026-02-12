
import React, { useState, useRef } from 'react';
import { GoogleGenAI, Modality, LiveServerMessage, Blob } from '@google/genai';
import Button from './Button';
import { Mic, Square, Loader2, Volume2, X, AlertTriangle } from 'lucide-react';

interface Props {
  contextCode: string;
  language: string;
}

// Manual decoding logic as per guidelines
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

// Manual encoding logic as per guidelines
function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// Manual audio buffer decoding as per guidelines
async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

const VoiceAssistant: React.FC<Props> = ({ contextCode, language }) => {
  const [isActive, setIsActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sessionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef(new Set<AudioBufferSourceNode>());

  const createBlob = (data: Float32Array): Blob => {
    const l = data.length;
    const int16 = new Int16Array(l);
    for (let i = 0; i < l; i++) {
      int16[i] = data[i] * 32768;
    }
    return {
      data: encode(new Uint8Array(int16.buffer)),
      mimeType: 'audio/pcm;rate=16000',
    };
  };

  const startSession = async () => {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

    if (!apiKey || apiKey === "your_gemini_api_key_here") {
      setError("Gemini API Key is missing. Please add VITE_GEMINI_API_KEY to your .env file.");
      setIsActive(true);
      return;
    }

    setIsConnecting(true);
    setError(null);

    // Create fresh instance right before call as per guidelines
    const ai = new GoogleGenAI({ apiKey, apiVersion: 'v1alpha' });

    console.log("Initializing audio context...");
    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    const outputNode = audioContextRef.current.createGain();
    outputNode.connect(audioContextRef.current.destination);

    try {
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.0-flash-exp',
        config: {
          generationConfig: {
            responseModalities: ['audio' as any],
            speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Puck' } } }
          },
          systemInstruction: { parts: [{ text: `You are the Refynix Voice Assistant. Help the user understand their code refinements. Context: ${contextCode.substring(0, 1000)}...` }] },
        },
        callbacks: {
          onopen: async () => {
            console.log("Voice session opened.");
            setIsActive(true);
            setIsConnecting(false);
            try {
              const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
              const inputCtx = new AudioContext({ sampleRate: 16000 });
              const source = inputCtx.createMediaStreamSource(stream);
              const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);

              scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
                const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                const pcmBlob = createBlob(inputData);
                sessionPromise.then((session) => {
                  session.sendRealtimeInput({ media: pcmBlob });
                }).catch(e => console.error("Failed to send realtime input:", e));
              };

              source.connect(scriptProcessor);
              scriptProcessor.connect(inputCtx.destination);
              console.log("Audio input stream connected.");
            } catch (err) {
              console.error("Microphone access failed:", err);
              setError("Microphone access denied or failed.");
              stopSession();
            }
          },
          onmessage: async (message: LiveServerMessage) => {
            console.log("Received server message:", message);
            // Handle audio output
            const base64EncodedAudioString = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (base64EncodedAudioString && audioContextRef.current) {
              const ctx = audioContextRef.current;
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
              const buffer = await decodeAudioData(decode(base64EncodedAudioString), ctx, 24000, 1);
              const source = ctx.createBufferSource();
              source.buffer = buffer;
              source.connect(outputNode);
              source.addEventListener('ended', () => {
                sourcesRef.current.delete(source);
              });
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += buffer.duration;
              sourcesRef.current.add(source);
            }

            // Handle interruption
            const interrupted = message.serverContent?.interrupted;
            if (interrupted) {
              console.log("Session interrupted.");
              for (const source of sourcesRef.current.values()) {
                source.stop();
                sourcesRef.current.delete(source);
              }
              nextStartTimeRef.current = 0;
            }
          },
          onclose: () => {
            console.log("Voice session closed.");
            stopSession();
          },
          onerror: (err: any) => {
            console.error("Voice session error:", err);
            // Extract more info if available
            const errorMsg = err?.message || err?.toString() || "Unknown connection error";
            setError(`Connection failed: ${errorMsg}`);
            stopSession();
          }
        }
      });
      sessionRef.current = await sessionPromise;
    } catch (e) {
      setError("Failed to initialize voice session.");
      setIsActive(true);
      setIsConnecting(false);
    }
  };

  const stopSession = () => {
    setIsActive(false);
    setIsConnecting(false);
    setError(null);
    sessionRef.current?.close();
    sourcesRef.current.forEach(s => { try { s.stop(); } catch (e) { } });
    sourcesRef.current.clear();
    audioContextRef.current?.close();
  };

  return (
    <div className="fixed bottom-10 right-10 z-[60] flex flex-col items-end gap-4">
      {isActive && (
        <div className="bg-slate-900/90 backdrop-blur-xl border border-white/10 p-6 rounded-[32px] shadow-2xl w-72 animate-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className={`w-2 h-2 rounded-full ${error ? 'bg-amber-500' : 'bg-emerald-500 animate-pulse'}`}></div>
              <p className="text-[10px] font-black text-white uppercase tracking-widest">Assistant Session</p>
            </div>
            <button onClick={stopSession} className="text-slate-500 hover:text-white transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex flex-col items-center gap-6 mb-8">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center relative overflow-hidden ${error ? 'bg-amber-500/10' : 'bg-emerald-500/10'}`}>
              {!error && <div className="absolute inset-0 bg-emerald-500/20 animate-ping opacity-20"></div>}
              {error ? <AlertTriangle className="text-amber-500 w-8 h-8" /> : <Volume2 className="text-emerald-500 w-8 h-8" />}
            </div>
            <div className="text-center space-y-1">
              <p className="text-xs font-bold text-slate-300">{error ? "Session Error" : "Assistant Active"}</p>
              <p className="text-[10px] text-slate-500 font-medium px-2 leading-relaxed">
                {error || "Ask about vulnerabilities or logic fixes in your code."}
              </p>
            </div>
          </div>

          <Button variant={error ? 'secondary' : 'danger'} className="w-full text-[10px] font-black uppercase tracking-widest py-3 rounded-2xl" onClick={stopSession}>
            {error ? 'Close' : 'End Consultation'}
          </Button>
        </div>
      )}

      <button
        onClick={isActive ? stopSession : startSession}
        disabled={isConnecting}
        className={`w-16 h-16 rounded-[24px] flex items-center justify-center transition-all shadow-2xl group ${isActive
          ? 'bg-red-500 shadow-red-500/20'
          : 'bg-blue-600 hover:bg-blue-500 shadow-blue-600/30'
          }`}
      >
        {isConnecting ? (
          <Loader2 className="w-6 h-6 text-white animate-spin" />
        ) : isActive ? (
          <Square className="w-6 h-6 text-white fill-current" />
        ) : (
          <Mic className="w-7 h-7 text-white transition-transform group-hover:scale-110" />
        )}
      </button>
    </div>
  );
};

export default VoiceAssistant;
