// Sticky.tsx
import React, { useRef, useEffect, useState } from "react";
import { StickyNote } from "./Whiteboard";

interface StickyProps {
    note: StickyNote;
    onMouseDown: (e: React.MouseEvent, id: string) => void;
    onChange: (id: string, changes: Partial<StickyNote>) => void;
    onDelete: (id: string) => void;
}

export default function Sticky({ note, onMouseDown, onChange, onDelete }: StickyProps) {
    const stickyRef = useRef<HTMLDivElement>(null);
    const resizeRef = useRef<HTMLDivElement>(null);
    const [isSelected, setIsSelected] = useState(false);
    const [isResizing, setIsResizing] = useState(false);
    const [startPos, setStartPos] = useState({ x: 0, y: 0 });
    const [startSize, setStartSize] = useState({ width: 0, height: 0 });

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (stickyRef.current && !stickyRef.current.contains(e.target as Node)) {
                setIsSelected(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isResizing) return;

            const deltaX = e.clientX - startPos.x;
            const deltaY = e.clientY - startPos.y;

            const newWidth = Math.max(150, startSize.width + deltaX);
            const newHeight = Math.max(150, startSize.height + deltaY);

            onChange(note.id, { width: newWidth, height: newHeight });
        };

        const handleMouseUp = () => {
            setIsResizing(false);
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };

        if (isResizing) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isResizing, startPos, startSize, note.id, onChange]);

    const handleResizeMouseDown = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (stickyRef.current) {
            const rect = stickyRef.current.getBoundingClientRect();
            setStartPos({ x: e.clientX, y: e.clientY });
            setStartSize({ width: rect.width, height: rect.height });
            setIsResizing(true);
        }
    };

    return (
        <div
            ref={stickyRef}
            className={`sticky ${isSelected ? 'selected' : ''}`}
            style={{ 
                left: note.x, 
                top: note.y,
                width: note.width || 150,
                height: note.type === "heading" ? "auto" : (note.height || 150)
            }}
            onMouseDown={(e) => {
                if (!isResizing) {
                    onMouseDown(e, note.id);
                    setIsSelected(true);
                }
            }}
            data-type={note.type}
        >
            <div className="sticky-header">
                {note.type === "note" ? (
                    <input
                        type="text"
                        className="sticky-heading"
                        placeholder="Heading"
                        value={note.heading || ""}
                        onChange={(e) => onChange(note.id, { heading: e.target.value })}
                    />
                ) : (
                    <input
                        type="text"
                        className="sticky-heading"
                        placeholder="Heading"
                        value={note.text}
                        onChange={(e) => onChange(note.id, { text: e.target.value })}
                    />
                )}
                <button 
                    className="delete-button"
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete(note.id);
                    }}
                >
                    ×
                </button>
            </div>
            {note.type === "note" && (
                <textarea
                    value={note.text}
                    onChange={(e) => onChange(note.id, { text: e.target.value })}
                />
            )}
            <div 
                className="resize-handle" 
                ref={resizeRef}
                onMouseDown={handleResizeMouseDown}
            />
        </div>
    );
}
