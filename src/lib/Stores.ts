import { writable } from "svelte/store";
import type { NoteType } from "./Types";

export const NoteStore = writable<NoteType[]>([]);