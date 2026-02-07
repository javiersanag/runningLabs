import { cn } from './utils';

describe('Utils', () => {
    describe('cn', () => {
        it('should merge classes correctly', () => {
            expect(cn('p-4', 'bg-red-500')).toBe('p-4 bg-red-500');
        });

        it('should resolve tailwind conflicts', () => {
            // 'p-4' is padding: 1rem. 'p-2' is padding: 0.5rem.
            // twMerge should keep the last one.
            expect(cn('p-4', 'p-2')).toBe('p-2');
        });

        it('should handle conditional classes', () => {
            const condition = true;
            expect(cn('p-4', condition && 'text-white', !condition && 'text-black')).toBe('p-4 text-white');
        });

        it('should handle arrays and objects', () => {
             // clsx supports objects and arrays, let's verify cn passes them through
             expect(cn(['text-lg', 'font-bold'])).toBe('text-lg font-bold');
             expect(cn({ 'hidden': true, 'block': false })).toBe('hidden');
        });
    });
});
