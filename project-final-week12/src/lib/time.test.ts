import { describe, it, expect } from 'vitest';
import { fmt, timeInputToMinutes } from '@/lib/time';

describe('fmt', () => {
  it('formats minutes after midnight as HH:MM', () => {
    expect(fmt(0)).toBe('00:00');
    expect(fmt(720)).toBe('12:00');
    expect(fmt(1439)).toBe('23:59');
  });

  it('shows a placeholder instead of NaN for missing times', () => {
    expect(fmt(NaN)).toBe('--:--');
    expect(fmt(Infinity)).toBe('--:--');
  });
});

describe('timeInputToMinutes', () => {
  it('converts HH:MM input to minutes', () => {
    expect(timeInputToMinutes('12:00')).toBe(720);
    expect(timeInputToMinutes('14:30')).toBe(870);
  });

  it('returns NaN for empty or malformed input', () => {
    expect(timeInputToMinutes('')).toBeNaN();
    expect(timeInputToMinutes('14')).toBeNaN();
    expect(timeInputToMinutes('ab:cd')).toBeNaN();
  });
});
