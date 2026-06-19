import { getLivePageJsonAST } from '../../../src/browser/util';

describe('Browser Util - getLivePageJsonAST', () => {
    afterEach(() => {
        delete (global as any).document;
        delete (global as any).Node;
    });

    const createMockBrowser = () => {
        const mockFrame = {
            evaluate: jest.fn().mockImplementation((cb) => cb()),
            url: jest.fn().mockReturnValue('https://example.com')
        };
        const mockPage = {
            frames: jest.fn().mockReturnValue([mockFrame]),
            mainFrame: jest.fn().mockReturnValue(mockFrame)
        };
        const mockBrowser = {
            pages: jest.fn().mockResolvedValue([mockPage])
        };
        return { mockBrowser, mockFrame };
    };

    it('generates a valid AST from mocked DOM', async () => {
        // Mock Node types
        global.Node = {
            ELEMENT_NODE: 1,
            TEXT_NODE: 3
        } as any;

        const mockTextNode = {
            nodeType: 3,
            textContent: 'Hello World'
        };

        const mockEl = {
            nodeType: 1,
            tagName: 'DIV',
            attributes: [
                { name: 'id', value: 'test-id' },
                { name: 'class', value: 'test-class' }
            ],
            childNodes: [mockTextNode]
        };

        global.document = {
            body: {
                childNodes: [mockEl]
            }
        } as any;

        const { mockBrowser } = createMockBrowser();
        const ast = await getLivePageJsonAST(mockBrowser as any);

        expect(ast).toBeDefined();
        // Return shape has source, isMainFrame, ast
        expect(ast.source).toBe('main-document');
        expect(ast.ast.tag).toBe('div');
        expect(ast.ast.attributes.id).toBe('test-id');
        expect(ast.ast.text).toBe('Hello World');
    });

    it('throws error if activeBrowser is null', async () => {
        await expect(getLivePageJsonAST(null)).rejects.toThrow('No active browser running.');
    });

    it('throws error if no pages are open', async () => {
        const mockBrowser = { pages: jest.fn().mockResolvedValue([]) };
        await expect(getLivePageJsonAST(mockBrowser as any)).rejects.toThrow('No open pages found.');
    });

    it('handles cross-origin frame evaluate error gracefully', async () => {
        const { mockBrowser, mockFrame } = createMockBrowser();
        mockFrame.evaluate.mockRejectedValue(new Error('cross origin'));

        const ast = await getLivePageJsonAST(mockBrowser as any);
        // Returns empty since evaluate throws
        expect(ast).toEqual([]);
    });

    it('handles invalid frame urls (unknown iframe)', async () => {
        const mockFrameMain = {
            evaluate: jest.fn().mockResolvedValue({ tag: 'html' }),
            url: jest.fn().mockReturnValue('https://example.com')
        };
        const mockFrameInvalidUrl = {
            evaluate: jest.fn().mockResolvedValue({ tag: 'iframe' }),
            url: jest.fn().mockReturnValue('invalid-url') // new URL('invalid-url') throws
        };
        const mockFrameValidUrl = {
            evaluate: jest.fn().mockResolvedValue({ tag: 'iframe2' }),
            url: jest.fn().mockReturnValue('https://sub.example.com')
        };
        const mockPage = {
            frames: jest.fn().mockReturnValue([mockFrameMain, mockFrameInvalidUrl, mockFrameValidUrl]),
            mainFrame: jest.fn().mockReturnValue(mockFrameMain)
        };
        const mockBrowser = { pages: jest.fn().mockResolvedValue([mockPage]) };

        const ast: any = await getLivePageJsonAST(mockBrowser as any);
        expect(ast).toBeDefined();
        expect(Array.isArray(ast)).toBe(true);
        expect(ast[1].source).toBe('unknown-iframe');
        expect(ast[2].source).toBe('sub.example.com'); // Covers line 24
    });

    it('handles DOM elements with multiple children', async () => {
        global.Node = {
            ELEMENT_NODE: 1,
            TEXT_NODE: 3
        } as any;

        const mockTextNode1 = { nodeType: 3, textContent: 'Text 1 ' };
        const mockTextNode2 = { nodeType: 3, textContent: 'Text 2' };

        const mockEl = {
            nodeType: 1,
            tagName: 'DIV',
            attributes: [],
            childNodes: [mockTextNode1, mockTextNode2] // two children
        };

        global.document = {
            body: {
                childNodes: [mockEl]
            }
        } as any;

        const { mockBrowser } = createMockBrowser();
        const ast: any = await getLivePageJsonAST(mockBrowser as any);

        expect(ast.ast.children.length).toBe(2);
        expect(ast.ast.children[0]).toBe('Text 1');
        expect(ast.ast.children[1]).toBe('Text 2');
    });

    it('filters out empty/whitespace text nodes (line 34)', async () => {
        global.Node = { ELEMENT_NODE: 1, TEXT_NODE: 3 } as any;

        // Empty text node — parseNode returns null, so it gets filtered from children
        const emptyTextNode = { nodeType: 3, textContent: '   ' };
        const mockEl = {
            nodeType: 1,
            tagName: 'P',
            attributes: [],
            childNodes: [emptyTextNode]
        };
        global.document = { body: { childNodes: [mockEl] } } as any;

        const { mockBrowser } = createMockBrowser();
        const ast: any = await getLivePageJsonAST(mockBrowser as any);

        // The <p> element is returned but has no children/text since the only child was empty
        expect(ast.ast.tag).toBe('p');
        expect(ast.ast.children).toBeUndefined();
        expect(ast.ast.text).toBeUndefined();
    });

    it('filters out non-element, non-text node types (line 37)', async () => {
        global.Node = { ELEMENT_NODE: 1, TEXT_NODE: 3 } as any;

        // nodeType 8 = COMMENT_NODE — parseNode returns null
        const commentNode = { nodeType: 8, textContent: 'a comment' };
        const mockEl = {
            nodeType: 1,
            tagName: 'SECTION',
            attributes: [],
            childNodes: [commentNode]
        };
        global.document = { body: { childNodes: [mockEl] } } as any;

        const { mockBrowser } = createMockBrowser();
        const ast: any = await getLivePageJsonAST(mockBrowser as any);

        expect(ast.ast.tag).toBe('section');
        expect(ast.ast.children).toBeUndefined();
    });

    it('filters out <script> and <style> tags (lines 38-39)', async () => {
        global.Node = { ELEMENT_NODE: 1, TEXT_NODE: 3 } as any;

        const scriptNode = { nodeType: 1, tagName: 'SCRIPT', attributes: [], childNodes: [] };
        const styleNode = { nodeType: 1, tagName: 'STYLE', attributes: [], childNodes: [] };
        const divNode = { nodeType: 1, tagName: 'DIV', attributes: [], childNodes: [] };

        global.document = { body: { childNodes: [scriptNode, styleNode, divNode] } } as any;

        const { mockBrowser } = createMockBrowser();
        const ast: any = await getLivePageJsonAST(mockBrowser as any);

        // Only the div survives — single root is unwrapped directly
        expect(ast.ast.tag).toBe('div');
    });

    it('skips null children when building child list (lines 54-59)', async () => {
        global.Node = { ELEMENT_NODE: 1, TEXT_NODE: 3 } as any;

        // Mix of valid text and a comment node (returns null from parseNode)
        const validText = { nodeType: 3, textContent: 'visible' };
        const commentNode = { nodeType: 8 };
        const mockEl = {
            nodeType: 1,
            tagName: 'SPAN',
            attributes: [],
            childNodes: [commentNode, validText, commentNode]
        };
        global.document = { body: { childNodes: [mockEl] } } as any;

        const { mockBrowser } = createMockBrowser();
        const ast: any = await getLivePageJsonAST(mockBrowser as any);

        // Only "visible" survives; single string child becomes obj.text
        expect(ast.ast.text).toBe('visible');
        expect(ast.ast.children).toBeUndefined();
    });

    it('returns array when multiple root-level nodes exist (lines 72-80)', async () => {
        global.Node = { ELEMENT_NODE: 1, TEXT_NODE: 3 } as any;

        const node1 = { nodeType: 1, tagName: 'HEADER', attributes: [], childNodes: [] };
        const node2 = { nodeType: 1, tagName: 'MAIN', attributes: [], childNodes: [] };

        global.document = { body: { childNodes: [node1, node2] } } as any;

        const { mockBrowser } = createMockBrowser();
        const ast: any = await getLivePageJsonAST(mockBrowser as any);

        // Two root nodes → ast should be an array
        expect(Array.isArray(ast.ast)).toBe(true);
        expect(ast.ast[0].tag).toBe('header');
        expect(ast.ast[1].tag).toBe('main');
    });

    it('filters null top-level root nodes (lines 72-76)', async () => {
        global.Node = { ELEMENT_NODE: 1, TEXT_NODE: 3 } as any;

        // Comment node at root (null) + a valid element
        const commentNode = { nodeType: 8 };
        const divNode = { nodeType: 1, tagName: 'DIV', attributes: [], childNodes: [] };

        global.document = { body: { childNodes: [commentNode, divNode] } } as any;

        const { mockBrowser } = createMockBrowser();
        const ast: any = await getLivePageJsonAST(mockBrowser as any);

        // Only one valid root — unwrapped directly, not an array
        expect(ast.ast.tag).toBe('div');
        expect(Array.isArray(ast.ast)).toBe(false);
    });

    it('skips pushing to results if frameAST is falsy (line 80)', async () => {
        const { mockBrowser, mockFrame } = createMockBrowser();

        // Return null from evaluate so frameAST is falsy
        mockFrame.evaluate.mockResolvedValue(null);

        const ast = await getLivePageJsonAST(mockBrowser as any);

        // Since it's null, the astResults remains empty
        expect(ast).toEqual([]);
    });
});
