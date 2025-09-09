// Definiert die verfügbaren Funktionstypen. Entspricht den Schlüsseln in der Gerätekonfiguration.
export type FunctionType = 'lightSwitch' | 'lightDim' | 'blinds' | 'heating';

// --- Konfiguration und Vorlagen ---

export interface GaFunction {
  name: string;
  dpt: string;
  offset: number;
  isFeedback?: boolean;
  enabled: boolean; // NEU: Ermöglicht das Deaktivieren von Unter-Funktionen
}

export interface DeviceConfig {
  label: string;
  description: string;
  middleGroup: number;
  feedbackMiddleGroup?: number; // Für Variante B
  generateFeedback: boolean; // NEU: Granulare RM-Steuerung pro Gerätetyp
  feedbackVariant: 'inline' | 'separate'; // NEU: Granulare RM-Variante pro Gerätetyp
  functions: GaFunction[];
}

// Die gesamte anpassbare Konfiguration für Gerätetypen
export type ProjectDeviceConfig = {
  [key in FunctionType]: DeviceConfig;
};

// NEU: Ein "Schnappschuss" der Konfiguration, wie sie beim Erstellen der Funktion war.
// Dies ist der Kern der nicht-rückwirkenden Änderungslogik.
export interface FunctionInstance {
  id: string;
  type: FunctionType;
  configSnapshot: DeviceConfig;
}

export interface Room {
  id: string;
  name: string; // z.B. "Wohnzimmer"
  // ERSETZT: `functions: RoomFunctions;`
  functionInstances: FunctionInstance[];
  isExpanded?: boolean; // NEU: Speicher den Zustand
}

export interface Area {
  id: string;
  name: string; // z.B. "Erdgeschoss"
  abbreviation: string; // z.B. "EG", wird für GA-Namen verwendet
  mainGroup: number;
  rooms: Room[];
  isExpanded?: boolean; // NEU: Speicher den Zustand
}


// Behält die alte Struktur für einfache Vorlagendefinitionen
export type RoomFunctionsTemplate = {
  [key in FunctionType]?: number;
};
export interface CustomRoomTemplate {
  id:string;
  name: string;
  functions: RoomFunctionsTemplate;
}

// Globale Projekteinstellungen
export interface ProjectSettings {
  // createFeedbackGAs und feedbackVariant wurden in die DeviceConfig verschoben
}

// Optionen für die Benutzeroberfläche
export interface ViewOptions {
  compactMode: boolean;
  expandNewItems: boolean; // NEU: Steuert das Standardverhalten
}

// NEU: Einstellungen für den KI Co-Pilot
export interface AiSettings {
  enableRoomSuggestions: boolean;
  enableConsistencyChecks: boolean;
  enableProactiveLogic: boolean;
  enableFullAnalysis: boolean;
  enableTemplateLearning: boolean;
}


// Das gesamte Projekt-Objekt, das im Local Storage gespeichert wird
export interface Project {
  name: string;
  areas: Area[];
  settings: ProjectSettings;
  deviceConfig: ProjectDeviceConfig;
  roomTemplates: CustomRoomTemplate[];
  viewOptions: ViewOptions;
  aiSettings: AiSettings;
}

// Struktur für vordefiniertes Projektvorlagen
export interface ProjectTemplate {
  name: string;
  areas: (Omit<Area, 'id' | 'rooms' | 'isExpanded'> & {
    rooms: (Omit<Room, 'id' | 'functionInstances' | 'isExpanded'> & { functions: RoomFunctionsTemplate })[];
  })[];
}

// --- Generierungs-Typen ---

export interface GroupAddress {
  address: string;
  name: string;
  dpt: string;
  description: string;
}

// --- KI-Assistent Typen ---

export type AiFunctionSuggestion = RoomFunctionsTemplate;

export interface AiRoomSuggestion {
  id: string;
  name: string;
  functions: AiFunctionSuggestion;
}

export interface AiAreaSuggestion {
  id: string;
  name: string;
  abbreviation: string;
  rooms: AiRoomSuggestion[];
}

export type AiProjectSuggestion = AiAreaSuggestion[];
