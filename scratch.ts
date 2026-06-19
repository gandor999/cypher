import * as fs from 'fs';

const data = JSON.parse(fs.readFileSync('logs/inspect.json', 'utf8'));
const labels: string[] = [];

function findText(obj: any) {
    if (!obj) return;
    if (obj.text) labels.push('Text: ' + obj.text);
    if (obj.attributes && obj.attributes['aria-label']) {
        labels.push('Aria: ' + obj.attributes['aria-label']);
    }
    if (obj.children) {
        obj.children.forEach((c: any) => findText(c));
    }
}

data.forEach((d: any) => findText(d.ast));

// Print all unique labels
const unique = Array.from(new Set(labels));
console.log(unique.join('\n'));
