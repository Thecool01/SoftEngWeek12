import { describe, expect, it, vi } from 'vitest';
import { checkAvailability, SIMULATED_NOW_MINUTES } from '@/lib/availability';
import { rooms, type Room } from '@/data/rooms';
import {
  explainAvailabilitySafely,
  getExplanationReasonCode,
  isValidExplanationResponse,
  mockExplainAvailability,
  type ExplanationRequest,
} from '@/lib/availabilityExplanation';

function makeRequest(room: Room, start: number, end: number): ExplanationRequest {
  const result = checkAvailability(room, start, end, SIMULATED_NOW_MINUTES);
  const format = (minutes: number) =>
    `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;
  return {
    roomLabel: room.name,
    startTime: format(start),
    endTime: format(end),
    isAvailable: result.available,
    reasonCode: getExplanationReasonCode(result),
  };
}

const A101 = rooms.find((r) => r.name === 'A101')!;
const B220 = rooms.find((r) => r.name === 'B220')!;
const C310 = rooms.find((r) => r.name === 'C310')!;

describe('Task 05 – explanation feature normal cases', () => {
  it('T01: available room gives a matching explanation', async () => {
    const request = makeRequest(A101, 840, 900); // 14:00–15:00
    expect(request).toMatchObject({ isAvailable: true, reasonCode: 'AVAILABLE' });
    const reply = await mockExplainAvailability(request);
    expect(reply.explanation).toContain('is available');
    expect(isValidExplanationResponse(reply, request)).toBe(true);
  });

  it('T02: overlapping booking gives Unavailable with OVERLAP', async () => {
    const request = makeRequest(B220, 900, 960); // 15:00–16:00
    expect(request).toMatchObject({ isAvailable: false, reasonCode: 'OVERLAP' });
    const reply = await mockExplainAvailability(request);
    expect(reply.explanation).toContain('overlaps an existing booking');
    expect(isValidExplanationResponse(reply, request)).toBe(true);
  });

  it('T03: blocked room gives Unavailable with ROOM_BLOCKED', async () => {
    const request = makeRequest(C310, 840, 900);
    expect(request).toMatchObject({ isAvailable: false, reasonCode: 'ROOM_BLOCKED' });
    const reply = await mockExplainAvailability(request);
    expect(reply.explanation).toContain('because it is blocked');
  });

  it('T04: invalid interval 16:00–15:00 is explained, not treated as available', async () => {
    const request = makeRequest(A101, 960, 900);
    expect(request).toMatchObject({ isAvailable: false, reasonCode: 'INVALID_INTERVAL' });
    const reply = await mockExplainAvailability(request);
    expect(reply.explanation).toContain('interval is invalid');
  });

  it('T05: past start is explained using the simulated current time', async () => {
    const request = makeRequest(A101, 660, 720); // 11:00–12:00; now is 12:00
    expect(request).toMatchObject({ isAvailable: false, reasonCode: 'PAST_START' });
    const reply = await mockExplainAvailability(request);
    expect(reply.explanation).toContain('after the simulated current time');
  });
});

describe('Task 05 – invalid input and failure handling', () => {
  const validRequest = makeRequest(A101, 840, 900);

  it('T06: empty room label is rejected before adapter is called', async () => {
    const adapter = vi.fn().mockResolvedValue({ explanation: 'unused' });
    const output = await explainAvailabilitySafely({ ...validRequest, roomLabel: '' }, adapter);
    expect(adapter).not.toHaveBeenCalled();
    expect(output.usedFallback).toBe(true);
  });

  it('T07: overly long room label is rejected before adapter is called', async () => {
    const adapter = vi.fn().mockResolvedValue({ explanation: 'unused' });
    const output = await explainAvailabilitySafely({ ...validRequest, roomLabel: 'X'.repeat(65) }, adapter);
    expect(adapter).not.toHaveBeenCalled();
    expect(output.usedFallback).toBe(true);
  });

  it('T08: timeout triggers a safe fallback instead of hanging', async () => {
    const neverResolves = vi.fn(() => new Promise<never>(() => {}));
    const output = await explainAvailabilitySafely(validRequest, neverResolves, 10);
    expect(neverResolves).toHaveBeenCalledOnce();
    expect(output).toMatchObject({ usedFallback: true });
    expect(output.explanation).toContain('rule-based result is Available');
  });

  it('T09: simulated API failure triggers the same fallback', async () => {
    const failingAdapter = vi.fn().mockRejectedValue(new Error('Simulated API failure'));
    const output = await explainAvailabilitySafely(validRequest, failingAdapter);
    expect(failingAdapter).toHaveBeenCalledOnce();
    expect(output.usedFallback).toBe(true);
    expect(output.explanation).toContain('rule-based result is Available');
  });

  it('T10: contradictory AI output is rejected', async () => {
    const contradictoryAdapter = vi.fn().mockResolvedValue({
      explanation: 'Room A101 is unavailable because it is blocked.',
    });
    const output = await explainAvailabilitySafely(validRequest, contradictoryAdapter);
    expect(output.usedFallback).toBe(true);
    expect(output.explanation).toContain('rule-based result is Available');
  });

  it('T11: adapter never mutates the existing booking data', async () => {
    const originalBookings = JSON.stringify(rooms);
    await mockExplainAvailability(validRequest);
    expect(JSON.stringify(rooms)).toBe(originalBookings);
  });
});


describe('Task 07 – regression tests for confirmed review findings', () => {
  it('T16 / F01: rejects a wrong reason even when Unavailable status matches', async () => {
    const overlapRequest = makeRequest(B220, 900, 960);
    expect(overlapRequest.reasonCode).toBe('OVERLAP');
    const wrongReason = { explanation: 'Room B220 is unavailable because it is blocked.' };
    expect(isValidExplanationResponse(wrongReason, overlapRequest)).toBe(false);
    const output = await explainAvailabilitySafely(overlapRequest, async () => wrongReason);
    expect(output.usedFallback).toBe(true);
    expect(output.explanation).toContain('rule-based result is Unavailable');
  });

  it('T17 / F01: rejects an explanation containing conflicting status claims', async () => {
    const overlapRequest = makeRequest(B220, 900, 960);
    const mixedClaims = {
      explanation: 'Room B220 is unavailable, but it is available after 16:00.',
    };
    expect(isValidExplanationResponse(mixedClaims, overlapRequest)).toBe(false);
    const output = await explainAvailabilitySafely(overlapRequest, async () => mixedClaims);
    expect(output.usedFallback).toBe(true);
  });

  it('T18 / F02: rejects AVAILABLE for reversed times before calling adapter', async () => {
    const validRequest = makeRequest(A101, 840, 900);
    const adapter = vi.fn().mockResolvedValue({ explanation: 'unused' });
    const output = await explainAvailabilitySafely(
      { ...validRequest, startTime: '16:00', endTime: '15:00' },
      adapter
    );
    expect(adapter).not.toHaveBeenCalled();
    expect(output.usedFallback).toBe(true);
  });

  it('T19 / F02: rejects AVAILABLE for an interval longer than 120 minutes', async () => {
    const validRequest = makeRequest(A101, 840, 900);
    const adapter = vi.fn().mockResolvedValue({ explanation: 'unused' });
    const output = await explainAvailabilitySafely(
      { ...validRequest, startTime: '14:00', endTime: '17:00' },
      adapter
    );
    expect(adapter).not.toHaveBeenCalled();
    expect(output.usedFallback).toBe(true);
  });

  it('T20: retains normal explanations for valid unavailable intervals', async () => {
    const overlapping = makeRequest(B220, 900, 960);
    const reply = await explainAvailabilitySafely(overlapping);
    expect(reply.usedFallback).toBe(false);
    expect(reply.explanation).toContain('overlaps an existing booking');
  });
});
