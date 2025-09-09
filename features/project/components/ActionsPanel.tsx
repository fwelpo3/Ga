import React, { useState, useEffect } from 'react';
import { Project, GroupAddress } from '../../../domain';
import { DownloadIcon, GenerateIcon, ResetIcon, SparklesIcon } from '../../../shared/ui/icons';
import { downloadFile } from '../../../shared/utils/files';

interface ActionsPanelProps {
    project: Project;
    generatedGAs: GroupAddress[];
    onGenerate: () => void;
    onReset: () => void;
    lastGeneratedXml: string;
    lastGeneratedCsv: string;
}

const StatCard: React.FC<{ value: number | string; label: string }> = ({ value, label }) => (
    <div className="bg-slate-700/50 p-3 rounded-lg text-center">
        <p className="text-2xl font-bold text-sky-400">{value}</p>
        <p className="text-xs text-slate-400 uppercase mt-1">{label}</p>
    </div>
);

export const ActionsPanel: React.FC<ActionsPanelProps> = ({ project, generatedGAs, onGenerate, onReset, lastGeneratedXml, lastGeneratedCsv }) => {
    const [generationStatus, setGenerationStatus] = useState<'idle' | 'generated'>('idle');

    useEffect(() => {
       setGenerationStatus('idle');
    }, [project]);

    const handleGenerate = () => {
        onGenerate();
        setGenerationStatus('generated');
    }
    
    const handleAnalyze = () => {
        // Placeholder for future functionality
        alert("Die KI-Projektanalyse wird in einer zukünftigen Version implementiert. Sie wird das Projekt auf Konsistenz, Vollständigkeit und Optimierungspotenzial prüfen.");
    };

    const safeProjectName = project.name.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'knx_projekt';
    const totalRooms = project.areas.reduce((acc, area) => acc + area.rooms.length, 0);
    // Zählt die Gesamtzahl aller erstellten Funktions-Instanzen
    const totalFunctions = project.areas.reduce((acc, area) => 
        acc + area.rooms.reduce((rAcc, room) => rAcc + room.functionInstances.length, 0)
    , 0);
    
    return (
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl shadow-lg p-4 sticky top-24">
            <h2 className="text-lg font-semibold text-slate-200 mb-4">Aktionen & Kennzahlen</h2>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
                <StatCard value={project.areas.length} label="Bereiche" />
                <StatCard value={totalRooms} label="Räume" />
                <StatCard value={totalFunctions} label="Funktionen" />
                <StatCard value={generatedGAs.length} label="GAs" />
            </div>

            <div className="space-y-3">
                <button
                    onClick={handleGenerate}
                    disabled={project.areas.length === 0}
                    className="w-full flex items-center justify-center gap-2 bg-sky-600 text-white px-4 py-2 rounded-md font-semibold hover:bg-sky-500 transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-slate-800 disabled:bg-slate-600 disabled:cursor-not-allowed"
                >
                    <GenerateIcon />
                    Exporte generieren {generationStatus === 'generated' ? '✓' : ''}
                </button>
                 <button
                    onClick={handleAnalyze}
                    disabled={project.areas.length === 0 || !project.aiSettings.enableFullAnalysis}
                    className="w-full flex items-center justify-center gap-2 bg-sky-600/50 text-sky-300 px-4 py-2 rounded-md font-semibold hover:bg-sky-600 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-slate-800 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed"
                >
                    <SparklesIcon />
                    Projekt analysieren
                </button>
                <div className="grid grid-cols-2 gap-3">
                    <button
                        onClick={() => downloadFile(lastGeneratedXml, `${safeProjectName}.knxproj`, 'application/xml')}
                        disabled={generationStatus !== 'generated' || !lastGeneratedXml}
                        className="w-full flex items-center justify-center gap-2 bg-slate-600 text-white px-4 py-2 rounded-md font-semibold hover:bg-slate-500 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-slate-800 disabled:bg-slate-700 disabled:text-slate-400 disabled:cursor-not-allowed"
                    >
                         <DownloadIcon /> ETS-XML
                    </button>
                    <button
                        onClick={() => downloadFile(lastGeneratedCsv, `${safeProjectName}.csv`, 'text/csv;charset=utf-8;')}
                        disabled={generationStatus !== 'generated' || !lastGeneratedCsv}
                        className="w-full flex items-center justify-center gap-2 bg-slate-600 text-white px-4 py-2 rounded-md font-semibold hover:bg-slate-500 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-slate-800 disabled:bg-slate-700 disabled:text-slate-400 disabled:cursor-not-allowed"
                    >
                        <DownloadIcon /> CSV
                    </button>
                </div>
                 <button
                    onClick={onReset}
                    className="w-full flex items-center justify-center gap-2 bg-red-600/80 text-white px-4 py-2 rounded-md font-semibold hover:bg-red-500 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-slate-800"
                >
                    <ResetIcon />
                    Projekt zurücksetzen
                </button>
            </div>
        </div>
    );
};
