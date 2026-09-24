// NapWindow engine - baby wake-window nap planning (no DOM)
(function (root) {
  'use strict';

  // Age brackets: awake windows (minutes) widen as babies grow.
  // winMin..winMax = recommended awake time before next sleep, naps = typical per day.
  var BRACKETS = [
    { maxMonths: 1,  winMin: 45,  winMax: 60,  naps: 5, note: 'newborn: tiny windows, sleep comes fast' },
    { maxMonths: 2,  winMin: 60,  winMax: 90,  naps: 4, note: 'watch for sleepy cues around one hour' },
    { maxMonths: 3,  winMin: 75,  winMax: 105, naps: 4, note: 'windows stretch past the hour mark' },
    { maxMonths: 4,  winMin: 90,  winMax: 120, naps: 3, note: 'the 4-month shuffle: naps start to consolidate' },
    { maxMonths: 6,  winMin: 120, winMax: 150, naps: 3, note: 'three-nap rhythm' },
    { maxMonths: 9,  winMin: 150, winMax: 180, naps: 2, note: 'dropping to two naps' },
    { maxMonths: 12, winMin: 180, winMax: 240, naps: 2, note: 'morning and afternoon nap' },
    { maxMonths: 18, winMin: 240, winMax: 330, naps: 1, note: 'transitioning to one midday nap' },
    { maxMonths: 30, winMin: 300, winMax: 360, naps: 1, note: 'one solid midday nap' }
  ];

  var NAP_MINUTES = 60; // planning assumption for a schedule skeleton

  function bracketFor(ageMonths) {
    var m = Math.max(0, Number(ageMonths) || 0);
    for (var i = 0; i < BRACKETS.length; i++) if (m < BRACKETS[i].maxMonths) return BRACKETS[i];
    return BRACKETS[BRACKETS.length - 1];
  }

  function winMid(bracket) { return Math.round((bracket.winMin + bracket.winMax) / 2); }

  // Whole months between two dates (by calendar, floor).
  function ageInMonths(birth, onDate) {
    var b = new Date(birth), d = new Date(onDate);
    var months = (d.getFullYear() - b.getFullYear()) * 12 + (d.getMonth() - b.getMonth());
    if (d.getDate() < b.getDate()) months -= 1;
    return Math.max(0, months);
  }

  function fmt(minutesOfDay) {
    var m = ((Math.round(minutesOfDay) % 1440) + 1440) % 1440;
    var h = Math.floor(m / 60), mm = m % 60;
    var ap = h >= 12 ? 'PM' : 'AM';
    var hh = h % 12; if (hh === 0) hh = 12;
    return hh + ':' + String(mm).padStart(2, '0') + ' ' + ap;
  }

  // Build today's skeleton from morning wake time (minutes since midnight).
  // Returns [{kind:'nap'|'bed', start, end}] with start/end as minutes-of-day.
  function buildSchedule(wakeMinutes, bracket) {
    var events = [];
    var t = wakeMinutes;
    for (var i = 0; i < bracket.naps; i++) {
      var win = winMid(bracket);
      if (i === bracket.naps - 1) win = bracket.winMax; // last window can run longer
      var start = t + win;
      events.push({ kind: 'nap', label: 'Nap ' + (i + 1), start: start, end: start + NAP_MINUTES });
      t = start + NAP_MINUTES;
    }
    var bedStart = t + bracket.winMax;
    events.push({ kind: 'bed', label: 'Bedtime', start: bedStart, end: bedStart });
    return events;
  }

  // Where are we in the current wake window?
  // lastWakeMin = minutes-of-day the baby last woke; nowMin = now.
  function nextWindow(lastWakeMin, nowMin, bracket) {
    var elapsed = Math.max(0, nowMin - lastWakeMin);
    var winStart = lastWakeMin + bracket.winMin;
    var winEnd = lastWakeMin + bracket.winMax;
    var state;
    if (elapsed < bracket.winMin) state = 'awake';
    else if (elapsed <= bracket.winMax) state = 'in-window';
    else state = 'overdue';
    return {
      elapsed: elapsed,
      state: state,
      toWindowMin: Math.max(0, bracket.winMin - elapsed),
      overdueBy: Math.max(0, elapsed - bracket.winMax),
      windowStart: winStart,
      windowEnd: winEnd
    };
  }

  // Nap log: [{id, startMin, endMin, at ISO date string}]
  function stats(log) {
    var n = log.length, total = 0;
    log.forEach(function (x) { total += Math.max(0, (Number(x.endMin) || 0) - (Number(x.startMin) || 0)); });
    return {
      naps: n,
      totalMinutes: total,
      avgMinutes: n ? Math.round(total / n) : 0,
      days: (function () { var s = {}; log.forEach(function (x) { s[dayKey(new Date(x.at))] = true; }); return Object.keys(s).length; })()
    };
  }

  function dayKey(d) {
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }

  var api = { BRACKETS: BRACKETS, NAP_MINUTES: NAP_MINUTES, bracketFor: bracketFor, winMid: winMid,
    ageInMonths: ageInMonths, fmt: fmt, buildSchedule: buildSchedule,
    nextWindow: nextWindow, stats: stats, dayKey: dayKey };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.NapEngine = api;
})(typeof self !== 'undefined' ? self : this);
