import chalk from 'chalk';

// --------------------------------------------
// CLIENT CLASS
// --------------------------------------------
class Client {
  constructor(name, phoneNumber, reason = 'general_inquiry') {
    this.id = Math.random().toString(36).substr(2, 9);
    this.name = name;
    this.phoneNumber = phoneNumber;
    this.reason = reason;
    this.status = 'pending'; // pending, calling, answered, missed
    this.callAttempts = 0;
    this.lastCallTime = null;
    this.roundAnswered = null;
  }
}

// --------------------------------------------
// AUTOMATIC CALLING SYSTEM
// --------------------------------------------
class AutomaticCallingSystem {
  constructor() {
    this.clients = [];
    this.currentRound = 1;
    this.isRunning = false;
    this.totalCalls = 0;
    this.successfulCalls = 0;
  }

  // Add a single client
  addClient(name, phoneNumber, reason = 'general_inquiry') {
    const client = new Client(name, phoneNumber, reason);
    this.clients.push(client);
    console.log(chalk.green(`✅ Added client: ${name} - ${phoneNumber} (${reason})`));
    return client;
  }

  // Add multiple clients
  addClients(clientsData) {
    clientsData.forEach(({ name, phoneNumber, reason }) =>
      this.addClient(name, phoneNumber, reason)
    );
  }

  // Simulate a call
  async callClient(client) {
    console.log(chalk.blue(`📞 Calling ${client.name} (${client.phoneNumber})...`));

    client.status = 'calling';
    client.callAttempts++;
    client.lastCallTime = new Date();
    this.totalCalls++;

    const callDuration = 2000 + Math.random() * 4000;

    return new Promise((resolve) => {
      setTimeout(() => {
        const answered = Math.random() > 0.3; // 70% chance of answer

        if (answered) {
          client.status = 'answered';
          client.roundAnswered = this.currentRound;
          this.successfulCalls++;
          console.log(chalk.green(`✅ ${client.name} ANSWERED (Round ${this.currentRound})`));
        } else {
          client.status = 'missed';
          console.log(
            chalk.red(`❌ ${client.name} MISSED CALL (Round ${this.currentRound}) - will retry next round`)
          );
        }

        resolve(answered);
      }, callDuration);
    });
  }

  // Determine who to call in this round
  getClientsToCall() {
    if (this.currentRound === 1) {
      return [...this.clients];
    } else {
      return this.clients.filter(
        (c) => c.status === 'pending' || c.status === 'missed'
      );
    }
  }

  // Check if all clients answered
  allClientsAnswered() {
    return this.clients.every((c) => c.status === 'answered');
  }

  // Display round info
  displayRoundHeader(round, clientsToCall) {
    console.log('\n' + '='.repeat(60));
    console.log(chalk.yellow.bold(`🔄 ROUND ${round} STARTING`));
    console.log('='.repeat(60));

    if (round === 1) {
      console.log(chalk.cyan(`🚀 Calling ALL ${this.clients.length} clients`));
      console.log(chalk.cyan(`📞 Sequence: ${this.clients.map((c) => c.name).join(' → ')}`));
    } else {
      const answeredCount = this.clients.filter((c) => c.status === 'answered').length;
      console.log(
        chalk.cyan(`🎯 ROUND ${round}: Calling ${clientsToCall.length} unanswered clients`)
      );
      console.log(chalk.cyan(`✅ Skipping ${answeredCount} already answered`));
      console.log(chalk.cyan(`📞 Targets: ${clientsToCall.map((c) => c.name).join(' → ')}`));
    }
    console.log('='.repeat(60) + '\n');
  }

