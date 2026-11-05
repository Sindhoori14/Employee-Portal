"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RISKY_EXT = exports.INLINE_OK = void 0;
exports.extOf = extOf;
exports.sniffMime = sniffMime;
exports.decideMime = decideMime;
exports.cleanFileName = cleanFileName;
exports.contentDisposition = contentDisposition;
exports.isRisky = isRisky;
const EXT_MIME = {
    png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', gif: 'image/gif', webp: 'image/webp', bmp: 'image/bmp', ico: 'image/x-icon', heic: 'image/heic', avif: 'image/avif',
    pdf: 'application/pdf', txt: 'text/plain', md: 'text/plain', csv: 'text/csv', rtf: 'application/rtf', json: 'application/json',
    doc: 'application/msword', docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    xls: 'application/vnd.ms-excel', xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ppt: 'application/vnd.ms-powerpoint', pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    odt: 'application/vnd.oasis.opendocument.text', ods: 'application/vnd.oasis.opendocument.spreadsheet', odp: 'application/vnd.oasis.opendocument.presentation',
    zip: 'application/zip', rar: 'application/vnd.rar', '7z': 'application/x-7z-compressed', gz: 'application/gzip', tar: 'application/x-tar',
    mp3: 'audio/mpeg', wav: 'audio/wav', ogg: 'audio/ogg', m4a: 'audio/mp4', aac: 'audio/aac',
    mp4: 'video/mp4', webm: 'video/webm', mov: 'video/quicktime', mkv: 'video/x-matroska', avi: 'video/x-msvideo',
};
exports.INLINE_OK = new Set([
    'image/png', 'image/jpeg', 'image/gif', 'image/webp', 'application/pdf',
    'video/mp4', 'video/webm', 'audio/mpeg', 'audio/ogg', 'audio/wav', 'audio/mp4', 'text/plain',
]);
exports.RISKY_EXT = new Set(['exe', 'msi', 'bat', 'cmd', 'com', 'scr', 'ps1', 'vbs', 'js', 'jar', 'apk', 'sh', 'dll', 'lnk', 'iso']);
function extOf(name) {
    const i = name.lastIndexOf('.');
    return i > 0 ? name.slice(i + 1).toLowerCase() : '';
}
function sniffMime(head) {
    const s = (a, b) => head.slice(a, b).toString('latin1');
    if (head.length >= 8 && head[0] === 0x89 && s(1, 4) === 'PNG')
        return 'image/png';
    if (head.length >= 3 && head[0] === 0xff && head[1] === 0xd8 && head[2] === 0xff)
        return 'image/jpeg';
    if (s(0, 6) === 'GIF87a' || s(0, 6) === 'GIF89a')
        return 'image/gif';
    if (s(0, 4) === 'RIFF' && s(8, 12) === 'WEBP')
        return 'image/webp';
    if (s(0, 4) === 'RIFF' && s(8, 12) === 'WAVE')
        return 'audio/wav';
    if (s(0, 5) === '%PDF-')
        return 'application/pdf';
    if (s(4, 8) === 'ftyp')
        return 'video/mp4';
    if (head.length >= 4 && head[0] === 0x1a && head[1] === 0x45 && head[2] === 0xdf && head[3] === 0xa3)
        return 'video/webm';
    if (s(0, 3) === 'ID3' || (head.length >= 2 && head[0] === 0xff && (head[1] & 0xe0) === 0xe0 && (head[1] & 0x06) !== 0))
        return 'audio/mpeg';
    if (s(0, 4) === 'OggS')
        return 'audio/ogg';
    if (s(0, 2) === 'PK' && head[2] === 3 && head[3] === 4)
        return 'application/zip';
    if (s(0, 2) === 'MZ')
        return 'application/x-msdownload';
    if (s(0, 4) === '\u007fELF')
        return 'application/x-executable';
    return null;
}
function decideMime(head, filename) {
    const byExt = EXT_MIME[extOf(filename)];
    const sniffed = sniffMime(head);
    if (sniffed === 'application/zip')
        return byExt && /officedocument|opendocument|zip/.test(byExt) ? byExt : 'application/zip';
    if (sniffed) {
        if (sniffed === 'video/mp4' && byExt && /^(audio\/mp4|video\/quicktime)$/.test(byExt))
            return byExt;
        return sniffed;
    }
    if (byExt && /^(text\/|application\/(json|rtf|msword|vnd\.|x-|gzip|vnd\.rar))/.test(byExt) && !byExt.startsWith('image/'))
        return byExt;
    return 'application/octet-stream';
}
function cleanFileName(raw) {
    let n = String(raw ?? '').normalize('NFC');
    n = n.split(/[\\/]/).pop() ?? '';
    n = n.replace(/[\u0000-\u001f\u007f<>:"|?*]/g, '').replace(/\s+/g, ' ').trim().replace(/^\.+/, '');
    if (!n)
        return 'file';
    if (n.length > 150) {
        const ext = extOf(n);
        const keep = ext ? `.${ext.slice(0, 10)}` : '';
        n = n.slice(0, 150 - keep.length) + keep;
    }
    return n;
}
function contentDisposition(kind, name) {
    const ascii = name.replace(/[^\x20-\x7e]/g, '_').replace(/["\\]/g, '_');
    return `${kind}; filename="${ascii}"; filename*=UTF-8''${encodeURIComponent(name).replace(/['()*]/g, (c) => '%' + c.charCodeAt(0).toString(16).toUpperCase())}`;
}
function isRisky(name) {
    return exports.RISKY_EXT.has(extOf(name));
}
//# sourceMappingURL=file-types.js.map