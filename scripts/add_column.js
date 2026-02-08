const Database = require('better-sqlite3');
const db = new Database('runninglabs.db');
try {
    console.log('Attempting to add ai_insight column...');
    db.prepare('ALTER TABLE activities ADD COLUMN ai_insight TEXT').run();
    console.log('Column ai_insight added successfully to activities table.');
} catch (e) {
    console.log('Migration failed or column likely already exists:', e.message);
}
