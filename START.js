#!/usr/bin/env node

/**
 * ROLLOUT READY - UNIFIED START/DEPLOY BUTTON
 * 
 * This is the SINGLE ENTRY POINT for all backend service launches.
 * ALL deployment modes (dev/prod) MUST use this unified start button.
 * NO duplicate or disconnected start scripts should be created.
 */

const { spawn } = require('child_process');
const fs = require('fs');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Colors for console output
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    red: '\x1b[31m',
    cyan: '\x1b[36m',
    white: '\x1b[37m'
};

function log(text, color = 'white') {
    console.log(`${colors[color]}${text}${colors.reset}`);
}

function showHeader() {
    console.clear();
    log('', 'white');
    log('🚀 ROLLOUT READY - PWA AUTO-DEPLOY', 'green');
    log('===================================', 'green');
    log('', 'white');
    log('Starting automatic PWA deployment...', 'yellow');
    log('', 'white');
}

function showMenu() {
    log('Quick Options:', 'cyan');
    log('', 'white');
    log('[1] 🚀 Auto-Deploy PWA (Recommended)', 'green');
    log('[2] 🔧 Development Mode', 'white');
    log('[3] 🛠️  Advanced Options', 'white');
    log('[4] ❌ Exit', 'white');
    log('', 'white');
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

async function autoDeployPWA() {
    log('', 'white');
    log('🚀 AUTO-DEPLOYING PWA...', 'green');
    log('========================', 'green');
    log('', 'white');

    try {
        log('📦 Installing dependencies...', 'cyan');
        await runCommand('npm', ['install']);

        log('🗄️  Setting up database...', 'cyan');
        await runCommand('npx', ['prisma', 'db', 'push']);

        log('🌱 Seeding database...', 'cyan');
        try {
            await runCommand('npm', ['run', 'seed']);
        } catch (error) {
            log('⚠️  Database seeding failed, continuing...', 'yellow');
        }

        log('🔨 Building PWA...', 'cyan');
        await runCommand('npm', ['run', 'build']);

        log('', 'white');
        log('🚀 STARTING ROLLOUT READY PWA...', 'green');
        log('', 'white');
        log('✅ PWA Available at: http://localhost:3000', 'green');
        log('📱 Install as PWA from your browser!', 'cyan');
        log('💡 Press Ctrl+C to stop', 'yellow');
        log('', 'white');

        await runCommand('npm', ['start']);
    } catch (error) {
        log(`❌ Error: ${error.message}`, 'red');
        await waitForEnter();
    }
}

async function startDevelopment() {
    log('', 'white');
    log('🔧 STARTING DEVELOPMENT MODE...', 'yellow');
    log('===============================', 'yellow');
    log('', 'white');

    try {
        log('📦 Installing dependencies...', 'cyan');
        await runCommand('npm', ['install']);

        log('🗄️  Setting up database...', 'cyan');
        await runCommand('npx', ['prisma', 'db', 'push']);

        log('🌱 Seeding database...', 'cyan');
        try {
            await runCommand('npm', ['run', 'seed']);
        } catch (error) {
            log('⚠️  Database seeding failed, continuing...', 'yellow');
        }

        log('', 'white');
        log('🚀 STARTING DEVELOPMENT SERVER...', 'green');
        log('', 'white');
        log('✅ Server: http://localhost:3000', 'green');
        log('💡 Press Ctrl+C to stop', 'yellow');
        log('', 'white');

        await runCommand('npm', ['run', 'dev']);
    } catch (error) {
        log(`❌ Error: ${error.message}`, 'red');
        await waitForEnter();
    }
}

async function startProduction() {
    log('', 'white');
    log('🏭 STARTING PRODUCTION MODE...', 'yellow');
    log('==============================', 'yellow');
    log('', 'white');

    try {
        log('📦 Installing dependencies...', 'cyan');
        await runCommand('npm', ['install']);

        log('🔨 Building application...', 'cyan');
        await runCommand('npm', ['run', 'build']);

        log('🗄️  Setting up database...', 'cyan');
        await runCommand('npx', ['prisma', 'db', 'push']);

        log('🌱 Seeding database...', 'cyan');
        try {
            await runCommand('npm', ['run', 'seed']);
        } catch (error) {
            log('⚠️  Database seeding failed, continuing...', 'yellow');
        }

        log('', 'white');
        log('🚀 STARTING PRODUCTION SERVER...', 'green');
        log('', 'white');
        log('✅ Server: http://localhost:3000', 'green');
        log('💡 Press Ctrl+C to stop', 'yellow');
        log('', 'white');

        await runCommand('npm', ['start']);
    } catch (error) {
        log(`❌ Error: ${error.message}`, 'red');
        await waitForEnter();
    }
}

async function buildOnly() {
    log('', 'white');
    log('🔨 BUILD ONLY MODE...', 'yellow');
    log('====================', 'yellow');
    log('', 'white');

    try {
        log('📦 Installing dependencies...', 'cyan');
        await runCommand('npm', ['install']);

        log('🔨 Building application...', 'cyan');
        await runCommand('npm', ['run', 'build']);

        log('', 'white');
        log('✅ Build completed successfully!', 'green');
        log('📁 Files in .next directory', 'cyan');
        await waitForEnter();
    } catch (error) {
        log(`❌ Error: ${error.message}`, 'red');
        await waitForEnter();
    }
}

async function setupDatabase() {
    log('', 'white');
    log('🛠️  DATABASE SETUP MODE...', 'yellow');
    log('==========================', 'yellow');
    log('', 'white');

    try {
        log('📦 Installing dependencies...', 'cyan');
        await runCommand('npm', ['install']);

        log('🗄️  Setting up database schema...', 'cyan');
        await runCommand('npx', ['prisma', 'db', 'push']);

        log('⚙️  Generating Prisma client...', 'cyan');
        await runCommand('npx', ['prisma', 'generate']);

        log('🌱 Seeding database...', 'cyan');
        await runCommand('npm', ['run', 'seed']);

        log('', 'white');
        log('✅ Database setup completed!', 'green');
        log('👤 Admin: admin / admin123', 'cyan');
        await waitForEnter();
    } catch (error) {
        log(`❌ Error: ${error.message}`, 'red');
        await waitForEnter();
    }
}

async function fullReset() {
    log('', 'white');
    log('🔄 FULL RESET MODE...', 'yellow');
    log('====================', 'yellow');
    log('', 'white');
    log('⚠️  WARNING: This deletes ALL data!', 'red');
    log('', 'white');

    const confirm = await askQuestion("Type 'YES' to continue: ");
    if (confirm !== 'YES') {
        log('Reset cancelled.', 'yellow');
        await waitForEnter();
        return;
    }

    try {
        log('🧹 Cleaning files...', 'cyan');
        if (fs.existsSync('node_modules')) {
            await runCommand('rmdir', ['/s', '/q', 'node_modules']);
        }
        if (fs.existsSync('.next')) {
            await runCommand('rmdir', ['/s', '/q', '.next']);
        }
        if (fs.existsSync('prisma/dev.db')) {
            fs.unlinkSync('prisma/dev.db');
        }

        log('📦 Fresh install...', 'cyan');
        await runCommand('npm', ['install']);

        log('🗄️  Fresh database...', 'cyan');
        await runCommand('npx', ['prisma', 'db', 'push']);

        log('🌱 Fresh seed...', 'cyan');
        await runCommand('npm', ['run', 'seed']);

        log('', 'white');
        log('✅ Full reset completed!', 'green');
        log('🎉 Ready for fresh start', 'cyan');
        await waitForEnter();
    } catch (error) {
        log(`❌ Error: ${error.message}`, 'red');
        await waitForEnter();
    }
}

function askQuestion(question) {
    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            resolve(answer);
        });
    });
}

