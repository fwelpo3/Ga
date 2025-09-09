import React, { useState, useEffect } from 'react';
import { Project, FunctionType, DeviceConfig, CustomRoomTemplate, RoomFunctionsTemplate, ViewOptions, AiSettings } from '../../../domain';
import { CloseIcon, AddIcon, TrashIcon } from '../../../shared/ui/icons';

interface SettingsPanelProps {
    isOpen: boolean;
    onClose: () => void;
    project: Project;
    setProject: React.Dispatch<React.SetStateAction<Project>>;
    initialTab?: 'devices' | 'templates' | 'shortcuts' | 'view' | 'ai';
}

type Tab = 'devices' | 'templates' | 'shortcuts' | 'view' | 'ai';

const TabButton: React.FC<{ active: boolean, onClick: () => void, children: React.ReactNode }> = ({ active, onClick, children }) => (
    <button
        onClick={onClick}
        className={`px-4 py-2 text-sm font-semibold rounded-t-lg border-b-2 ${
            active
                ? 'text-sky-400 border-sky-400'
                : 'text-slate-400 border-transparent hover:text-slate-200 hover:border-slate-500'
        }`}
    >
        {children}
    </button>
);

const AiSettingsEditor: React.FC<{ project: Project; setProject: React.Dispatch<React.SetStateAction<Project>> }> = ({ project, setProject }) => {
    const handleAiSettingChange = (field: keyof AiSettings, value: boolean) => {
        setProject(p => ({ ...p, aiSettings: { ...p.aiSettings, [field]: value } }));
    };

    const SettingToggle: React.FC<{ settingKey: keyof AiSettings; label: string; description: string }> = ({ settingKey, label, description }) => (
        <div className="flex items-start justify-between p-3 bg-slate-800/50 rounded-lg">
            <div>
                <label htmlFor={`${settingKey}-toggle`} className="font-medium text-slate-300 cursor-pointer select-none">
                    {label}
                </label>
                <p className="text-xs text-slate-400 mt-1">{description}</p>
            </div>
            <button
                id={`${settingKey}-toggle`} role="switch" aria-checked={project.aiSettings[settingKey]}
                onClick={() => handleAiSettingChange(settingKey, !project.aiSettings[settingKey])}
                className={`${project.aiSettings[settingKey] ? 'bg-sky-500' : 'bg-slate-600'} relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-slate-800`}
            >
                <span className={`${project.aiSettings[settingKey] ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`} />
            </button>
        </div>
    );

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-bold text-sky-400 mb-4">KI Co-Pilot Einstellungen</h3>
            <p className="text-sm text-slate-400 mb-6">
                Aktivieren oder deaktivieren Sie die intelligenten Assistenten, die Ihnen bei der Projektplanung helfen.
            </p>
            <SettingToggle
                settingKey="enableRoomSuggestions"
                label="Intelligente Raum-Vorschläge"
                description="Schlägt automatisch Funktionen für neu erstellte, leere Räume basierend auf deren Namen vor."
            />
            <SettingToggle
                settingKey="enableTemplateLearning"
                label="Vorlagen lernen"
                description="Ermöglicht das Speichern von konfigurierten Räumen als neue, wiederverwendbare Vorlagen."
            />
            <SettingToggle
                settingKey="enableFullAnalysis"
                label="Projekt-Analyse"
                description="Aktiviert den 'Projekt analysieren'-Button, um das gesamte Projekt auf Konsistenz und Vollständigkeit zu prüfen."
            />
            <SettingToggle
                settingKey="enableConsistencyChecks"
                label="Konsistenz-Prüfer (demnächst)"
                description="Überprüft Namenskonventionen und Adress-Strukturen und weist auf Abweichungen hin."
            />
             <SettingToggle
                settingKey="enableProactiveLogic"
                label="Proaktive Logik (demnächst)"
                description="Macht Vorschläge für erweiterte Logik wie Szenen oder Zentralfunktionen basierend auf der Raumausstattung."
            />
        </div>
    );
};


