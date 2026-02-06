import { render, screen } from '@testing-library/react';
import { Label } from '../label';

describe('Label Component', () => {
    it('renders correctly', () => {
        render(<Label>Email</Label>);
        const label = screen.getByText('Email');
        expect(label).toBeInTheDocument();
    });

    it('has the correct text styling', () => {
        render(<Label>Email</Label>);
        const label = screen.getByText('Email');
        expect(label).toHaveClass('text-sm');
        expect(label).toHaveClass('font-medium');
    });

    it('applies custom className', () => {
        render(<Label className="sr-only">Hidden</Label>);
        const label = screen.getByText('Hidden');
        expect(label).toHaveClass('sr-only');
    });

    it('associates with htmlFor prop', () => {
        render(<Label htmlFor="email">Email</Label>);
        const label = screen.getByText('Email');
        expect(label).toHaveAttribute('for', 'email');
    });
});
