import { ProjectTemplate, ProjectDeviceConfig, FunctionInstance, RoomFunctionsTemplate } from '../../domain';

// Hilfsfunktion, um aus Vorlagen das neue `functionInstances`-Array zu erstellen.
// Nimmt die Zähler aus der Vorlage und erstellt Instanzen mit der aktuellen Gerätekonfiguration.
export const createFunctionInstancesForTemplate = (
    functions: RoomFunctionsTemplate,
    deviceConfig: ProjectDeviceConfig
): FunctionInstance[] => {
    const instances: FunctionInstance[] = [];
    for (const key in functions) {
        const type = key as keyof RoomFunctionsTemplate;
        const count = functions[type] || 0;
        const config = deviceConfig[type];
        if (config) {
            for (let i = 0; i < count; i++) {
                instances.push({
                    id: `instance-${Date.now()}-${Math.random()}`,
                    type,
                    configSnapshot: JSON.parse(JSON.stringify(config)), // Wichtig: Snapshot der aktuellen Konfig!
                });
            }
        }
    }
    return instances;
};

// Projektvorlagen, die die Zähler-Struktur beibehalten für einfache Definition.
export const PROJECT_TEMPLATES: { [key: string]: ProjectTemplate } = {
    residential: {
        name: "Einfamilienhaus Standard",
        areas: [
            { name: 'Erdgeschoss', abbreviation: 'EG', mainGroup: 1, rooms: [
                { name: 'Wohnen/Essen', functions: { lightDim: 2, lightSwitch: 1, blinds: 1, heating: 1 } },
                { name: 'Küche', functions: { lightSwitch: 1, blinds: 1 } },
                { name: 'Flur', functions: { lightSwitch: 1 } },
            ]},
            { name: 'Obergeschoss', abbreviation: 'OG', mainGroup: 2, rooms: [
                { name: 'Schlafen', functions: { lightDim: 1, blinds: 1, heating: 1 } },
                { name: 'Badezimmer', functions: { lightSwitch: 2, heating: 1 } },
                { name: 'Kind 1', functions: { lightSwitch: 1, blinds: 1, heating: 1 } },
            ]}
        ]
    },
    apartment: {
        name: "Wohnung Standard",
        areas: [
            { name: 'Wohnung', abbreviation: 'W', mainGroup: 1, rooms: [
                { name: 'Wohnen/Essen', functions: { lightDim: 1, blinds: 1, heating: 1 } },
                { name: 'Schlafen', functions: { lightSwitch: 1, blinds: 1 } },
                { name: 'Bad', functions: { lightSwitch: 1 } },
            ]}
        ]
    }
};
