# Automatic Calling System

A complete Node.js automatic calling system that runs in multiple rounds until all clients answer.

## Features

- **Round-based Calling**: First round calls everyone, subsequent rounds call only unanswered clients
- **Automatic Stop**: System stops when all clients have answered
- **Realistic Simulation**: Uses setTimeout to simulate actual calling with random response times
- **Detailed Logging**: Shows each round, which clients were called, and final results
- **Client Management**: Each client has name, phone, status, reason, and call history
- **Async/Await**: Modern JavaScript with proper async handling

## Installation

```bash
cd nodejs-calling-system
npm install
```

## Usage

### Run the Demo
```bash
npm start
```

### Development Mode (with auto-restart)
```bash
npm run dev
```

## How It Works

### Round System
1. **Round 1**: Calls ALL clients in the list
2. **Round 2**: Calls ONLY clients who didn't answer in Round 1
3. **Round 3+**: Continues calling only unanswered clients
4. **Auto Stop**: When all clients have answered

### Client Status
- `pending`: Not called yet
- `calling`: Currently being called
- `answered`: Successfully answered
- `missed`: Didn't answer the call

### Call Reasons
- `payment_reminder`
- `follow_up`
- `feedback_request`
- `appointment_confirmation`
- `service_inquiry`
- `complaint_resolution`
- `general_inquiry`

## Example Output

```
🚀 AUTOMATIC CALLING SYSTEM STARTING
════════════════════════════════════════════════════════════
📋 Total clients: 6
🎯 Strategy: Round-based calling until all answer
⏱️ Timeout: 10 seconds per call
════════════════════════════════════════════════════════════

============================================================
🔄 ROUND 1 STARTING
============================================================
🚀 FIRST ROUND: Calling ALL 6 clients
📞 Sequence: John Smith → Sarah Johnson → Mike Davis → Lisa Wilson → David Brown → Emma Taylor
============================================================

📍 Position 1/6 in Round 1
📞 Calling John Smith (+1-555-0101)...
✅ John Smith ANSWERED (Round 1)

📍 Position 2/6 in Round 1
📞 Calling Sarah Johnson (+1-555-0102)...
❌ Sarah Johnson MISSED CALL (Round 1)

... (continues for all clients)

🎉 AUTOMATIC CALLING SYSTEM COMPLETE! 🎉
```

## Customization

### Add Your Own Clients
```javascript
const callingSystem = new AutomaticCallingSystem();

callingSystem.addClient('Your Client', '+1-555-1234', 'follow_up');
callingSystem.addClient('Another Client', '+1-555-5678', 'payment_reminder');

await callingSystem.startAutomaticCalling();
```

### Modify Call Success Rate
In the `callClient` method, change this line:
```javascript
const answered = Math.random() > 0.3; // 70% success rate
```

### Adjust Call Duration
In the `callClient` method, modify:
```javascript
const callDuration = 2000 + Math.random() * 6000; // 2-8 seconds
```

## API Methods

- `addClient(name, phone, reason)` - Add a single client
- `addClients(clientsArray)` - Add multiple clients
- `startAutomaticCalling()` - Start the calling process
- `stop()` - Stop the calling process
- `reset()` - Reset all client statuses
- `displayStatus()` - Show current system status

## Requirements

- Node.js 16+ (for ES modules support)
- npm or yarn

## Dependencies

- `chalk` - For colored console output