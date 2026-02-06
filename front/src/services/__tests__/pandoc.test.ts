import { canConvertWithPandoc } from '../pandoc';

// Mock global fetch for API tests
global.fetch = jest.fn();

describe('Pandoc Service', () => {
    beforeEach(() => {
        (global.fetch as jest.Mock).mockClear();
    });

    describe('canConvertWithPandoc', () => {
        it('returns true for supported formats', () => {
            expect(canConvertWithPandoc('document.docx')).toBe(true);
            expect(canConvertWithPandoc('document.doc')).toBe(true);
            expect(canConvertWithPandoc('document.odt')).toBe(true);
            expect(canConvertWithPandoc('document.rtf')).toBe(true);
            expect(canConvertWithPandoc('document.html')).toBe(true);
            expect(canConvertWithPandoc('document.htm')).toBe(true);
            expect(canConvertWithPandoc('document.epub')).toBe(true);
            expect(canConvertWithPandoc('document.tex')).toBe(true);
            expect(canConvertWithPandoc('document.latex')).toBe(true);
            expect(canConvertWithPandoc('presentation.pptx')).toBe(true);
            expect(canConvertWithPandoc('presentation.ppt')).toBe(true);
            expect(canConvertWithPandoc('presentation.odp')).toBe(true);
            expect(canConvertWithPandoc('notes.md')).toBe(true);
            expect(canConvertWithPandoc('notes.markdown')).toBe(true);
        });

        it('returns true for filenames without extension (empty string is in set)', () => {
            // Note: The current implementation includes "" in supported formats
            expect(canConvertWithPandoc('filename')).toBe(true);
        });

        it('returns false for unsupported formats', () => {
            expect(canConvertWithPandoc('image.png')).toBe(false);
            expect(canConvertWithPandoc('image.jpg')).toBe(false);
            expect(canConvertWithPandoc('video.mp4')).toBe(false);
            expect(canConvertWithPandoc('data.csv')).toBe(false);
            expect(canConvertWithPandoc('archive.zip')).toBe(false);
        });

        it('is case-insensitive', () => {
            expect(canConvertWithPandoc('DOCUMENT.DOCX')).toBe(true);
            expect(canConvertWithPandoc('Document.Docx')).toBe(true);
        });
    });
});
