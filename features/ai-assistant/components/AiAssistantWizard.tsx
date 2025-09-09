import React, { useState, useEffect, useRef } from 'react';
import { useAiProjectGenerator } from '../hooks/useAiAssistant';
import { AiAreaSuggestion, AiProjectSuggestion, FunctionType } from '../../../domain';
import { CloseIcon, SparklesIcon, TrashIcon, AddIcon } from '../../../shared/ui/icons';

interface AiAssistantWizardProps {
    isOpen: boolean;
    onClose: () => void;
    onApply: (suggestion: AiProjectSuggestion) => void;
}

type WizardStep = 'input' | 'processing' | 'review';

//--- Sub-Components for each step ---//

const InputStep: React.FC<{ onGenerate: (text: string, file: File | null) => void }> = ({ onGenerate }) => {
    const [text, setText] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!file) {
            setPreview(null);
            return;
        }
        const objectUrl = URL.createObjectURL(file);
        setPreview(objectUrl);
        return () => URL.revokeObjectURL(objectUrl);
    }, [file]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };
    
    const handleSubmit = () => {
        if (text.trim() || file) {
            onGenerate(text, file);
        }
    };

    return (
        <div className="flex flex-col gap-6 h-full">
            <h3 className="text-xl font-bold text-sky-400">Wie sieht Ihr Projekt aus?</h3>
            <div>
                <label htmlFor="project-description" className="block text-sm font-medium text-slate-300 mb-2">
                    Beschreiben Sie Ihr Projekt
                </label>
                <textarea
                    id="project-description"
                    rows={8}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="z.B. Erstelle ein Projekt für ein Einfamilienhaus. Im Erdgeschoss gibt es ein großes Wohn/Esszimmer, eine Küche und einen Flur. Das Obergeschoss hat ein Schlafzimmer, ein Bad und ein Kinderzimmer. Das Wohnzimmer soll dimmbare Lichter und Jalousien haben."
                    className="w-full bg-slate-900/50 border border-slate-600 rounded-md p-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
            </div>
            <div className="text-center text-slate-400 font-semibold">ODER</div>
            <div>
                 <label className="block text-sm font-medium text-slate-300 mb-2">
                    Laden Sie einen Grundriss hoch (optional)
                </label>
                <div 
                    className="border-2 border-dashed border-slate-600 rounded-lg p-6 text-center cursor-pointer hover:border-sky-500 hover:bg-slate-700/50 transition"
                    onClick={() => fileInputRef.current?.click()}
                >
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/png, image/jpeg" className="hidden" />
                    {preview ? (
                        <img src={preview} alt="Grundriss-Vorschau" className="max-h-32 mx-auto rounded-md" />
                    ) : (
                        <p className="text-slate-400">Klicken oder hierher ziehen, um eine Bilddatei (PNG, JPG) hochzuladen.</p>
                    )}
                </div>
            </div>
             <div className="mt-auto">
                <button
                    onClick={handleSubmit}
                    disabled={!text.trim() && !file}
                    className="w-full flex items-center justify-center gap-3 bg-sky-600 text-white px-4 py-3 rounded-md font-semibold hover:bg-sky-500 transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-slate-800 disabled:bg-slate-600 disabled:cursor-not-allowed"
                >
                    <SparklesIcon /> Vorschlag generieren
                </button>
            </div>
        </div>
    );
};

