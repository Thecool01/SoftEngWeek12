
    
  
// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import App from '@/App';

function setTime(label: string, value: string) {
  fireEvent.change(screen.getByLabelText(label), { target: { value } });
}

function selectRoom(roomCode: string) {
  fireEvent.click(screen.getByRole('button', { name: new RegExp(roomCode) }));
}

describe('Task 05 – UI does not change deterministic decisions', () => {
  it('T12: explaining an available room does not change Available', async () => {
    render(<App />);
    expect(screen.getByText('Available')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Explain availability' }));
    expect(await screen.findByText(/Room A101 is available from 14:00 to 15:00/)).toBeTruthy();
    expect(screen.getByText('Available')).toBeTruthy();
  });

  it('T13: explaining an overlapping slot does not change Unavailable', async () => {
    render(<App />);
    setTime('Start Time', '15:00');
    setTime('End Time', '16:00');
    selectRoom('B220');
    expect(screen.getByText('Unavailable')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Explain availability' }));
    expect(await screen.findByText(/Room B220 is unavailable because the requested interval overlaps/)).toBeTruthy();
    expect(screen.getByText('Unavailable')).toBeTruthy();
  });

  it('T14: empty time hides the availability decision and explain button', () => {
    render(<App />);
    setTime('Start Time', '');
    expect(screen.queryByRole('button', { name: 'Explain availability' })).toBeNull();
    expect(screen.queryByText('Available')).toBeNull();
    expect(screen.queryByText('Unavailable')).toBeNull();
  });

  it('T15: changing time removes the previous explanation', async () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Explain availability' }));
    expect(await screen.findByText(/Room A101 is available from 14:00 to 15:00/)).toBeTruthy();
    setTime('Start Time', '15:00');
    setTime('End Time', '16:00');
    expect(screen.queryByText(/Room A101 is available from 14:00 to 15:00/)).toBeNull();
    expect(screen.getByText('Available')).toBeTruthy();
  });
});

