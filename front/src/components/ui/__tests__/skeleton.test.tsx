import { render, screen } from '@testing-library/react';
import { Skeleton } from '../skeleton';

describe('Skeleton Component', () => {
    it('renders correctly', () => {
        render(<Skeleton data-testid="skeleton" />);
        const skeleton = screen.getByTestId('skeleton');
        expect(skeleton).toBeInTheDocument();
    });

    it('has animate-pulse class for animation', () => {
        render(<Skeleton data-testid="skeleton" />);
        const skeleton = screen.getByTestId('skeleton');
        expect(skeleton).toHaveClass('animate-pulse');
    });

    it('applies custom className', () => {
        render(<Skeleton data-testid="skeleton" className="w-32 h-8" />);
        const skeleton = screen.getByTestId('skeleton');
        expect(skeleton).toHaveClass('w-32');
        expect(skeleton).toHaveClass('h-8');
    });
});
