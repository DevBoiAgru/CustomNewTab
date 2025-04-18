import { useState } from 'react';

interface SettingsProps {
    isOpen: boolean;
    onClose: () => void;
    onImport: (data: string) => void;
    stickies: any[];
    onClearAll: () => void;
}

export default function Settings({ isOpen, onClose, onImport, stickies, onClearAll }: SettingsProps) {
    const [importData, setImportData] = useState('');

    if (!isOpen) return null;

    const handleExport = () => {
        const data = JSON.stringify(stickies, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'stickies-config.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleImport = () => {
        try {
            if (!importData.trim()) {
                alert('Please enter JSON data to import');
                return;
            }
            onImport(importData);
            setImportData('');
            onClose();
        } catch (error) {
            alert('Invalid JSON data. Please check your input and try again.');
        }
    };

    const handleClearAll = () => {
        if (window.confirm('Are you sure you want to clear all elements? This action cannot be undone.')) {
            onClearAll();
            onClose();
        }
    };

    return (
        <div className="dialog-overlay">
            <div className="dialog settings-dialog">
                <h3>Settings</h3>
                <div className="settings-section">
                    <h4>Export Configuration</h4>
                    <button onClick={handleExport}>Export Stickies</button>
                </div>
                <div className="settings-section">
                    <h4>Import Configuration</h4>
                    <textarea
                        value={importData}
                        onChange={(e) => setImportData(e.target.value)}
                        placeholder="Paste your configuration JSON here"
                    />
                    <button onClick={handleImport}>Import Stickies</button>
                </div>
                <div className="settings-section danger-section">
                    <h4>Danger Zone</h4>
                    <button onClick={handleClearAll} className="danger-button">Clear All Elements</button>
                </div>
                <div className="dialog-buttons">
                    <button onClick={onClose}>Close</button>
                </div>
            </div>
        </div>
    );
} 