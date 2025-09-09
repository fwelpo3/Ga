import React, { useState, useEffect } from 'react';
import { useProject } from '../features/project/hooks/useProject';
import { Header } from '../features/project/components/Header';
import { ProjectSettings } from '../features/project/components/ProjectSettings';
import { StructureEditor } from '../features/rooms/components/StructureEditor';
import { ActionsPanel } from '../features/project/components/ActionsPanel';
import { PreviewPanel } from '../features/project/components/PreviewPanel';
import { Footer } from '../features/project/components/Footer';
import { SettingsPanel } from '../features/project/components/SettingsPanel';
import { Toast } from '../shared/ui/Toast';
import { AiAssistantWizard } from '../features/ai-assistant/components/AiAssistantWizard';

const App: React.FC = () => {
    const [toast, setToast] = useState({ show: false, message: '' });
    const [settingsTab, setSettingsTab] = useState<'devices' | 'templates' | 'shortcuts' | 'view' | 'ai'>('devices');
    const [isAiWizardOpen, setIsAiWizardOpen] = useState(false);

    const showToast = (message: string) => {
        setToast({ show: true, message });
        setTimeout(() => {
            setToast(prev => ({ ...prev, show: false }));
        }, 3000);
    };

    const {
        project,
        setProject,
        isSettingsOpen,
        setIsSettingsOpen,
        generatedGAs,
        lastGeneratedXml,
        lastGeneratedCsv,
        handleProjectChange,
        handleTemplateChange,
        handleResetProject,
        handleGenerateExports,
        handleAddArea,
        handleApplyAiSuggestion,
        handleLearnTemplateFromRoom,
    } = useProject(showToast);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const modifier = e.ctrlKey || e.metaKey;

            // Open Settings to Shortcuts with '?'
            if (e.key === '?' && !modifier && !e.shiftKey && !e.altKey) {
                const target = e.target as HTMLElement;
                if(target.tagName === 'INPUT' || target.tagName === 'SELECT' || target.tagName === 'TEXTAREA') return;
                e.preventDefault();
                setSettingsTab('shortcuts');
                setIsSettingsOpen(true);
            }

            if (!modifier) return; // All other shortcuts require a modifier

            switch (e.key.toLowerCase()) {
                case 'g':
                    e.preventDefault();
                    if (project.areas.length > 0) handleGenerateExports();
                    break;
                case 's':
                    e.preventDefault();
                    if (e.altKey) { // Use Alt for settings to avoid conflict
                       setIsSettingsOpen(p => !p);
                    } else {
                       showToast("Projekt automatisch gespeichert!");
                    }
                    break;
                case 'r':
                    if (e.shiftKey) { // Shift+R for safety
                        e.preventDefault();
                        handleResetProject();
                    }
                    break;
                case 'b':
                    e.preventDefault();
                    handleAddArea();
                    break;
                case 'k':
                    e.preventDefault();
                    setProject(p => ({ ...p, viewOptions: { ...p.viewOptions, compactMode: !p.viewOptions.compactMode } }));
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [project, setProject, handleGenerateExports, handleResetProject, handleAddArea, setIsSettingsOpen, showToast]);

    return (
        <div className={`min-h-screen bg-slate-900 flex flex-col ${project.viewOptions.compactMode ? 'compact-mode' : ''}`}>
            <Header 
                project={project}
                setProject={setProject}
                onToggleSettings={() => setIsSettingsOpen(p => !p)}
            />
            <main className="flex-grow p-4 lg:p-6 grid grid-cols-1 xl:grid-cols-5 gap-6 max-w-screen-2xl mx-auto w-full">
                <div className="xl:col-span-3 flex flex-col gap-6">
                    <div className="bg-slate-800/50 border border-slate-700 rounded-xl shadow-lg flex-grow flex flex-col">
                       <ProjectSettings 
                           project={project}
                           onProjectChange={handleProjectChange}
                           onTemplateChange={handleTemplateChange}
                       />
                       <StructureEditor 
                           project={project}
                           setProject={setProject}
                           onAddArea={handleAddArea}
                           onStartWithAi={() => setIsAiWizardOpen(true)}
                           onLearnTemplate={handleLearnTemplateFromRoom}
                       />
                    </div>
                </div>

                <aside className="xl:col-span-2 flex flex-col gap-6">
                    <ActionsPanel 
                        project={project}
                        generatedGAs={generatedGAs}
                        onGenerate={handleGenerateExports}
                        onReset={handleResetProject}
                        lastGeneratedXml={lastGeneratedXml}
                        lastGeneratedCsv={lastGeneratedCsv}
                    />
                    <PreviewPanel generatedGAs={generatedGAs} />
                </aside>
            </main>
            <Footer />
            <SettingsPanel
                isOpen={isSettingsOpen}
                onClose={() => { setIsSettingsOpen(false); setSettingsTab('devices'); }}
                project={project}
                setProject={setProject}
                initialTab={settingsTab}
            />
            <AiAssistantWizard
                isOpen={isAiWizardOpen}
                onClose={() => setIsAiWizardOpen(false)}
                onApply={(suggestion) => {
                    handleApplyAiSuggestion(suggestion);
                    setIsAiWizardOpen(false);
                }}
            />
            <Toast message={toast.message} show={toast.show} />
        </div>
    );
};

export default App;
