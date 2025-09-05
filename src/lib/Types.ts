export interface Vector2D {
    x: number;
    y: number;
}

export enum NoteCategory {
    StickyNote,
    Heading,
    Clock,
    Link,
}

export interface NoteType {
    id: string;
    category: NoteCategory;
    heading: string;
    content: string;
    linkAddress: string;
    position: Vector2D;
    size: Vector2D;
}