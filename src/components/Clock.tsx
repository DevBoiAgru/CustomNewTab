import React, { useState, useEffect, useRef } from 'react';

interface ClockProps {
    x: number;
    y: number;
    id: string;
    onMouseDown: (e: React.MouseEvent, id: string) => void;
    onDelete: (id: string) => void;
    onChange: (id: string, changes: { width?: number; height?: number }) => void;
    width?: number;
    height?: number;
    isSelected: boolean;
}

export default function Clock({ x, y, id, onMouseDown, onDelete, onChange, width, height, isSelected }: ClockProps) {
    const [time, setTime] = useState<string>('');
    const [isResizing, setIsResizing] = useState(false);
    const [startPos, setStartPos] = useState({ x: 0, y: 0 });
    const [startSize, setStartSize] = useState({ width: 0, height: 0 });
    const clockRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const updateTime = () => {
            const now = new Date();
            const hours = now.getHours().toString().padStart(2, '0');
            const minutes = now.getMinutes().toString().padStart(2, '0');
            setTime(`${hours}:${minutes}`);
        };

        updateTime();
        const interval = setInterval(updateTime, 1000);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isResizing) return;

            const deltaX = e.clientX - startPos.x;
            const deltaY = e.clientY - startPos.y;

            const newWidth = Math.max(150, startSize.width + deltaX);
            const newHeight = Math.max(150, startSize.height + deltaY);

            onChange(id, { width: newWidth, height: newHeight });
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
    }, [isResizing, startPos, startSize, id, onChange]);

    const handleResizeMouseDown = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (clockRef.current) {
            const rect = clockRef.current.getBoundingClientRect();
            setStartPos({ x: e.clientX, y: e.clientY });
            setStartSize({ width: rect.width, height: rect.height });
            setIsResizing(true);
        }
    };

    return (
        <div
            ref={clockRef}
            className={`clock-sticky ${isSelected ? 'selected' : ''}`}
            style={{ 
                left: x, 
                top: y,
                width: width || 200,
                height: height || 100
            }}
            onMouseDown={(e) => {
                if (!isResizing) {
                    onMouseDown(e, id);
                }
            }}
        >
            <div className="clock-header">
                <div className="clock-time">{time}</div>
                <button 
                    className="delete-button"
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete(id);
                    }}
                >
                    ×
                </button>
            </div>
            <div 
                className="resize-handle" 
                onMouseDown={handleResizeMouseDown}
            />
        </div>
    );
}
