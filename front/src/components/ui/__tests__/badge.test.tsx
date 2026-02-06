import { render, screen } from '@testing-library/react';
import { Badge } from '../badge';

describe('Badge Component', () => {
    it('renders correctly with default variant', () => {
        render(<Badge>New</Badge>);
        const badge = screen.getByText('New');
        expect(badge).toBeInTheDocument();
        expect(badge).toHaveClass('bg-primary');
    });

    it('renders with secondary variant', () => {
        render(<Badge variant="secondary">Secondary</Badge>);
        const badge = screen.getByText('Secondary');
        expect(badge).toHaveClass('bg-secondary');
    });

    it('renders with destructive variant', () => {
        render(<Badge variant="destructive">Destructive</Badge>);
        const badge = screen.getByText('Destructive');
        expect(badge).toHaveClass('bg-destructive');
    });

    it('renders with outline variant', () => {
        render(<Badge variant="outline">Outline</Badge>);
        const badge = screen.getByText('Outline');
        expect(badge).toHaveClass('text-foreground');
    });

    it('applies custom className', () => {
        render(<Badge className="custom-class">Custom</Badge>);
        const badge = screen.getByText('Custom');
        expect(badge).toHaveClass('custom-class');
    });
});
