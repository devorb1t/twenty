import { parseInitialBlocknote } from '@/blocknote-editor/utils/parseInitialBlocknote';

describe('parseInitialBlocknote', () => {
  it('should parse valid JSON array string and ensure block ids', () => {
    const input = JSON.stringify([{ type: 'paragraph', content: 'test' }]);
    const result = parseInitialBlocknote(input);
    expect(result).toHaveLength(1);
    expect(result?.[0].type).toBe('paragraph');
    expect(result?.[0].id).toBeDefined();
  });

  it('should preserve existing block ids', () => {
    const input = JSON.stringify([
      { id: 'my-id', type: 'paragraph', content: 'test' },
    ]);
    const result = parseInitialBlocknote(input);
    expect(result?.[0].id).toBe('my-id');
  });

  it('should return undefined for empty string', () => {
    expect(parseInitialBlocknote('')).toBeUndefined();
  });

  it('should return undefined for null', () => {
    expect(parseInitialBlocknote(null)).toBeUndefined();
  });

  it('should return undefined for undefined', () => {
    expect(parseInitialBlocknote(undefined)).toBeUndefined();
  });

  it('should return undefined for empty object string "{}"', () => {
    expect(parseInitialBlocknote('{}')).toBeUndefined();
  });

  it('should return undefined for invalid JSON', () => {
    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
    expect(parseInitialBlocknote('invalid json')).toBeUndefined();
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it('should return undefined for empty array', () => {
    expect(parseInitialBlocknote('[]')).toBeUndefined();
  });

  it('should return undefined for non-array JSON', () => {
    expect(parseInitialBlocknote('{"key": "value"}')).toBeUndefined();
  });

  it('should use custom log context when parsing fails', () => {
    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
    parseInitialBlocknote('invalid', 'Custom context');
    expect(consoleSpy).toHaveBeenCalledWith('Custom context');
    consoleSpy.mockRestore();
  });
});
