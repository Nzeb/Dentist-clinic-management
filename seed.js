require('dotenv').config();
require('ts-node').register();
const { pool } = require('./src/server/db/config.ts');
const bcrypt = require('bcryptjs');

async function seed() {
    try {
        await pool.query('DELETE FROM users');

        const users = [
            { username: 'admin', password: 'password', role: 'Admin', fullName: 'Admin User', email: 'admin@example.com' },
            { username: 'doctor', password: 'password', role: 'Doctor', fullName: 'Dr. John Doe', email: 'doctor@example.com' },
            { username: 'reception', password: 'password', role: 'Reception', fullName: 'Receptionist', email: 'reception@example.com' },
        ];

        for (const user of users) {
            const hashedPassword = await bcrypt.hash(user.password, 10);
            await pool.query(
                'INSERT INTO users (username, password, role, "fullName", email) VALUES ($1, $2, $3, $4, $5)',
                [user.username, hashedPassword, user.role, user.fullName, user.email]
            );
        }

        console.log('Test users created successfully');
    } catch (error) {
        console.error('Error seeding database:', error);
    } finally {
        pool.end();
    }
}

seed();
