import React, { useState, useEffect } from 'react';

interface LinkProps {
    x: number;
    y: number;
    id: string;
    name: string;
    url: string;
    onMouseDown: (e: React.MouseEvent, id: string) => void;
    onDelete: (id: string) => void;
    onChange: (id: string, changes: { width?: number; height?: number }) => void;
    width?: number;
    height?: number;
    isSelected: boolean;
}

export default function Link({ x, y, id, name, url, onMouseDown, onDelete, onChange, width, height, isSelected }: LinkProps) {
    const [favicon, setFavicon] = useState<string>('');
    const [isResizing, setIsResizing] = useState(false);
    const [startPos, setStartPos] = useState({ x: 0, y: 0 });
    const [startSize, setStartSize] = useState({ width: 0, height: 0 });

    useEffect(() => {
        const getFavicon = async () => {
            try {
                const domain = new URL(url).hostname;
                const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
                setFavicon(faviconUrl);
            } catch (error) {
                console.error('Error fetching favicon:', error);
            }
        };

        getFavicon();
    }, [url]);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isResizing) return;

            const deltaX = e.clientX - startPos.x;
            const deltaY = e.clientY - startPos.y;

            const newWidth = Math.max(120, Math.round((startSize.width + deltaX) / 30) * 30);
            const newHeight = Math.max(120, Math.round((startSize.height + deltaY) / 30) * 30);

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

    const handleClick = (e: React.MouseEvent) => {
        if (e.detail === 2 || isSelected) {
            e.preventDefault();
            window.location.href = url;
        }
    };

    const handleResizeMouseDown = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        
        const rect = e.currentTarget.parentElement?.getBoundingClientRect();
        if (rect) {
            setStartPos({ x: e.clientX, y: e.clientY });
            setStartSize({ width: rect.width, height: rect.height });
            setIsResizing(true);
        }
    };

    return (
        <div
            className={`link-sticky ${isSelected ? 'selected' : ''}`}
            style={{ 
                left: x, 
                top: y,
                width: width || 90,
                height: height || 90
            }}
            onMouseDown={(e) => onMouseDown(e, id)}
        >
            <div className="link-content" onClick={handleClick}>
                <div className="link-icon-container">
                    {favicon && <img src={favicon} alt="" className="link-icon" />}
                </div>
                <span className="link-name">{name}</span>
            </div>
            {isSelected && (
                <button 
                    className="delete-button"
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onDelete(id);
                    }}
                >
                    ×
                </button>
            )}
            <div 
                className="resize-handle" 
                onMouseDown={handleResizeMouseDown}
            />
        </div>
    );
} 