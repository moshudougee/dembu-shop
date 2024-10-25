import path from "path";
import fs from "fs";


const dbPath = path.join(process.cwd(), 'database/db.json');

export const readDB = () => {
    try {
        const data = fs.readFileSync(dbPath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error(`Error reading database: ${error}`);
        return {};
    }
};

export const writeDB = (data: unknown) => {
    try {
        fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
        console.log('Database saved successfully');
    } catch (error) {
        console.error(`Error writing database: ${error}`);
    }
}