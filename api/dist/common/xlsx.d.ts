export type Cell = string | number | boolean | Date | null | undefined | {
    v: string | number | null;
    style?: 'text' | 'date' | 'time' | 'datetime' | 'hours' | 'int' | 'good' | 'warn' | 'bad' | 'muted';
};
export interface Column {
    header: string;
    width?: number;
}
export interface Sheet {
    name: string;
    columns: Column[];
    rows: Cell[][];
    title?: string;
}
export declare function buildXlsx(sheets: Sheet[]): Buffer;
export declare const XLSX_MIME = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
