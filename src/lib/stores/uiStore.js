import { writable, derived } from 'svelte/store';

// Controls whether the sidebar is open or closed
export const isSidebarOpen = writable(false);

// Scroll position tracking
export const scrollY = writable(0);
export const lastScrollY = writable(0);
export const sidebarClosedAtScrollY = writable(0);
export const isScrollingDown = derived(
  [scrollY, lastScrollY],
  ([$scrollY, $lastScrollY]) => $scrollY > $lastScrollY
);

// Navbar visibility control
export const shouldShowNavbar = derived(
  [scrollY, sidebarClosedAtScrollY, isSidebarOpen],
  ([$scrollY, $sidebarClosedAtScrollY, $isSidebarOpen]) => {
    // Always show navbar when sidebar is open
    if ($isSidebarOpen) return true;
    
    // Only hide navbar when scrolling down significantly past the point where sidebar was closed
    const scrollThreshold = 500;
    return !($scrollY > $sidebarClosedAtScrollY + scrollThreshold);
  }
);

// Helper functions to manipulate the sidebar state
export function toggleSidebar() {
  const currentIsOpen = getStoreValue(isSidebarOpen);
  
  if (currentIsOpen) {
    // When closing, store current scroll position
    sidebarClosedAtScrollY.set(getStoreValue(scrollY));
  }
  
  isSidebarOpen.update(value => !value);
}

export function openSidebar() {
  isSidebarOpen.set(true);
}

export function closeSidebar() {
  // When closing, store current scroll position
  sidebarClosedAtScrollY.set(getStoreValue(scrollY));
  isSidebarOpen.set(false);
}

// Update scroll position
export function updateScrollPosition(position) {
  lastScrollY.set(getStoreValue(scrollY));
  scrollY.set(position);
}

// Helper to get current store value
function getStoreValue(store) {
  let value;
  const unsubscribe = store.subscribe(currentValue => {
    value = currentValue;
  });
  unsubscribe();
  return value;
}
