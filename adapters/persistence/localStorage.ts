import { Project, FunctionType, ViewOptions, AiSettings } from '../../domain';
import { DEFAULT_DEVICE_CONFIG } from '../config/deviceConfig';

const STORAGE_KEY = 'knx-project-data-v3';

export const getInitialProject = (): Project => ({
    name: '',
    areas: [],
    settings: {},
    deviceConfig: JSON.parse(JSON.stringify(DEFAULT_DEVICE_CONFIG)),
    roomTemplates: [],
    viewOptions: { compactMode: false, expandNewItems: true },
    aiSettings: {
        enableRoomSuggestions: true,
        enableConsistencyChecks: true,
        enableProactiveLogic: true,
        enableFullAnalysis: true,
        enableTemplateLearning: true,
    },
});

export const saveProject = (project: Project): void => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(project));
    } catch (error) {
        console.error("Fehler beim Speichern des Projekts:", error);
    }
};

export const loadProject = (): Project => {
    try {
        const savedProject = localStorage.getItem(STORAGE_KEY);
        if (savedProject) {
            const parsed = JSON.parse(savedProject);
            const initial = getInitialProject();

            // --- MIGRATION & DEEP MERGE ---
        
            // Migriert alte globale RM-Einstellungen zu granularen Einstellungen pro Gerätetyp
            if (parsed.settings && parsed.settings.createFeedbackGAs !== undefined) {
                console.log("Migrating project to new feedback settings...");
                const globalCreateFeedback = parsed.settings.createFeedbackGAs;
                const globalFeedbackVariant = parsed.settings.feedbackVariant || 'inline';

                for (const key in parsed.deviceConfig) {
                    if (Object.prototype.hasOwnProperty.call(parsed.deviceConfig, key)) {
                        const deviceConf = parsed.deviceConfig[key as FunctionType];
                        if (deviceConf.generateFeedback === undefined) {
                           deviceConf.generateFeedback = globalCreateFeedback;
                        }
                        if (deviceConf.feedbackVariant === undefined) {
                            deviceConf.feedbackVariant = globalFeedbackVariant;
                        }
                    }
                }
                delete parsed.settings.createFeedbackGAs;
                delete parsed.settings.feedbackVariant;
            }

            // Führt deviceConfig tief zusammen, um neue Eigenschaften aus der Standardkonfiguration hinzuzufügen
            const mergedDeviceConfig = initial.deviceConfig;
            if (parsed.deviceConfig) {
                for (const key of Object.keys(mergedDeviceConfig)) {
                     const type = key as FunctionType;
                     if (parsed.deviceConfig[type]) {
                         mergedDeviceConfig[type] = { ...mergedDeviceConfig[type], ...parsed.deviceConfig[type] };
                     }
                }
            }

            return {
                ...initial,
                ...parsed,
                settings: { ...initial.settings, ...(parsed.settings || {}) },
                deviceConfig: mergedDeviceConfig,
                viewOptions: { ...initial.viewOptions, ...(parsed.viewOptions || {}) },
                aiSettings: { ...initial.aiSettings, ...(parsed.aiSettings || {}) },
            };
        }
    } catch (error) {
        console.error("Fehler beim Laden des Projekts:", error);
    }
    return getInitialProject();
};
