import { Browser } from 'puppeteer';

export async function getLivePageJsonAST(activeBrowser: Browser | null): Promise<any> {
    if (!activeBrowser) {
        throw new Error('No active browser running.');
    }
    const pages = await activeBrowser.pages();
    const page = pages[pages.length - 1]; 
    if (!page) {
         throw new Error('No open pages found.');
    }

    const astResults: any[] = [];
    const frames = page.frames();

    for (const frame of frames) {
        try {
            const isMainFrame = frame === page.mainFrame();
            let frameDomain = 'main-document';
            
            if (!isMainFrame) {
                try {
                    const url = new URL(frame.url());
                    frameDomain = url.hostname;
                } catch(e) {
                    frameDomain = 'unknown-iframe';
                }
            }

            const frameAST = await frame.evaluate(() => {
                function parseNode(node: any): any {
                    if (node.nodeType === Node.TEXT_NODE) {
                        const text = node.textContent.trim();
                        return text ? text : null;
                    }
                    
                    if (node.nodeType !== Node.ELEMENT_NODE) return null;
                    if (node.tagName.toLowerCase() === 'script') return null;
                    if (node.tagName.toLowerCase() === 'style') return null;
                    
                    const obj: any = { tag: node.tagName.toLowerCase() };
                    
                    if (node.attributes.length > 0) {
                        obj.attributes = {};
                        for (let i = 0; i < node.attributes.length; i++) {
                            const attr = node.attributes[i];
                            obj.attributes[attr.name] = attr.value;
                        }
                    }
                    
                    const children = [];
                    for (let i = 0; i < node.childNodes.length; i++) {
                        const childNode = parseNode(node.childNodes[i]);
                        if (childNode !== null) {
                            children.push(childNode);
                        }
                    }
                    
                    if (children.length > 0) {
                        if (children.length === 1 && typeof children[0] === 'string') {
                            obj.text = children[0];
                        } else {
                            obj.children = children;
                        }
                    }
                    return obj;
                }

                const rootNodes = [];
                for (let i = 0; i < document.body.childNodes.length; i++) {
                    const childNode = parseNode(document.body.childNodes[i]);
                    if (childNode !== null) {
                        rootNodes.push(childNode);
                    }
                }
                
                return rootNodes.length === 1 ? rootNodes[0] : rootNodes;
            });

            if (frameAST) {
                astResults.push({
                    source: frameDomain,
                    isMainFrame,
                    ast: frameAST
                });
            }
        } catch (e) {
            // Ignore execution context errors for unreachable frames
        }
    }

    return astResults.length === 1 ? astResults[0] : astResults;
}