  // Display round summary
  displayRoundSummary(round, clientsToCall) {
    console.log('\n' + '-'.repeat(50));
    console.log(chalk.magenta.bold(`📊 ROUND ${round} SUMMARY`));
    console.log('-'.repeat(50));

    const answered = clientsToCall.filter((c) => c.status === 'answered').length;
    const missed = clientsToCall.filter((c) => c.status === 'missed').length;

    console.log(chalk.green(`✅ Answered this round: ${answered}`));
    console.log(chalk.red(`❌ Missed this round: ${missed}`));

    const totalAnswered = this.clients.filter((c) => c.status === 'answered').length;
    const totalMissed = this.clients.filter((c) => c.status === 'missed').length;

    console.log(chalk.blue(`📈 Total answered: ${totalAnswered}/${this.clients.length}`));
    console.log(chalk.blue(`📉 Total missed: ${totalMissed}/${this.clients.length}`));
    console.log('-'.repeat(50) + '\n');
  }

  // Process one full round
  async processRound() {
    const clientsToCall = this.getClientsToCall();

    if (clientsToCall.length === 0) {
      console.log(chalk.yellow('\n✅ All clients have answered — no calls left.'));
      return false;
    }

    this.displayRoundHeader(this.currentRound, clientsToCall);

    for (let i = 0; i < clientsToCall.length; i++) {
      const client = clientsToCall[i];

      if (!this.isRunning) {
        console.log(chalk.yellow('⏹️ Calling system stopped by user.'));
        return false;
      }

      console.log(chalk.blue(`📍 Position ${i + 1}/${clientsToCall.length}`));
      await this.callClient(client);
      await new Promise((r) => setTimeout(r, 800)); // small delay
    }

    this.displayRoundSummary(this.currentRound, clientsToCall);
    return true;
  }

  // Start the calling system
  async startAutomaticCalling() {
    if (this.clients.length === 0) {
      console.log(chalk.red('❌ No clients to call. Please add clients first.'));
      return;
    }

    if (this.isRunning) {
      console.log(chalk.yellow('⚠️ Calling system is already running.'));
      return;
    }

    console.log(chalk.green.bold('\n🚀 AUTOMATIC CALLING SYSTEM STARTING'));
    console.log(chalk.green('═'.repeat(60)));
    console.log(chalk.green(`📋 Total clients: ${this.clients.length}`));
    console.log(chalk.green(`🎯 Strategy: Round-based retry for missed calls`));
    console.log(chalk.green('═'.repeat(60)));

    this.isRunning = true;
    this.currentRound = 1;
    this.totalCalls = 0;
    this.successfulCalls = 0;

    const startTime = Date.now();

    try {
      while (this.isRunning && !this.allClientsAnswered()) {
        const completed = await this.processRound();
        if (!completed) break;

        if (this.allClientsAnswered()) break;

        this.currentRound++;
        console.log(chalk.yellow(`⏳ Preparing for Round ${this.currentRound}...`));
        await new Promise((r) => setTimeout(r, 2000));
      }

      this.displayFinalResults(startTime);
    } catch (err) {
      console.error(chalk.red('❌ Error in calling system:'), err);
    } finally {
      this.isRunning = false;
    }
  }

  // Display final results
  displayFinalResults(startTime) {
    const duration = Math.round((Date.now() - startTime) / 1000);
    console.log('\n' + '🎉'.repeat(20));
    console.log(chalk.green.bold('🎉 AUTOMATIC CALLING SYSTEM COMPLETE! 🎉'));
    console.log('🎉'.repeat(20));

    console.log(chalk.green('\n📊 FINAL STATS'));
    console.log(chalk.green('═'.repeat(40)));
    console.log(chalk.green(`✅ Total clients: ${this.clients.length}`));
    console.log(chalk.green(`📞 Total calls made: ${this.totalCalls}`));
    console.log(chalk.green(`✅ Successful calls: ${this.successfulCalls}`));
    console.log(chalk.green(`🔄 Rounds completed: ${this.currentRound}`));
    console.log(chalk.green(`⏱️ Duration: ${duration}s`));
    console.log(chalk.green('═'.repeat(40)));

    console.log(chalk.blue.bold('\n👥 CLIENT DETAILS:'));
    this.clients.forEach((c, i) => {
      const status =
        c.status === 'answered'
          ? chalk.green('✅ ANSWERED')
          : chalk.red('❌ MISSED');
      const roundInfo = c.roundAnswered
        ? chalk.yellow(`(Round ${c.roundAnswered})`)
        : chalk.gray('(Never answered)');
      console.log(
        chalk.blue(`${i + 1}. ${c.name} - ${c.phoneNumber} - ${status} ${roundInfo}`)
      );
    });

    if (this.allClientsAnswered()) {
      console.log(chalk.green.bold('\n🎊 SUCCESS: All clients have been reached!'));
    } else {
      const unanswered = this.clients.filter((c) => c.status !== 'answered').length;
      console.log(chalk.yellow.bold(`\n⚠️ ${unanswered} clients still haven’t answered.`));
    }
  }