const ViewSettingsEditor: React.FC<{ project: Project; setProject: React.Dispatch<React.SetStateAction<Project>> }> = ({ project, setProject }) => {
    const handleViewOptionChange = (field: keyof ViewOptions, value: any) => {
        setProject(p => ({ ...p, viewOptions: { ...p.viewOptions, [field]: value } }));
    };

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-bold text-sky-400 mb-4">Anzeigeoptionen</h3>
            <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                <label htmlFor="expand-toggle" className="font-medium text-slate-300 cursor-pointer select-none">
                    Neue Bereiche/Räume standardmäßig ausklappen
                </label>
                <button
                    id="expand-toggle" role="switch" aria-checked={project.viewOptions.expandNewItems}
                    onClick={() => handleViewOptionChange('expandNewItems', !project.viewOptions.expandNewItems)}
                    className={`${project.viewOptions.expandNewItems ? 'bg-sky-500' : 'bg-slate-600'} relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-slate-800`}
                >
                    <span className={`${project.viewOptions.expandNewItems ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`} />
                </button>
            </div>
        </div>
    );
};


const ShortcutHelp: React.FC = () => (
    <div>
        <h3 className="text-lg font-bold text-sky-400 mb-4">Tastaturkürzel</h3>
        <p className="text-sm text-slate-400 mb-6">
            Verwenden Sie diese Tastenkombinationen, um Ihren Arbeitsablauf zu beschleunigen.
            Auf macOS wird <kbd>Cmd</kbd> anstelle von <kbd>Ctrl</kbd> verwendet.
        </p>
        <div className="space-y-4 text-sm">
            <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                <span className="text-slate-300">Exporte generieren</span>
                <div className="flex items-center gap-1">
                    <kbd>Ctrl</kbd> + <kbd>G</kbd>
                </div>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                <span className="text-slate-300">Neuen Bereich hinzufügen</span>
                <div className="flex items-center gap-1">
                    <kbd>Ctrl</kbd> + <kbd>B</kbd>
                </div>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                <span className="text-slate-300">Projekt zurücksetzen</span>
                <div className="flex items-center gap-1">
                    <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>R</kbd>
                </div>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                <span className="text-slate-300">Einstellungen öffnen/schließen</span>
                <div className="flex items-center gap-1">
                    <kbd>Ctrl</kbd> + <kbd>Alt</kbd> + <kbd>S</kbd>
                </div>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                <span className="text-slate-300">Kompakt-Modus umschalten</span>
                <div className="flex items-center gap-1">
                    <kbd>Ctrl</kbd> + <kbd>K</kbd>
                </div>
            </div>
             <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                <span className="text-slate-300">Shortcut-Hilfe anzeigen</span>
                <kbd>?</kbd>
            </div>
        </div>
    </div>
);


