import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Approval from './Approval';
import supabase from '../../SupabaseClient';

// Mock the AdminLayout component
vi.mock('../../components/layout/AdminLayout', () => ({
  default: ({ children }) => <div data-testid="admin-layout">{children}</div>,
}));

// Mock the Supabase client
vi.mock('../../SupabaseClient', () => ({
  default: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        not: vi.fn(() => ({
          not: vi.fn(() => ({
            eq: vi.fn(() => ({
              range: vi.fn(() => Promise.resolve({ data: [], error: null, count: 0 })),
              single: vi.fn(() => Promise.resolve({ data: null, error: null })),
              in: vi.fn(() => Promise.resolve({ data: [], error: null })),
            })),
          })),
        })),
      })),
    })),
  },
}));

describe('Approval Component', () => {
  beforeEach(() => {
    // Mock session storage
    Storage.prototype.getItem = vi.fn((key) => {
      switch(key) {
        case 'role':
          return 'admin';
        case 'username':
          return 'testuser';
        default:
          return null;
      }
    });
  });

  it('renders without crashing', () => {
    render(<Approval />);
    expect(screen.getByTestId('admin-layout')).toBeInTheDocument();
  });

  it('displays the correct title', () => {
    render(<Approval />);
    expect(screen.getByText('Approval Pending Tasks')).toBeInTheDocument();
  });

  it('shows tab buttons for checklist and delegation', () => {
    render(<Approval />);
    expect(screen.getByText('Checklist Tasks')).toBeInTheDocument();
    expect(screen.getByText('Delegation Tasks')).toBeInTheDocument();
  });

  it('initially shows loading state', () => {
    render(<Approval />);
    expect(screen.getByText('Loading task data...')).toBeInTheDocument();
  });

  it('handles empty data gracefully', async () => {
    render(<Approval />);
    
    // Wait for the component to finish loading
    await waitFor(() => {
      expect(screen.queryByText('Loading task data...')).not.toBeInTheDocument();
    });
    
    // Should show no records message when data is empty
    expect(screen.getByText('No completed checklist records found')).toBeInTheDocument();
  });
});