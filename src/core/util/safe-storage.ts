export function safeGetItem(key: string): string | null {
    try { return localStorage.getItem(key); } catch(e) { return null; }
}
export function safeSetItem(key: string, value: string): void {
    try { localStorage.setItem(key, value); } catch(e) { /* silent */ }
}
