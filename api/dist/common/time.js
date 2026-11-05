"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.APP_TZ = void 0;
exports.dayStr = dayStr;
exports.minutesOfDay = minutesOfDay;
exports.isValidDay = isValidDay;
exports.dayToDate = dayToDate;
exports.addDays = addDays;
exports.weekday = weekday;
exports.offsetMs = offsetMs;
exports.dayRange = dayRange;
exports.parseDay = parseDay;
exports.tzShift = tzShift;
exports.localTimeToInstant = localTimeToInstant;
exports.monthRange = monthRange;
exports.APP_TZ = process.env.APP_TZ || process.env.TZ || 'Asia/Kolkata';
const dayFmt = new Intl.DateTimeFormat('en-CA', { timeZone: exports.APP_TZ, year: 'numeric', month: '2-digit', day: '2-digit' });
const clockFmt = new Intl.DateTimeFormat('en-GB', { timeZone: exports.APP_TZ, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
function dayStr(d = new Date()) {
    return dayFmt.format(d);
}
function minutesOfDay(d = new Date()) {
    const [h, m] = clockFmt.format(d).split(':').map(Number);
    return h * 60 + m;
}
function isValidDay(s) {
    if (typeof s !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(s))
        return false;
    const t = Date.parse(`${s}T00:00:00Z`);
    return !Number.isNaN(t) && new Date(t).toISOString().slice(0, 10) === s;
}
function dayToDate(day) {
    return new Date(`${day}T00:00:00Z`);
}
function addDays(day, n) {
    const d = dayToDate(day);
    d.setUTCDate(d.getUTCDate() + n);
    return d.toISOString().slice(0, 10);
}
function weekday(day) {
    return dayToDate(day).getUTCDay();
}
function offsetMs(at, tz) {
    const p = new Intl.DateTimeFormat('en-US', {
        timeZone: tz, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', second: '2-digit',
    }).formatToParts(at);
    const g = (t) => Number(p.find((x) => x.type === t).value);
    return Date.UTC(g('year'), g('month') - 1, g('day'), g('hour'), g('minute'), g('second')) - Math.floor(at.getTime() / 1000) * 1000;
}
function dayRange(day, tz = exports.APP_TZ) {
    const edge = (d) => {
        const utcMid = Date.parse(`${d}T00:00:00Z`);
        const first = utcMid - offsetMs(new Date(utcMid), tz);
        return new Date(utcMid - offsetMs(new Date(first), tz));
    };
    return { start: edge(day), end: edge(addDays(day, 1)) };
}
function parseDay(s) {
    return isValidDay(s) ? s : null;
}
function tzShift(d) {
    return new Date(d.getTime() + offsetMs(d, exports.APP_TZ));
}
function localTimeToInstant(day, hhmm) {
    const m = /^(\d{1,2}):(\d{2})$/.exec(hhmm);
    if (!m)
        throw new Error('bad time');
    return new Date(dayRange(day).start.getTime() + (Number(m[1]) * 60 + Number(m[2])) * 60_000);
}
function monthRange(month) {
    if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month))
        return null;
    const from = `${month}-01`;
    const d = dayToDate(from);
    d.setUTCMonth(d.getUTCMonth() + 1);
    d.setUTCDate(0);
    return { from, to: d.toISOString().slice(0, 10) };
}
//# sourceMappingURL=time.js.map