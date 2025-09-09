import { useState, useCallback, useEffect } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { AiProjectSuggestion, AiFunctionSuggestion } from '../../../domain';

// Helper to convert a file to a base64 string
const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = error => reject(error);
    });
};

const wizardResponseSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      name: { type: Type.STRING, description: "Name des Bereichs, z.B. 'Erdgeschoss'" },
      abbreviation: { type: Type.STRING, description: "Eine kurze, einzigartige Abkürzung für den Bereich, z.B. 'EG', max 3 Zeichen." },
      rooms: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING, description: "Name des Raumes, z.B. 'Wohnzimmer'" },
            functions: {
              type: Type.OBJECT,
              description: "Ein Objekt, das die Anzahl der jeweiligen Funktionen enthält. Nur Funktionen mit einer Anzahl > 0 aufnehmen.",
              properties: {
                lightSwitch: { type: Type.INTEGER, description: "Anzahl schaltbarer Lichter" },
                lightDim: { type: Type.INTEGER, description: "Anzahl dimmbarer Lichter" },
                blinds: { type: Type.INTEGER, description: "Anzahl Jalousien/Rollläden" },
                heating: { type: Type.INTEGER, description: "Anzahl Heizungsregler" }
              }
            }
          },
          required: ['name', 'functions']
        }
      }
    },
    required: ['name', 'abbreviation', 'rooms']
  }
};

const wizardSystemInstruction = `Du bist ein Experte für KNX-Gebäudeautomation. Deine Aufgabe ist es, aus einer textuellen Beschreibung oder einem Grundriss eine KNX-Projektstruktur zu extrahieren. Identifiziere Bereiche (Stockwerke) und Räume. Weise jedem Raum basierend auf seiner typischen Nutzung Standard-KNX-Funktionen zu. Verwende nur diese Funktionstypen: 'lightSwitch', 'lightDim', 'blinds', 'heating'. Generiere sinnvolle, kurze Abkürzungen für die Bereiche.`;


export const useAiProjectGenerator = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [suggestion, setSuggestion] = useState<AiProjectSuggestion | null>(null);

    const generateProject = useCallback(async (text: string, imageFile?: File | null) => {
        setIsLoading(true);
        setError(null);
        setSuggestion(null);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            
            const parts: any[] = [{ text }];

            if (imageFile) {
                const base64Data = await fileToBase64(imageFile);
                parts.unshift({
                    inlineData: {
                        mimeType: imageFile.type,
                        data: base64Data,
                    },
                });
            }

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: { parts },
                config: {
                    systemInstruction: wizardSystemInstruction,
                    responseMimeType: "application/json",
                    responseSchema: wizardResponseSchema,
                },
            });

            const jsonString = response.text.trim();
            let parsedJson = JSON.parse(jsonString);

            // Add unique IDs for easier state management in React
            parsedJson = parsedJson.map((area: any) => ({
                ...area,
                id: `ai-area-${Math.random()}`,
                rooms: area.rooms.map((room: any) => ({
                    ...room,
                    id: `ai-room-${Math.random()}`
                }))
            }));

            setSuggestion(parsedJson);

        } catch (e) {
            console.error("Error generating project structure:", e);
            setError("Fehler bei der Generierung des Vorschlags. Bitte versuchen Sie es erneut.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    return { isLoading, error, suggestion, generateProject, setSuggestion };
};


// --- NEUER HOOK für kontextbezogene Raum-Vorschläge ---

const roomSuggestionSchema = {
    type: Type.OBJECT,
    description: "Ein Objekt, das die Anzahl der jeweiligen Funktionen enthält. Nur Funktionen mit einer Anzahl > 0 aufnehmen.",
    properties: {
        lightSwitch: { type: Type.INTEGER, description: "Anzahl schaltbarer Lichter" },
        lightDim: { type: Type.INTEGER, description: "Anzahl dimmbarer Lichter" },
        blinds: { type: Type.INTEGER, description: "Anzahl Jalousien/Rollläden" },
        heating: { type: Type.INTEGER, description: "Anzahl Heizungsregler" }
    }
};

export const useRoomSuggestion = (roomName: string, isEnabled: boolean) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [suggestion, setSuggestion] = useState<AiFunctionSuggestion | null>(null);

    const generateSuggestion = useCallback(async (name: string) => {
        if (!name.trim() || !isEnabled) {
            setSuggestion(null);
            return;
        }
        
        setIsLoading(true);
        setError(null);
        setSuggestion(null);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: `Basierend auf dem Raumnamen "${name}", schlage eine typische Ausstattung mit KNX-Funktionen vor.`,
                config: {
                    systemInstruction: `Du bist ein KNX-Experte. Deine Aufgabe ist es, für einen gegebenen Raumnamen eine sinnvolle Grundausstattung an Funktionen vorzuschlagen. Antworte ausschließlich mit einem JSON-Objekt, das dem vorgegebenen Schema entspricht. Halte die Anzahl der Funktionen realistisch für einen typischen Raum dieser Art in einem Wohngebäude.`,
                    responseMimeType: "application/json",
                    responseSchema: roomSuggestionSchema,
                },
            });

            const jsonString = response.text.trim();
            const parsedJson: AiFunctionSuggestion = JSON.parse(jsonString);

            // Nur Vorschläge anzeigen, die auch Inhalt haben
            if (Object.keys(parsedJson).length > 0) {
                setSuggestion(parsedJson);
            }

        } catch (e) {
            console.error("Error generating room suggestion:", e);
            setError("Fehler beim Abrufen des Vorschlags.");
        } finally {
            setIsLoading(false);
        }
    }, [isEnabled]);
    
    useEffect(() => {
        // Trigger generation when debounced room name changes
        generateSuggestion(roomName);
    }, [roomName, generateSuggestion]);

    const clearSuggestion = useCallback(() => {
        setSuggestion(null);
        setError(null);
    }, []);

    return { isLoading, error, suggestion, clearSuggestion };
};
