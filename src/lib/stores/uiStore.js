import { writable } from 'svelte/store';

// Controls whether the sidebar is open or closed
export const isSidebarOpen = writable(false);

// Helper functions to manipulate the sidebar state
export function toggleSidebar() {
  isSidebarOpen.update(value => !value);
}

export function openSidebar() {
  isSidebarOpen.set(true);
}

export function closeSidebar() {
  isSidebarOpen.set(false);
}
