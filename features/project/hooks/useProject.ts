import { useState, useEffect, useMemo, useCallback } from 'react';
import { Project, Area, AiProjectSuggestion, Room, RoomFunctionsTemplate, CustomRoomTemplate } from '../../../domain';
import { generateGroupAddresses } from '../../../domain';
import { generateXml } from '../../../adapters/exporters/xml';
import { generateCsv } from '../../../adapters/exporters/csv';
import { PROJECT_TEMPLATES, createFunctionInstancesForTemplate } from '../../../adapters/templates/roomTemplates';
import { getInitialProject, loadProject, saveProject } from '../../../adapters/persistence/localStorage';

export const useProject = (showToast: (message: string) => void) => {
    const [project, setProject] = useState<Project>(loadProject());
    const [lastGeneratedXml, setLastGeneratedXml] = useState<string>('');
    const [lastGeneratedCsv, setLastGeneratedCsv] = useState<string>('');
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    useEffect(() => {
        saveProject(project);
    }, [project]);

    const generatedGAs = useMemo(() => {
        if (project.areas.length === 0) return [];
        return generateGroupAddresses(project);
    }, [project]);

    const handleProjectChange = useCallback((field: keyof Project, value: any) => {
        setProject(p => ({ ...p, [field]: value }));
    }, []);
    
    const handleTemplateChange = useCallback((templateKey: string) => {
        if (!templateKey) {
            setProject(p => ({ ...p, name: 'Neues Projekt', areas: [] }));
            return;
        }
        const template = PROJECT_TEMPLATES[templateKey];
        if (template) {
            // Konvertiere die Vorlage in das neue Datenmodell mit functionInstances
            const newAreas = template.areas.map(areaProto => ({
                ...areaProto,
                id: `area-${Math.random()}`,
                isExpanded: true,
                rooms: areaProto.rooms.map(roomProto => ({
                    id: `room-${Math.random()}`,
                    name: roomProto.name,
                    isExpanded: true,
                    functionInstances: createFunctionInstancesForTemplate(roomProto.functions, project.deviceConfig)
                }))
            }));
            setProject(p => ({ ...p, name: template.name, areas: newAreas }));
        }
    }, [project.deviceConfig]);
    
    const handleAddArea = useCallback(() => {
        const { areas, viewOptions } = project;
        const lastArea = areas[areas.length - 1];
        let newArea: Area;
        if(lastArea) {
             newArea = JSON.parse(JSON.stringify(lastArea)); // Deep copy
             newArea.id = `area-${Date.now()}`;
             newArea.name = `${lastArea.name.replace(/\d+$/, '')} ${areas.length + 1}`;
             newArea.mainGroup = lastArea.mainGroup + 1;
             newArea.rooms = []; // Start with no rooms
             newArea.isExpanded = viewOptions.expandNewItems;
        } else {
            newArea = {
                id: `area-${Date.now()}`, name: `Bereich 1`, abbreviation: 'B1',
                mainGroup: 1, rooms: [], isExpanded: viewOptions.expandNewItems,
            };
        }
        setProject(p => ({ ...p, areas: [...p.areas, newArea] }));
        showToast("Neuer Bereich hinzugefügt");
    }, [project, showToast]);

    const handleResetProject = useCallback(() => {
        if(window.confirm("Möchten Sie das gesamte Projekt wirklich zurücksetzen? Alle Daten gehen verloren.")) {
            const initial = getInitialProject();
            // Behalte benutzerdefinierte Vorlagen und die aktuelle Gerätekonfiguration bei
            setProject(p => ({
                ...initial, 
                name: '', 
                roomTemplates: p.roomTemplates,
                deviceConfig: p.deviceConfig,
                aiSettings: p.aiSettings, // Behalte auch KI-Einstellungen
            }));
            setLastGeneratedXml('');
            setLastGeneratedCsv('');
        }
    }, []);

    const handleGenerateExports = useCallback(() => {
        setLastGeneratedXml(generateXml(generatedGAs, project));
        setLastGeneratedCsv(generateCsv(generatedGAs));
        showToast('Exporte erfolgreich generiert!');
    }, [generatedGAs, project, showToast]);

    const handleApplyAiSuggestion = useCallback((suggestion: AiProjectSuggestion) => {
        const lastMainGroup = project.areas.reduce((max, area) => Math.max(max, area.mainGroup), 0);
    
        const newAreas: Area[] = suggestion.map((areaSugg, index) => ({
            id: `area-${Date.now()}-${index}`,
            name: areaSugg.name,
            abbreviation: areaSugg.abbreviation,
            mainGroup: lastMainGroup + index + 1,
            isExpanded: project.viewOptions.expandNewItems,
            rooms: areaSugg.rooms.map((roomSugg, roomIndex) => ({
                id: `room-${Date.now()}-${index}-${roomIndex}`,
                name: roomSugg.name,
                isExpanded: project.viewOptions.expandNewItems,
                functionInstances: createFunctionInstancesForTemplate(roomSugg.functions, project.deviceConfig)
            }))
        }));
    
        setProject(p => ({
            ...p,
            name: p.name || "KI-generiertes Projekt", // Set a name if empty
            areas: [...p.areas, ...newAreas]
        }));
        showToast("KI-Vorschlag wurde dem Projekt hinzugefügt!");
    }, [project.areas, project.deviceConfig, project.viewOptions.expandNewItems, showToast]);

    const handleLearnTemplateFromRoom = useCallback((room: Room) => {
        if (!project.aiSettings.enableTemplateLearning) {
            showToast("Funktion in den KI Co-Pilot Einstellungen deaktiviert.");
            return;
        }

        const name = window.prompt(`Wie soll die neue Vorlage basierend auf "${room.name}" heißen?`, `Vorlage: ${room.name}`);
        if (!name || !name.trim()) return;

        const functions: RoomFunctionsTemplate = {};
        for (const instance of room.functionInstances) {
            functions[instance.type] = (functions[instance.type] || 0) + 1;
        }

        const newTemplate: CustomRoomTemplate = {
            id: `template-${Date.now()}`,
            name: name.trim(),
            functions,
        };

        setProject(p => ({
            ...p,
            roomTemplates: [...p.roomTemplates, newTemplate]
        }));
        showToast(`Vorlage "${name.trim()}" wurde gespeichert!`);
    }, [project.aiSettings.enableTemplateLearning, showToast]);

    return {
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
    };
};