const ProcessingStep: React.FC = () => {
    const messages = ["Analysiere Projektbeschreibung...", "Erkenne Räume im Grundriss...", "Weise Standardfunktionen zu...", "Strukturiere das Projekt..."];
    const [message, setMessage] = useState(messages[0]);

    useEffect(() => {
        let i = 0;
        const interval = setInterval(() => {
            i = (i + 1) % messages.length;
            setMessage(messages[i]);
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex flex-col items-center justify-center h-full text-center gap-4">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-sky-400"></div>
            <p className="text-lg font-semibold text-slate-300">{message}</p>
            <p className="text-sm text-slate-400">Die KI denkt nach. Dies kann einen Moment dauern.</p>
        </div>
    );
};

const ReviewStep: React.FC<{ 
    initialSuggestion: AiProjectSuggestion; 
    onApply: (suggestion: AiProjectSuggestion) => void;
    onRestart: () => void;
}> = ({ initialSuggestion, onApply, onRestart }) => {
    const [suggestion, setSuggestion] = useState<AiProjectSuggestion>(initialSuggestion);

    const handleAreaChange = (areaId: string, field: keyof AiAreaSuggestion, value: string) => {
        setSuggestion(suggestion.map(a => a.id === areaId ? { ...a, [field]: value } : a));
    };

    const handleRoomChange = (areaId: string, roomId: string, field: keyof AiAreaSuggestion['rooms'][0], value: string) => {
        setSuggestion(suggestion.map(a => a.id === areaId ? {
            ...a,
            rooms: a.rooms.map(r => r.id === roomId ? { ...r, [field]: value } : r)
        } : a));
    };

     const handleFunctionChange = (areaId: string, roomId: string, type: FunctionType, count: number) => {
        setSuggestion(suggestion.map(a => a.id === areaId ? {
            ...a,
            rooms: a.rooms.map(r => {
                if (r.id === roomId) {
                    const newFunctions = { ...r.functions };
                    if (count > 0) {
                        newFunctions[type] = count;
                    } else {
                        delete newFunctions[type];
                    }
                    return { ...r, functions: newFunctions };
                }
                return r;
            })
        } : a));
    };
    
    const handleRemoveRoom = (areaId: string, roomId: string) => {
        setSuggestion(suggestion.map(a => a.id === areaId ? {
            ...a,
            rooms: a.rooms.filter(r => r.id !== roomId)
        } : a));
    };
    
    const handleRemoveArea = (areaId: string) => {
        setSuggestion(suggestion.filter(a => a.id !== areaId));
    };

    return (
        <div className="flex flex-col h-full">
            <h3 className="text-xl font-bold text-sky-400 mb-2">Vorschlag überprüfen</h3>
            <p className="text-sm text-slate-400 mb-4">Hier ist der Vorschlag der KI. Sie können alle Werte anpassen, bevor Sie die Struktur übernehmen.</p>
            
            <div className="flex-grow overflow-y-auto pr-2 space-y-3">
                {suggestion.map(area => (
                    <div key={area.id} className="bg-slate-700/50 border border-slate-600 rounded-lg p-3">
                        <div className="flex items-center gap-3 mb-2">
                             <input type="text" value={area.name} onChange={e => handleAreaChange(area.id, 'name', e.target.value)} className="flex-grow bg-slate-800 text-lg font-bold rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-sky-500" />
                             <input type="text" value={area.abbreviation} onChange={e => handleAreaChange(area.id, 'abbreviation', e.target.value.toUpperCase())} className="w-20 bg-slate-800 text-center rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-sky-500" />
                             <button onClick={() => handleRemoveArea(area.id)} className="p-1 text-slate-400 hover:text-red-400"><TrashIcon size={4}/></button>
                        </div>
                        <div className="space-y-2 pl-4 border-l-2 border-slate-600">
                             {area.rooms.map(room => (
                                <div key={room.id} className="bg-slate-800/70 p-2 rounded">
                                    <div className="flex items-center gap-2">
                                        <input type="text" value={room.name} onChange={e => handleRoomChange(area.id, room.id, 'name', e.target.value)} className="flex-grow bg-slate-700 text-sm font-semibold rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-sky-500" />
                                        <button onClick={() => handleRemoveRoom(area.id, room.id)} className="p-1 text-slate-400 hover:text-red-400"><TrashIcon size={4}/></button>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                                        {(['lightSwitch', 'lightDim', 'blinds', 'heating'] as FunctionType[]).map(type => (
                                            <div key={type} className="flex items-center justify-between">
                                                <label className="capitalize text-slate-300">{type.replace('light', 'Licht ')}</label>
                                                <input type="number" min="0" value={room.functions[type] || 0} onChange={e => handleFunctionChange(area.id, room.id, type, parseInt(e.target.value) || 0)} className="w-16 bg-slate-900/50 text-center rounded focus:outline-none focus:ring-1 focus:ring-sky-500" />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                             ))}
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-4 pt-4 border-t border-slate-700 flex gap-3">
                <button onClick={onRestart} className="w-full bg-slate-600 text-white px-4 py-3 rounded-md font-semibold hover:bg-slate-500">
                    Verwerfen & Neu starten
                </button>
                <button onClick={() => onApply(suggestion)} className="w-full bg-sky-600 text-white px-4 py-3 rounded-md font-semibold hover:bg-sky-500">
                    Vorschlag übernehmen
                </button>
            </div>
        </div>
    );
};

//--- Main Wizard Component ---//

export const AiAssistantWizard: React.FC<AiAssistantWizardProps> = ({ isOpen, onClose, onApply }) => {
    const [step, setStep] = useState<WizardStep>('input');
    const { isLoading, error, suggestion, generateProject } = useAiProjectGenerator();

    useEffect(() => {
        if (isOpen) {
            setStep('input');
        }
    }, [isOpen]);

    useEffect(() => {
        if (isLoading) {
            setStep('processing');
        } else if (suggestion) {
            setStep('review');
        } else if (error) {
            setStep('input'); // Go back to input on error, maybe show a toast
        }
    }, [isLoading, suggestion, error]);

    const handleGenerate = async (text: string, file: File | null) => {
        await generateProject(text, file);
    };
    
    const handleRestart = () => {
        setStep('input');
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 z-40 flex items-center justify-center p-4" onClick={onClose}>
            <div
                className="bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-3xl h-[90vh] max-h-[700px] flex flex-col p-6"
                onClick={e => e.stopPropagation()}
            >
                <header className="flex justify-between items-center mb-4 flex-shrink-0">
                     <div className="flex items-center gap-2">
                        <SparklesIcon className="text-sky-400" />
                        <h2 className="text-2xl font-bold text-slate-200">KNX AI Projekt-Assistent</h2>
                    </div>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-full"><CloseIcon /></button>
                </header>
                
                <main className="flex-grow overflow-hidden">
                    {error && <div className="text-red-400 bg-red-900/50 p-3 rounded-md mb-4">{error}</div>}
                    {step === 'input' && <InputStep onGenerate={handleGenerate} />}
                    {step === 'processing' && <ProcessingStep />}
                    {step === 'review' && suggestion && <ReviewStep initialSuggestion={suggestion} onApply={onApply} onRestart={handleRestart} />}
                </main>
            </div>
        </div>
    );
};
