import { Project, GroupAddress, FunctionType } from '../contracts/types';
import { SCENE_MAIN_GROUP, CENTRAL_MAIN_GROUP } from '../../adapters/config/constants';

const createGA = (main: number, middle: number, sub: number, name: string, dpt: string, description: string): GroupAddress => ({
    address: `${main}/${middle}/${sub}`,
    name,
    dpt,
    description
});

export const generateGroupAddresses = (project: Project): GroupAddress[] => {
    const allGAs: GroupAddress[] = [];
    const seenAddresses = new Set<string>(); // For preventing duplicates

    const addUniqueGA = (ga: GroupAddress) => {
        if (!seenAddresses.has(ga.address)) {
            allGAs.push(ga);
            seenAddresses.add(ga.address);
        }
    };
    
    const { areas } = project;

    // Zähler für die fortlaufende Nummer pro Funktionstyp über das gesamte Projekt
    const functionTypeCounters: { [key in FunctionType]?: number } = {};

    areas.forEach(area => {
        area.rooms.forEach((room, roomIndex) => {
            const roomIdentifier = `${area.abbreviation}.${String(roomIndex + 1).padStart(2, '0')}`;
            
            // Zähler für die Nummerierung der Instanzen eines Typs *innerhalb* eines Raumes (z.B. Deckenleuchte 1, Deckenleuchte 2)
            const instanceInRoomCounter: { [key in FunctionType]?: number } = {};

            room.functionInstances.forEach(instance => {
                const { type, configSnapshot } = instance;

                // Projektweiter Zähler für die Unteradressen-Blöcke
                functionTypeCounters[type] = (functionTypeCounters[type] || 0) + 1;
                const absoluteInstanceNumber = functionTypeCounters[type]!;

                // Raum-interner Zähler für die Benennung
                instanceInRoomCounter[type] = (instanceInRoomCounter[type] || 0) + 1;
                const relativeInstanceNumber = instanceInRoomCounter[type]!;

                const subAddressOffset = (absoluteInstanceNumber - 1) * 10;
                const gaLabelBase = `${configSnapshot.label}_${roomIdentifier}_${String(relativeInstanceNumber).padStart(2, '0')}`;

                // Generiere GAs nur für aktivierte Unter-Funktionen aus dem Snapshot
                configSnapshot.functions.forEach(func => {
                    if (!func.enabled) return;
                    if (func.isFeedback && !configSnapshot.generateFeedback) return;

                    let middleGroup = configSnapshot.middleGroup;
                    if (func.isFeedback && configSnapshot.feedbackVariant === 'separate' && configSnapshot.feedbackMiddleGroup) {
                        middleGroup = configSnapshot.feedbackMiddleGroup;
                    }

                    const subAddress = subAddressOffset + func.offset;
                    const gaName = `${gaLabelBase} ${func.name}`;
                    const gaDescription = `(${room.name} ${configSnapshot.description} ${relativeInstanceNumber})`;

                    addUniqueGA(createGA(area.mainGroup, middleGroup, subAddress, gaName, func.dpt, gaDescription));
                });
            });
        });
    });

    // --- Szenen ---
    let sceneCounter = 1;
    areas.forEach(area => {
        area.rooms.forEach(room => {
             const hasScenes = room.functionInstances.some(inst => inst.type === 'lightDim');
             if (hasScenes) {
                 addUniqueGA(createGA(SCENE_MAIN_GROUP, area.mainGroup, sceneCounter, `Szene Abruf ${room.name}`, "18.001", `(${room.name})`));
                 sceneCounter++;
             }
        });
    });

    // --- Zentralfunktionen ---
    addUniqueGA(createGA(CENTRAL_MAIN_GROUP, 0, 1, `Zentral Alles AUS`, "1.001", "(Gesamtes Gebäude)"));
    addUniqueGA(createGA(CENTRAL_MAIN_GROUP, 0, 2, `Zentral Beleuchtung AUS`, "1.001", "(Alle Lichter)"));
    addUniqueGA(createGA(CENTRAL_MAIN_GROUP, 1, 1, `Zentral Jalousien AUF`, "1.008", "(Alle Jalousien)"));
    addUniqueGA(createGA(CENTRAL_MAIN_GROUP, 1, 2, `Zentral Jalousien AB`, "1.008", "(Alle Jalousien)"));

    // Sortieren für eine saubere Ausgabe
    return allGAs.sort((a,b) => {
        const [a1,a2,a3] = a.address.split('/').map(Number);
        const [b1,b2,b3] = b.address.split('/').map(Number);
        if(a1 !== b1) return a1 - b1;
        if(a2 !== b2) return a2 - b2;
        return a3 - b3;
    });
};
