"use client";
import { useState, useEffect } from 'react';
import { Play, Square } from 'lucide-react';
import master from '../data/master.json';

export default function VoiceAssistant() {
    const [isPlaying, setIsPlaying] = useState(false);
    const [speech, setSpeech] = useState<SpeechSynthesisUtterance | null>(null);

    useEffect(() => {
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
            const msg = new SpeechSynthesisUtterance();
            msg.text = master.personal.voiceSummary;
            msg.rate = 0.95; // Slightly slower, more professional voice pace
            msg.pitch = 1;
            msg.onend = () => setIsPlaying(false);

            const updateVoice = () => {
                const voices = window.speechSynthesis.getVoices();
                if (voices.length === 0) return;
                
                // Priority list of more natural-sounding human voices
                const preferredVoices = [
                    'Google US English', // Chrome's high quality voice
                    'Microsoft Zira',    // Windows natural female
                    'Microsoft Mark',    // Windows natural male
                    'Samantha',          // Mac OS natural female
                    'Daniel',            // Mac OS natural British male
                    'Karen'              // Mac OS natural Australian female
                ];

                for (const pref of preferredVoices) {
                    const voice = voices.find(v => v.name.includes(pref));
                    if (voice) {
                        msg.voice = voice;
                        break;
                    }
                }
            };

            // Try to set voice immediately, or wait for voices to load
            updateVoice();
            window.speechSynthesis.onvoiceschanged = updateVoice;

            setSpeech(msg);

            return () => {
                window.speechSynthesis.onvoiceschanged = null;
                window.speechSynthesis.cancel();
            }
        }
    }, []);

    const handlePlay = () => {
        if (!speech) return;
        if (isPlaying) {
            window.speechSynthesis.cancel();
            setIsPlaying(false);
        } else {
            window.speechSynthesis.speak(speech);
            setIsPlaying(true);
        }
    };

    if (!speech) return null;

    return (
        <button
            onClick={handlePlay}
            className="btn-outline"
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: isPlaying ? 'rgba(239, 68, 68, 0.1)' : 'transparent',
                borderColor: isPlaying ? 'rgb(239, 68, 68)' : 'var(--border-color)',
                color: isPlaying ? 'rgb(239, 68, 68)' : 'var(--text-primary)',
                transition: 'all 0.3s ease',
                cursor: 'pointer'
            }}
        >
            {isPlaying ? (
                <><Square size={16} fill="currentColor" /> Stop Voice Summary</>
            ) : (
                <><Play size={16} fill="currentColor" /> Play Voice Summary</>
            )}
        </button>
    );
}
