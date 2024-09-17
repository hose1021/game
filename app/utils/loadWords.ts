import {promises as fs} from 'fs';

export async function loadWords(): Promise<string[]> {
    const file = await fs.readFile(process.cwd() + '/app/dictionaries/az.txt', 'utf8');
    return JSON.parse(file);
}
