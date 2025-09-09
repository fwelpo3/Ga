import React from 'react';
import { GroupAddress } from '../../../domain';

interface PreviewPanelProps {
    generatedGAs: GroupAddress[];
}

export const PreviewPanel: React.FC<PreviewPanelProps> = ({ generatedGAs }) => {
    return (
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl shadow-lg flex flex-col flex-grow min-h-[400px]">
            <h2 className="text-lg font-semibold text-slate-200 p-4 border-b border-slate-700">
                Vorschau der Gruppenadressen
            </h2>
            <div className="flex-grow overflow-auto">
                <table className="w-full text-sm text-left font-mono">
                    <thead className="text-xs text-slate-400 uppercase bg-slate-700/50 sticky top-0 z-10">
                        <tr>
                            <th scope="col" className="px-3 py-2">Adresse</th>
                            <th scope="col" className="px-3 py-2">Name</th>
                            <th scope="col" className="px-3 py-2">Beschreibung</th>
                            <th scope="col" className="px-3 py-2">DPT</th>
                        </tr>
                    </thead>
                    <tbody className="text-slate-300">
                        {generatedGAs.length > 0 ? (
                            generatedGAs.map((ga) => (
                                <tr key={ga.address} className="border-b border-slate-700/50 hover:bg-slate-800/40">
                                    <td className="px-3 py-1.5 text-sky-400 whitespace-nowrap">{ga.address}</td>
                                    <td className="px-3 py-1.5 whitespace-nowrap">{ga.name}</td>
                                    <td className="px-3 py-1.5 text-slate-400">{ga.description}</td>
                                    <td className="px-3 py-1.5 text-amber-400 whitespace-nowrap">{ga.dpt}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={4} className="text-center py-8 text-slate-400 font-sans">
                                    Keine Gruppenadressen zum Anzeigen.
                                    <br />
                                    <span className="text-xs">Beginnen Sie mit der Erstellung Ihrer Projektstruktur.</span>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
