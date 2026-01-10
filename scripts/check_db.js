require('dotenv').config();
const postgres = require('postgres');

async function main() {
    if (!process.env.DATABASE_URL) {
        console.error("DATABASE_URL is not set");
        process.exit(1);
    }

    const sql = postgres(process.env.DATABASE_URL);

    try {
        console.log("Checking columns...");

        // Check avatar column in users
        const usersCols = await sql`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'users' AND column_name = 'avatar';
        `;
        console.log("Users avatar column:", usersCols);

        // Check status column in events
        const eventsCols = await sql`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'events' AND column_name = 'status';
        `;
        console.log("Events status column:", eventsCols);

    } catch (error) {
        console.error("Error:", error);
    } finally {
        await sql.end();
    }
}

main();
