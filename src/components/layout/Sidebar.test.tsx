import React from 'react';
import { render, screen } from '@testing-library/react';
import { Sidebar } from './Sidebar';

// Mock usePathname from next/navigation
jest.mock('next/navigation', () => ({
    usePathname: jest.fn(() => '/'), // Default to home
}));

describe('Sidebar Component', () => {
    it('should render athlete initials and name', () => {
        const athlete = { name: 'John Doe', age: 30 };
        render(<Sidebar athlete={athlete} />);

        // Initials "JD"
        expect(screen.getByText('JD')).toBeInTheDocument();
        // Name "John Doe"
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        // Age "30 yrs"
        expect(screen.getByText('30 yrs')).toBeInTheDocument();
    });

    it('should handle missing athlete name gracefully', () => {
        render(<Sidebar athlete={{}} />);
        expect(screen.getByText('RL')).toBeInTheDocument(); // Default initials
        expect(screen.getByText('New Athlete')).toBeInTheDocument();
    });

    it('should highlight the active link', () => {
        // We mocked usePathname to return '/'
        render(<Sidebar athlete={{ name: 'Test User' }} />);

        // "Dashboard" link should have the active class (checking via text matching for now or class presence)
        // The active class contains "bg-primary/10"

        // Find the link by its text
        const dashboardLink = screen.getByText('Dashboard').closest('a');
        const activitiesLink = screen.getByText('Activities').closest('a');

        expect(dashboardLink).toHaveClass('bg-primary');
        expect(activitiesLink).not.toHaveClass('bg-primary');
    });
});
