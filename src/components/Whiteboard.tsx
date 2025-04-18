import React, { useState, useEffect, useRef } from "react";
import "../index.css";
import Sticky from "./Sticky";
import Clock from "./Clock";
import Link from "./Link";
import LinkDialog from "./LinkDialog";
import Settings from "./Settings";

export interface StickyNote {
    id: string;
    x: number;
    y: number;
    text: string;
    type: "note" | "heading" | "clock" | "link";
    width?: number;
    height?: number;
    heading?: string;
    name?: string;
    url?: string;
}

const Whiteboard: React.FC = () => {
    const [stickies, setStickies] = useState<StickyNote[]>([]);
    const [contextMenu, setContextMenu] = useState<{
        x: number;
        y: number;
        visible: boolean;
    }>({ x: 0, y: 0, visible: false });
    const [selectedSticky, setSelectedSticky] = useState<string | null>(null);
    const [linkDialog, setLinkDialog] = useState<{
        visible: boolean;
        x: number;
        y: number;
    }>({ visible: false, x: 0, y: 0 });
    const draggingRef = useRef<{
        id: string;
        offsetX: number;
        offsetY: number;
    } | null>(null);
    const [settingsOpen, setSettingsOpen] = useState(false);

    useEffect(() => {
        const saved = localStorage.getItem("stickies");
        if (saved) {
            setStickies(JSON.parse(saved));
        }
    }, []);

    useEffect(() => {
        localStorage.setItem("stickies", JSON.stringify(stickies));
    }, [stickies]);

    const addSticky = (
        x: number,
        y: number,
        type: "note" | "heading" | "clock" = "note"
    ) => {
        const newSticky: StickyNote = {
            id: crypto.randomUUID(),
            x,
            y,
            text: "",
            type,
        };
        setStickies((prev) => [...prev, newSticky]);
    };

    const updateSticky = (id: string, newProps: Partial<StickyNote>) => {
        setStickies((prev) =>
            prev.map((sticky) =>
                sticky.id === id ? { ...sticky, ...newProps } : sticky
            )
        );
    };

    const deleteSticky = (id: string) => {
        setStickies((prev) => prev.filter((sticky) => sticky.id !== id));
    };

    const handleMouseDown = (e: React.MouseEvent, id: string) => {
        const offsetX = e.nativeEvent.offsetX;
        const offsetY = e.nativeEvent.offsetY;
        draggingRef.current = { id, offsetX, offsetY };
        setSelectedSticky(id);
    };

    const handleMouseMove = (e: MouseEvent) => {
        if (!draggingRef.current) return;
        const { id, offsetX, offsetY } = draggingRef.current;
        updateSticky(id, { x: e.pageX - offsetX, y: e.pageY - offsetY });
    };

    const handleMouseUp = () => {
        draggingRef.current = null;
    };

    useEffect(() => {
        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("mouseup", handleMouseUp);
        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", handleMouseUp);
        };
    }, []);

    const handleAddLink = (name: string, url: string) => {
        const newSticky: StickyNote = {
            id: crypto.randomUUID(),
            x: linkDialog.x,
            y: linkDialog.y,
            text: "",
            type: "link",
            name,
            url
        };
        setStickies((prev) => [...prev, newSticky]);
    };

    const handleImport = (data: string) => {
        try {
            const parsedData = JSON.parse(data);
            if (Array.isArray(parsedData)) {
                // Validate each item in the array
                const validData = parsedData.every(item => 
                    item && 
                    typeof item === 'object' && 
                    'id' in item && 
                    'x' in item && 
                    'y' in item && 
                    'type' in item
                );
                
                if (validData) {
                    setStickies(parsedData);
                } else {
                    throw new Error('Invalid data format');
                }
            } else {
                throw new Error('Data must be an array');
            }
        } catch (error) {
            console.error('Invalid import data:', error);
            alert('Invalid import data. Please check the format and try again.');
        }
    };

    const handleClearAll = () => {
        setStickies([]);
    };

    return (
        <div
            id="whiteboard"
            onContextMenu={(e) => {
                e.preventDefault();
                setContextMenu({ x: e.pageX, y: e.pageY, visible: true });
            }}
            onClick={(e) => {
                if (e.target === e.currentTarget) {
                    setContextMenu({ ...contextMenu, visible: false });
                    setSelectedSticky(null);
                }
            }}
        >
            {stickies.map((note) => (
                note.type === "clock" ? (
                    <Clock
                        key={note.id}
                        id={note.id}
                        x={note.x}
                        y={note.y}
                        width={note.width}
                        height={note.height}
                        onMouseDown={handleMouseDown}
                        onDelete={deleteSticky}
                        onChange={updateSticky}
                        isSelected={selectedSticky === note.id}
                    />
                ) : note.type === "link" ? (
                    <Link
                        key={note.id}
                        id={note.id}
                        x={note.x}
                        y={note.y}
                        name={note.name || ""}
                        url={note.url || ""}
                        width={note.width}
                        height={note.height}
                        onMouseDown={handleMouseDown}
                        onDelete={deleteSticky}
                        onChange={updateSticky}
                        isSelected={selectedSticky === note.id}
                    />
                ) : (
                    <Sticky
                        key={note.id}
                        note={note}
                        onMouseDown={handleMouseDown}
                        onChange={updateSticky}
                        onDelete={deleteSticky}
                    />
                )
            ))}
            {contextMenu.visible && (
                <div
                    id="contextMenu"
                    style={{ left: contextMenu.x, top: contextMenu.y }}
                >
                    <div
                        className="contextMenuItem"
                        onClick={() => {
                            addSticky(contextMenu.x, contextMenu.y, "note");
                            setContextMenu({ ...contextMenu, visible: false });
                        }}
                    >
                        Add Note
                    </div>
                    <div
                        className="contextMenuItem"
                        onClick={() => {
                            addSticky(contextMenu.x, contextMenu.y, "heading");
                            setContextMenu({ ...contextMenu, visible: false });
                        }}
                    >
                        Add Heading
                    </div>
                    <div
                        className="contextMenuItem"
                        onClick={() => {
                            addSticky(contextMenu.x, contextMenu.y, "clock");
                            setContextMenu({ ...contextMenu, visible: false });
                        }}
                    >
                        Add Clock
                    </div>
                    <div
                        className="contextMenuItem"
                        onClick={() => {
                            setLinkDialog({ visible: true, x: contextMenu.x, y: contextMenu.y });
                            setContextMenu({ ...contextMenu, visible: false });
                        }}
                    >
                        Add Link
                    </div>
                </div>
            )}
            <LinkDialog
                isOpen={linkDialog.visible}
                onClose={() => setLinkDialog({ ...linkDialog, visible: false })}
                onSubmit={handleAddLink}
            />
            
            <button 
                className="settings-button"
                onClick={() => setSettingsOpen(true)}
            >
                ⚙️
            </button>

            <Settings
                isOpen={settingsOpen}
                onClose={() => setSettingsOpen(false)}
                onImport={handleImport}
                stickies={stickies}
                onClearAll={handleClearAll}
            />
        </div>
    );
};

export default Whiteboard;
