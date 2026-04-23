import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { NARCOVI, TROLAN_THE_MAD } from '../src/data/content/npcs/harbinger-residents';
import { formatPF2eStatblock } from '../src/data/transform/pf2e-statblock-formatter';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const fixturesDir = path.join(rootDir, 'src', '__tests__', 'data', 'fixtures', 'pf2e-statblock-formatter');

const fixtures = [
	{ fileName: 'trolan-the-mad.html', html: formatPF2eStatblock(TROLAN_THE_MAD) },
	{ fileName: 'narcovi.html', html: formatPF2eStatblock(NARCOVI) },
] as const;

fs.mkdirSync(fixturesDir, { recursive: true });

for (const fixture of fixtures) {
	const filePath = path.join(fixturesDir, fixture.fileName);
	fs.writeFileSync(filePath, `${fixture.html.trim()}\n`, 'utf8');
	console.log(`Updated ${fixture.fileName}`);
}

console.log(`Refreshed ${fixtures.length} statblock fixture files in ${fixturesDir}`);
