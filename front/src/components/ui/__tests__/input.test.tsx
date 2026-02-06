import { render, screen, fireEvent } from '@testing-library/react';
import { Input } from '../input';

describe('Input Component', () => {
    it('renders correctly', () => {
        render(<Input placeholder="Enter text" />);
        const input = screen.getByPlaceholderText('Enter text');
        expect(input).toBeInTheDocument();
    });

    it('accepts type attribute', () => {
        render(<Input type="password" placeholder="Password" />);
        const input = screen.getByPlaceholderText('Password');
        expect(input).toHaveAttribute('type', 'password');
    });

    it('handles change events', () => {
        const handleChange = jest.fn();
        render(<Input onChange={handleChange} placeholder="Type here" />);
        const input = screen.getByPlaceholderText('Type here');

        fireEvent.change(input, { target: { value: 'test' } });
        expect(handleChange).toHaveBeenCalledTimes(1);
    });

    it('can be disabled', () => {
        render(<Input disabled placeholder="Disabled" />);
        const input = screen.getByPlaceholderText('Disabled');
        expect(input).toBeDisabled();
    });
});