  // Stop the system
  stop() {
    this.isRunning = false;
    console.log(chalk.yellow('\n⏹️ Stopping automatic calling system...'));
  }

  // Reset everything
  reset() {
    this.clients.forEach((c) => {
      c.status = 'pending';
      c.callAttempts = 0;
      c.lastCallTime = null;
      c.roundAnswered = null;
    });
    this.currentRound = 1;
    this.isRunning = false;
    this.totalCalls = 0;
    this.successfulCalls = 0;
    console.log(chalk.green('🔄 System reset complete'));
  }

  // Display status
  displayStatus() {
    console.log(chalk.blue.bold('\n📊 CURRENT STATUS'));
    console.log(chalk.blue('═'.repeat(40)));
    console.log(chalk.blue(`📋 Total clients: ${this.clients.length}`));
    console.log(chalk.blue(`🔄 Current round: ${this.currentRound}`));
    console.log(chalk.blue(`🏃 Running: ${this.isRunning ? 'Yes' : 'No'}`));

    const answered = this.clients.filter((c) => c.status === 'answered').length;
    const missed = this.clients.filter((c) => c.status === 'missed').length;
    const pending = this.clients.filter((c) => c.status === 'pending').length;

    console.log(chalk.green(`✅ Answered: ${answered}`));
    console.log(chalk.red(`❌ Missed: ${missed}`));
    console.log(chalk.gray(`⏳ Pending: ${pending}`));
    console.log(chalk.blue('═'.repeat(40)));
  }
}

// --------------------------------------------
// DEMO FUNCTION
// --------------------------------------------
async function runDemo() {
  console.log(chalk.magenta.bold('🎯 AUTOMATIC CALLING SYSTEM DEMO'));
  console.log(chalk.magenta('═'.repeat(50)));

  const system = new AutomaticCallingSystem();

  const sampleClients = [
    { name: 'John Smith', phoneNumber: '+1-555-0101', reason: 'payment_reminder' },
    { name: 'Sarah Johnson', phoneNumber: '+1-555-0102', reason: 'follow_up' },
    { name: 'Mike Davis', phoneNumber: '+1-555-0103', reason: 'feedback_request' },
    { name: 'Lisa Wilson', phoneNumber: '+1-555-0104', reason: 'appointment_confirmation' },
    { name: 'David Brown', phoneNumber: '+1-555-0105', reason: 'service_inquiry' },
    { name: 'Emma Taylor', phoneNumber: '+1-555-0106', reason: 'complaint_resolution' },
  ];

  console.log(chalk.cyan('\n📝 Adding clients...'));
  system.addClients(sampleClients);

  console.log(chalk.cyan('\n📊 Initial status:'));
  system.displayStatus();

  console.log(chalk.cyan('\n⏳ Starting automatic calling in 3 seconds...'));
  await new Promise((r) => setTimeout(r, 3000));

  await system.startAutomaticCalling();

  console.log(chalk.magenta('\n🏁 Demo completed!'));
}

// --------------------------------------------
// EXIT HANDLER
// --------------------------------------------
process.on('SIGINT', () => {
  console.log(chalk.yellow('\n👋 Shutting down gracefully...'));
  process.exit(0);
});

// Run
runDemo().catch(console.error);