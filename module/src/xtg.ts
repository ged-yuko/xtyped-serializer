import g from './mapping-generator'
import * as a from './annotations'
import * as fs from 'fs'
import * as path from 'path'


export default function main(args: string[]) {
    if (args.length !== 2) {
        const msg = `
    Usage:
        xtg <in-schema.xsd> <out-model.ts>
        `;
        console.warn(msg);
    } else {
        const schemaFileName = args[0];
        const outFileName = args[1];

        const schemaText = fs.readFileSync(schemaFileName, 'utf8');
        const tsModelText = g.generate(schemaText);
        fs.writeFileSync(outFileName, tsModelText);
    }
}


// if (process.argv0.includes("xtg")) {

const args = process.argv.slice(2);
// console.warn('args:' + JSON.stringify(args));

main(args);

// }

