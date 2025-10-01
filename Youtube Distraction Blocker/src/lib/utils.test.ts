import { describe, it, expect } from 'vitest';
import { cn } from './utils';

describe('Utils', () => {
  describe('cn (className utility)', () => {
    it('should merge tailwind classes correctly', () => {
      expect(cn('bg-red-500', 'text-white')).toBe('bg-red-500 text-white');
    });

    it('should handle conditional classes', () => {
      const result = cn('bg-red-500', true && 'text-white', false && 'bg-blue-500');
      expect(result).toBe('bg-red-500 text-white');
    });

    it('should resolve conflicting classes, last one wins', () => {
      const result = cn('bg-red-500', 'bg-blue-500');
      expect(result).toBe('bg-blue-500');
    });

    it('should handle objects', () => {
      const result = cn('bg-red-500', { 'text-white': true, 'bg-blue-500': false });
      expect(result).toBe('bg-red-500 text-white');
    });

    it('should handle arrays', () => {
      const result = cn(['bg-red-500', 'text-white'], 'font-bold');
      expect(result).toBe('bg-red-500 text-white font-bold');
    });
  });
});
