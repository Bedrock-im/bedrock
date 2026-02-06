import { render, screen, fireEvent } from '@testing-library/react';
import { Switch } from '../switch';

describe('Switch Component', () => {
    it('renders correctly', () => {
        render(<Switch aria-label="Enable notifications" />);
        const switchEl = screen.getByRole('switch', { name: /enable notifications/i });
        expect(switchEl).toBeInTheDocument();
    });

    it('starts unchecked by default', () => {
        render(<Switch aria-label="Enable notifications" />);
        const switchEl = screen.getByRole('switch', { name: /enable notifications/i });
        expect(switchEl).toHaveAttribute('data-state', 'unchecked');
    });

    it('can be toggled', () => {
        render(<Switch aria-label="Enable notifications" />);
        const switchEl = screen.getByRole('switch', { name: /enable notifications/i });

        fireEvent.click(switchEl);
        expect(switchEl).toHaveAttribute('data-state', 'checked');

        fireEvent.click(switchEl);
        expect(switchEl).toHaveAttribute('data-state', 'unchecked');
    });

    it('can be disabled', () => {
        render(<Switch aria-label="Enable notifications" disabled />);
        const switchEl = screen.getByRole('switch', { name: /enable notifications/i });
        expect(switchEl).toBeDisabled();
    });

    it('respects defaultChecked', () => {
        render(<Switch aria-label="Enable notifications" defaultChecked />);
        const switchEl = screen.getByRole('switch', { name: /enable notifications/i });
        expect(switchEl).toHaveAttribute('data-state', 'checked');
    });
});
