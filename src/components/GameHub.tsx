"use client";

// GameHub is now a thin re-export of MemoryArcade.
// All game selection logic, multi-game hub, and old game imports have been removed.
// The arcade runs a single game: Memory Tiles (game ID: 'pattern').
export { default } from './MemoryArcade';