function waitForEnter() {
    return askQuestion('Press Enter to continue...');
}

async function showAdvancedOptions() {
    while (true) {
        console.clear();
        log('', 'white');
        log('🛠️  ADVANCED OPTIONS', 'cyan');
        log('===================', 'cyan');
        log('', 'white');
        log('[1] 🏭 Production Mode', 'white');
        log('[2] 🔨 Build Only', 'white');
        log('[3] 🛠️  Database Setup Only', 'white');
        log('[4] 🔄 Full Reset', 'white');
        log('[5] ⬅️  Back to Main Menu', 'yellow');
        log('', 'white');

        const choice = await askQuestion('Enter choice (1-5): ');

        switch (choice) {
            case '1':
                await startProduction();
                log('🛑 Server stopped.', 'yellow');
                await waitForEnter();
                break;
            case '2':
                await buildOnly();
                break;
            case '3':
                await setupDatabase();
                break;
            case '4':
                await fullReset();
                break;
            case '5':
                return; // Go back to main menu
            default:
                log('❌ Invalid choice. Select 1-5.', 'red');
                await waitForEnter();
                break;
        }
    }
}

async function main() {
    while (true) {
        showHeader();
        showMenu();

        const choice = await askQuestion('Enter choice (1-4): ');

        switch (choice) {
            case '1':
                await autoDeployPWA();
                log('🛑 Server stopped.', 'yellow');
                await waitForEnter();
                break;
            case '2':
                await startDevelopment();
                log('🛑 Server stopped.', 'yellow');
                await waitForEnter();
                break;
            case '3':
                await showAdvancedOptions();
                break;
            case '4':
                log('👋 Goodbye!', 'green');
                rl.close();
                process.exit(0);
            default:
                log('❌ Invalid choice. Select 1-4.', 'red');
                await waitForEnter();
                break;
        }
    }
}

// Handle Ctrl+C
process.on('SIGINT', () => {
    log('', 'white');
    log('👋 Goodbye!', 'green');
    rl.close();
    process.exit(0);
});

// START THE APPLICATION
main().catch((error) => {
    log(`Fatal error: ${error.message}`, 'red');
    rl.close();
    process.exit(1);
});
