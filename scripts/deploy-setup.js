#!/usr/bin/env node

/**
 * Production Deployment Setup Script
 * Handles database migration and seeding for production deployment
 */

const { spawn } = require('child_process');

function runCommand(command, args = []) {
    return new Promise((resolve, reject) => {
        console.log(`Running: ${command} ${args.join(' ')}`);
        const child = spawn(command, args, {
            stdio: 'inherit',
            shell: true
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
        console.log('🚀 Setting up production database...');
        
        // Generate Prisma client
        console.log('📦 Generating Prisma client...');
        await runCommand('npx', ['prisma', 'generate']);
        
        // Push database schema
        console.log('🗄️ Setting up database schema...');
        await runCommand('npx', ['prisma', 'db', 'push']);
        
        // Seed database
        console.log('🌱 Seeding database...');
        await runCommand('npm', ['run', 'seed']);
        
        console.log('✅ Production setup complete!');
        
    } catch (error) {
        console.error('❌ Production setup failed:', error.message);
        process.exit(1);
    }
}

setupProduction();