const DeviceConfigEditor: React.FC<{ project: Project; setProject: React.Dispatch<React.SetStateAction<Project>> }> = ({ project, setProject }) => {
    
    const handleConfigChange = (type: FunctionType, field: keyof DeviceConfig, value: any) => {
        setProject(p => ({
            ...p,
            deviceConfig: {
                ...p.deviceConfig,
                [type]: { ...p.deviceConfig[type], [field]: value }
            }
        }));
    };

    const handleFunctionEnabledChange = (type: FunctionType, funcName: string, enabled: boolean) => {
        setProject(p => {
            const newConfig = { ...p.deviceConfig };
            const newFunctions = newConfig[type].functions.map(f => 
                f.name === funcName ? { ...f, enabled } : f
            );
            newConfig[type] = { ...newConfig[type], functions: newFunctions };
            return { ...p, deviceConfig: newConfig };
        });
    };

    return (
        <div className="space-y-4">
            <p className="text-sm text-slate-400">
                Hier legen Sie die Standard-Eigenschaften für neu hinzugefügte Funktionen fest. Änderungen hier beeinflussen <strong>nicht</strong> bereits erstellte Funktionen in Ihrer Projektstruktur.
            </p>
            {Object.entries(project.deviceConfig).map(([key, config]) => {
                const type = key as FunctionType;
                return (
                    <div key={type} className="p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                        <h4 className="font-bold text-sky-400 mb-2">{config.description}</h4>
                        <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                            <div>
                                <label className="block text-xs text-slate-400">Label</label>
                                <input type="text" value={config.label} onChange={e => handleConfigChange(type, 'label', e.target.value)}
                                    className="mt-1 w-full bg-slate-700 p-1 rounded border border-slate-600" />
                            </div>
                            <div>
                                <label className="block text-xs text-slate-400">Mittelgruppe (Aktion)</label>
                                <input type="number" value={config.middleGroup} onChange={e => handleConfigChange(type, 'middleGroup', parseInt(e.target.value) || 0)}
                                    className="mt-1 w-full bg-slate-700 p-1 rounded border border-slate-600" />
                            </div>
                            <div>
                                <label className="block text-xs text-slate-400">Beschreibung</label>
                                <input type="text" value={config.description} onChange={e => handleConfigChange(type, 'description', e.target.value)}
                                    className="mt-1 w-full bg-slate-700 p-1 rounded border border-slate-600" />
                            </div>
                             <div>
                                <label className="block text-xs text-slate-400">Mittelgruppe (RM Var. B)</label>
                                <input type="number" value={config.feedbackMiddleGroup} onChange={e => handleConfigChange(type, 'feedbackMiddleGroup', parseInt(e.target.value) || 0)}
                                    className="mt-1 w-full bg-slate-700 p-1 rounded border border-slate-600" />
                            </div>
                        </div>

                        <div className="border-t border-slate-700 pt-3">
                            <h5 className="text-sm font-semibold text-slate-300 mb-3">Rückmeldungen (RM)</h5>
                            <div className="space-y-3 text-sm">
                                <div className="flex items-center justify-between">
                                    <label htmlFor={`rm-toggle-${type}`} className="font-medium text-slate-300 cursor-pointer select-none">
                                       Rückmelde-GAs erstellen
                                    </label>
                                    <button
                                        id={`rm-toggle-${type}`} role="switch" aria-checked={config.generateFeedback}
                                        onClick={() => handleConfigChange(type, 'generateFeedback', !config.generateFeedback)}
                                        className={`${config.generateFeedback ? 'bg-sky-500' : 'bg-slate-600'} relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-slate-800`}
                                    >
                                        <span className={`${config.generateFeedback ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`} />
                                    </button>
                                </div>
                                <div className="flex items-center justify-between">
                                     <label htmlFor={`rm-variant-${type}`} className={`font-medium text-slate-300 ${!config.generateFeedback ? 'opacity-50' : ''}`}>
                                        Variante für RM-Adressen
                                     </label>
                                     <select
                                        id={`rm-variant-${type}`} value={config.feedbackVariant}
                                        onChange={(e) => handleConfigChange(type, 'feedbackVariant', e.target.value)}
                                        disabled={!config.generateFeedback}
                                        className="bg-slate-700 border border-slate-600 rounded-md px-3 py-1 text-sm text-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500 disabled:opacity-50"
                                    >
                                        <option value="inline">Variante A (Inline)</option>
                                        <option value="separate">Variante B (Separat)</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        
                        <div className="border-t border-slate-700 pt-2 mt-3">
                             <h5 className="text-xs font-semibold text-slate-300 mb-2">Standardmäßig aktive Gruppenadressen:</h5>
                             <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                                {config.functions.filter(f => !f.isFeedback).map(func => (
                                    <div key={func.name} className="flex items-center">
                                        <input type="checkbox" id={`${type}-${func.name}`} checked={func.enabled}
                                            onChange={e => handleFunctionEnabledChange(type, func.name, e.target.checked)}
                                            className="h-4 w-4 rounded bg-slate-700 border-slate-600 text-sky-500 focus:ring-sky-500"
                                        />
                                        <label htmlFor={`${type}-${func.name}`} className="ml-2 text-xs text-slate-300">{func.name}</label>
                                    </div>
                                ))}
                             </div>
                        </div>
                    </div>
                )
            })}
        </div>
    )
};

