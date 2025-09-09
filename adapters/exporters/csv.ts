import { GroupAddress } from '../../domain';

export const generateCsv = (gas: GroupAddress[]): string => {
    if (gas.length === 0) return '';
    
    const header = '"Adresse","Name","Beschreibung","DPT"\n';
    const rows = gas.map(ga => {
        const values = [ga.address, ga.name, ga.description, ga.dpt];
        return values.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',');
    }).join('\n');
    
    return header + rows;
};
