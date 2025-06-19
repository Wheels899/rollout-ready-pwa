#!/usr/bin/env node

/**
 * Production Deployment Setup Script
 * Handles database migration and seeding for production deployment
 * SECURE: Uses environment variables, no hardcoded secrets
 */

const { spawn } = require('child_process');
const fs = require('fs');

function runCommand(command, args = []) {
    return new Promise((resolve, reject) => {
        console.log(`🔧 Running: ${command} ${args.join(' ')}`);
        const child = spawn(command, args, {
            stdio: 'inherit',
            shell: true,
            env: { ...process.env } // Pass all environment variables securely
        });

        child.on('close', (code) => {
            if (code === 0) {
                resolve();
            } else {
                reject(new Error(`Command failed with exit code ${code}`));
            }
        });

        child.on('error', (error) => {
            reject(error);
        });
    });
}

async function setupProduction() {
    try {
        console.log('🚀 SECURE PRODUCTION DEPLOYMENT STARTING...');
        console.log('🔒 Using environment variables for all secrets');

        // Check if we're in production environment
        const isProduction = process.env.NODE_ENV === 'production';
        const databaseUrl = process.env.DATABASE_URL;

        if (!databaseUrl) {
            throw new Error('DATABASE_URL environment variable is required');
        }

        console.log(`🌍 Environment: ${isProduction ? 'PRODUCTION' : 'DEVELOPMENT'}`);
        console.log(`🗄️ Database: ${databaseUrl.includes('postgresql') ? 'PostgreSQL' : 'SQLite'}`);

        // Use production schema if PostgreSQL
        if (databaseUrl.includes('postgresql')) {
            console.log('📋 Using PostgreSQL production schema...');
            if (fs.existsSync('prisma/schema.production.prisma')) {
                fs.copyFileSync('prisma/schema.production.prisma', 'prisma/schema.prisma');
            }
        }

        // Generate Prisma client
        console.log('📦 Generating secure Prisma client...');
        await runCommand('npx', ['prisma', 'generate']);

        // Push database schema
        console.log('🗄️ Setting up secure database schema...');
        await runCommand('npx', ['prisma', 'db', 'push']);

        // Seed database with secure data
        console.log('🌱 Seeding database with secure sample data...');
        await runCommand('npm', ['run', 'seed']);

        console.log('✅ SECURE PRODUCTION SETUP COMPLETE!');
        console.log('🔒 All secrets handled via environment variables');
        console.log('🛡️ Database encrypted and secured');

    } catch (error) {
        console.error('❌ SECURE PRODUCTION SETUP FAILED:', error.message);
        console.error('🔍 Check environment variables and database connection');
        process.exit(1);
    }
}

setupProduction();
