export declare const INLINE_OK: Set<string>;
export declare const RISKY_EXT: Set<string>;
export declare function extOf(name: string): string;
export declare function sniffMime(head: Buffer): string | null;
export declare function decideMime(head: Buffer, filename: string): string;
export declare function cleanFileName(raw: unknown): string;
export declare function contentDisposition(kind: 'inline' | 'attachment', name: string): string;
export declare function isRisky(name: string): boolean;
