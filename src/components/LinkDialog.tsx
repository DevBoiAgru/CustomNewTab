import React, { useState } from 'react';

interface LinkDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (name: string, url: string) => void;
}

export default function LinkDialog({ isOpen, onClose, onSubmit }: LinkDialogProps) {
    const [name, setName] = useState('');
    const [url, setUrl] = useState('');

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(name, url);
        setName('');
        setUrl('');
        onClose();
    };

    return (
        <div className="dialog-overlay">
            <div className="dialog">
                <h3>Add Link</h3>
                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        placeholder="Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                    <input
                        type="url"
                        placeholder="URL (https://youtube.com)"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        required
                    />
                    <div className="dialog-buttons">
                        <button type="button" onClick={onClose}>Cancel</button>
                        <button type="submit">Add</button>
                    </div>
                </form>
            </div>
        </div>
    );
} 