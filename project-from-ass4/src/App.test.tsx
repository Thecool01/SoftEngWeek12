// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '@/App';

function setAttendees(value: string) {
  fireEvent.change(screen.getByLabelText('Number of attendees'), { target: { value } });
}

function setTime(label: string, value: string) {
  fireEvent.change(screen.getByLabelText(label), { target: { value } });
}

function toggleEquipment(item: string) {
  fireEvent.click(screen.getByRole('checkbox', { name: item }));
}

function selectRoom(code: string) {
  fireEvent.click(screen.getByRole('button', { name: new RegExp(code) }));
}

describe('App UI behavior', () => {
  it('switching from A101 to B220 at the same time changes the result to Unavailable', () => {
    render(<App />);

    setAttendees('20');
    toggleEquipment('Wi-Fi');
    setTime('Start Time', '15:00');
    setTime('End Time', '16:00');

    selectRoom('A101');
    expect(screen.getByText('Available')).toBeTruthy();
    expect(screen.getByText('A101 is free from 15:00 to 16:00')).toBeTruthy();

    selectRoom('B220');
    expect(screen.getByText('Unavailable')).toBeTruthy();
    expect(screen.queryByText('Available')).toBeNull();
    expect(screen.getByText(/Overlaps existing booking: 15:00/)).toBeTruthy();
    expect(screen.getByText('Existing Bookings — B220')).toBeTruthy();
    expect((screen.getByLabelText('Start Time') as HTMLInputElement).value).toBe('15:00');
    expect((screen.getByLabelText('End Time') as HTMLInputElement).value).toBe('16:00');
  });

  it('shows the empty state with no availability result when no room matches, and clearing restores rooms', () => {
    render(<App />);

    setAttendees('100');
    expect(screen.getByText('No rooms match your requirements')).toBeTruthy();
    expect(
      screen.getByText('No matching room is selected, so there is no availability to show.')
    ).toBeTruthy();
    expect(screen.queryByText('Available')).toBeNull();
    expect(screen.queryByText('Unavailable')).toBeNull();

    fireEvent.click(screen.getAllByRole('button', { name: 'Clear filters' })[0]);
    expect(screen.queryByText('No rooms match your requirements')).toBeNull();
    expect((screen.getByLabelText('Number of attendees') as HTMLInputElement).value).toBe('1');
  });

  it('keeps blocked room C310 unavailable even when capacity and equipment match', () => {
    render(<App />);

    setAttendees('10');
    toggleEquipment('Wi-Fi');
    selectRoom('C310');

    expect(screen.getByText('Unavailable')).toBeTruthy();
    expect(screen.queryByText('Available')).toBeNull();
    expect(screen.getByText(/Room is blocked/)).toBeTruthy();
  });

  it('never shows Available or NaN when the start time is cleared', () => {
    render(<App />);

    setTime('Start Time', '');
    expect(screen.queryByText('Available')).toBeNull();
    expect(screen.queryByText('Unavailable')).toBeNull();
    expect(
      screen.getByText('Enter a valid start and end time to check availability.')
    ).toBeTruthy();
    expect(document.body.textContent).not.toContain('NaN');
  });
});