const RoomTemplateEditor: React.FC<{ project: Project; setProject: React.Dispatch<React.SetStateAction<Project>> }> = ({ project, setProject }) => {
    const [newTemplateName, setNewTemplateName] = useState('');

    const handleAddTemplate = () => {
        if (!newTemplateName.trim()) return;
        const newTemplate: CustomRoomTemplate = {
            id: `template-${Date.now()}`,
            name: newTemplateName,
            functions: {}, // Start with an empty template
        };
        setProject(p => ({ ...p, roomTemplates: [...p.roomTemplates, newTemplate] }));
        setNewTemplateName('');
    };
    
    const handleRemoveTemplate = (templateId: string) => {
        setProject(p => ({ ...p, roomTemplates: p.roomTemplates.filter(t => t.id !== templateId)}));
    };

    const handleFunctionChange = (templateId: string, type: FunctionType, count: number) => {
        setProject(p => ({
            ...p,
            roomTemplates: p.roomTemplates.map(t => {
                if (t.id === templateId) {
                    const newFunctions: RoomFunctionsTemplate = { ...t.functions };
                    if (count > 0) newFunctions[type] = count;
                    else delete newFunctions[type];
                    return { ...t, functions: newFunctions };
                }
                return t;
            })
        }));
    };

    return (
        <div className="space-y-4">
             <div className="flex gap-2 p-2 bg-slate-800/50 rounded-lg border border-slate-700">
                <input
                    type="text" value={newTemplateName}
                    onChange={e => setNewTemplateName(e.target.value)}
                    placeholder="Name für neue Vorlage"
                    className="flex-grow bg-slate-700 p-2 rounded border border-slate-600"
                />
                <button onClick={handleAddTemplate} disabled={!newTemplateName.trim()} className="flex items-center gap-2 bg-sky-600 text-white px-3 py-1.5 rounded-md text-sm font-semibold hover:bg-sky-500 disabled:bg-slate-500">
                    <AddIcon /> Vorlage erstellen
                </button>
            </div>
            {project.roomTemplates.map(template => (
                <div key={template.id} className="p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                    <div className="flex justify-between items-center mb-2">
                        <h4 className="font-bold text-sky-400">{template.name}</h4>
                        <button onClick={() => handleRemoveTemplate(template.id)} className="p-1 text-slate-400 hover:text-red-400"><TrashIcon size={4} /></button>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                        {Object.entries(project.deviceConfig).map(([key, config]) => {
                             const type = key as FunctionType;
                             const count = template.functions[type] || 0;
                             return (
                                 <div key={type} className="flex items-center justify-between bg-slate-700/50 p-2 rounded">
                                     <label className="text-slate-300">{config.description}</label>
                                     <input
                                        type="number" min="0" value={count}
                                        onChange={e => handleFunctionChange(template.id, type, parseInt(e.target.value) || 0)}
                                        className="w-16 text-center bg-slate-800 rounded focus:outline-none focus:ring-1 focus:ring-sky-500"
                                     />
                                 </div>
                             )
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
};


export const SettingsPanel: React.FC<SettingsPanelProps> = ({ isOpen, onClose, project, setProject, initialTab }) => {
    const [activeTab, setActiveTab] = useState<Tab>(initialTab || 'devices');

    useEffect(() => {
        if(isOpen) {
            setActiveTab(initialTab || 'devices');
        }
    }, [isOpen, initialTab]);


    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 z-30" onClick={onClose}>
            <div
                className="fixed top-0 right-0 h-full w-full max-w-2xl bg-slate-800 shadow-2xl border-l border-slate-700 transform transition-transform duration-300 ease-in-out flex flex-col"
                onClick={e => e.stopPropagation()}
                style={{ transform: isOpen ? 'translateX(0)' : 'translateX(100%)' }}
            >
                <header className="flex justify-between items-center p-4 border-b border-slate-700">
                    <h2 className="text-xl font-bold text-slate-200">Einstellungen</h2>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-full"><CloseIcon /></button>
                </header>

                <div className="border-b border-slate-700 px-4">
                    <TabButton active={activeTab === 'devices'} onClick={() => setActiveTab('devices')}>Geräte</TabButton>
                    <TabButton active={activeTab === 'templates'} onClick={() => setActiveTab('templates')}>Vorlagen</TabButton>
                    <TabButton active={activeTab === 'view'} onClick={() => setActiveTab('view')}>Ansicht</TabButton>
                    <TabButton active={activeTab === 'ai'} onClick={() => setActiveTab('ai')}>KI Co-Pilot</TabButton>
                    <TabButton active={activeTab === 'shortcuts'} onClick={() => setActiveTab('shortcuts')}>Shortcuts</TabButton>
                </div>

                <div className="p-4 flex-grow overflow-y-auto">
                    {activeTab === 'devices' && <DeviceConfigEditor project={project} setProject={setProject} />}
                    {activeTab === 'templates' && <RoomTemplateEditor project={project} setProject={setProject} />}
                    {activeTab === 'view' && <ViewSettingsEditor project={project} setProject={setProject} />}
                    {activeTab === 'ai' && <AiSettingsEditor project={project} setProject={setProject} />}
                    {activeTab === 'shortcuts' && <ShortcutHelp />}
                </div>
            </div>
        </div>
    );
};
