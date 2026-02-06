import { render, screen } from '@testing-library/react';
import { Separator } from '../separator';

describe('Separator Component', () => {
    it('renders correctly', () => {
        render(<Separator data-testid="separator" />);
        const separator = screen.getByTestId('separator');
        expect(separator).toBeInTheDocument();
    });

    it('renders horizontal by default', () => {
        render(<Separator data-testid="separator" />);
        const separator = screen.getByTestId('separator');
        expect(separator).toHaveClass('w-full');
        expect(separator).toHaveAttribute('data-orientation', 'horizontal');
    });

    it('renders vertical orientation', () => {
        render(<Separator data-testid="separator" orientation="vertical" />);
        const separator = screen.getByTestId('separator');
        expect(separator).toHaveClass('w-[1px]');
        expect(separator).toHaveAttribute('data-orientation', 'vertical');
    });

    it('applies custom className', () => {
        render(<Separator data-testid="separator" className="my-4" />);
        const separator = screen.getByTestId('separator');
        expect(separator).toHaveClass('my-4');
    });
});
