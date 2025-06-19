#!/usr/bin/env node

/**
 * ROLLOUT READY - ONE-CLICK PWA DEPLOYMENT
 * 
 * This script automatically deploys the PWA with zero user interaction.
 * Perfect for production deployment anywhere.
 */

const { spawn } = require('child_process');
const fs = require('fs');

// Colors for console output
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    red: '\x1b[31m',
    cyan: '\x1b[36m',
    white: '\x1b[37m'
};

function log(text, color = 'white') {
    console.log(`${colors[color]}${text}${colors.reset}`);
}

function runCommand(command, args = []) {
    return new Promise((resolve, reject) => {
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

async function deployPWA() {
    console.clear();
    log('', 'white');
    log('🚀 ROLLOUT READY - ONE-CLICK PWA DEPLOYMENT', 'green');
    log('============================================', 'green');
    log('', 'white');
    log('🎯 Automatically deploying PWA...', 'yellow');
    log('', 'white');

    try {
        log('📦 Installing dependencies...', 'cyan');
        await runCommand('npm', ['install']);

        log('🗄️  Setting up database...', 'cyan');
        await runCommand('npx', ['prisma', 'db', 'push']);

        log('🌱 Seeding database with sample data...', 'cyan');
        try {
            await runCommand('npm', ['run', 'seed']);
        } catch (error) {
            log('⚠️  Database seeding failed, continuing...', 'yellow');
        }

        log('🔨 Building optimized PWA...', 'cyan');
        await runCommand('npm', ['run', 'build']);

        log('', 'white');
        log('🎉 PWA DEPLOYMENT COMPLETE!', 'green');
        log('', 'white');
        log('🚀 Starting Rollout Ready PWA...', 'green');
        log('', 'white');
        log('✅ PWA Available at: http://localhost:3000', 'green');
        log('📱 Install as PWA from your browser menu!', 'cyan');
        log('🔑 Default Admin: admin / admin123', 'yellow');
        log('💡 Press Ctrl+C to stop the server', 'white');
        log('', 'white');

        // Start the production server
        await runCommand('npm', ['start']);

    } catch (error) {
        log('', 'white');
        log('❌ DEPLOYMENT FAILED!', 'red');
        log(`Error: ${error.message}`, 'red');
        log('', 'white');
        log('💡 Try running the command again or check the error above.', 'yellow');
        process.exit(1);
    }
}

// Handle Ctrl+C gracefully
process.on('SIGINT', () => {
    log('', 'white');
    log('🛑 PWA deployment stopped.', 'yellow');
    log('👋 Goodbye!', 'green');
    process.exit(0);
});

// Auto-deploy immediately
deployPWA().catch((error) => {
    log(`Fatal error: ${error.message}`, 'red');
    process.exit(1);
});
