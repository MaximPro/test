#!/usr/bin/env node

/**
 * Interactive GitHub Repository Creator
 *
 * This script provides an interactive interface for creating GitHub repositories.
 * It prompts the user for all necessary information.
 */

const readline = require('readline');
const { spawn } = require('child_process');
const path = require('path');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function main() {
  console.log('╔═══════════════════════════════════════════════════════════╗');
  console.log('║   GitHub Repository Creator - Interactive Mode           ║');
  console.log('╚═══════════════════════════════════════════════════════════╝');
  console.log('');

  try {
    // Check for GitHub token
    if (!process.env.GITHUB_TOKEN) {
      console.log('⚠️  GITHUB_TOKEN not found in environment variables.');
      console.log('');
      console.log('To create a token:');
      console.log('  1. Visit: https://github.com/settings/tokens');
      console.log('  2. Click "Generate new token (classic)"');
      console.log('  3. Select the "repo" scope');
      console.log('  4. Copy the token');
      console.log('');

      const token = await question('Enter your GitHub token (or press Enter to exit): ');

      if (!token || token.trim() === '') {
        console.log('');
        console.log('❌ No token provided. Exiting.');
        rl.close();
        process.exit(1);
      }

      process.env.GITHUB_TOKEN = token.trim();
      console.log('✅ Token set!');
      console.log('');
    } else {
      console.log('✅ GitHub token found in environment');
      console.log('');
    }

    // Get repository name
    const repoName = await question('Repository name: ');
    if (!repoName || repoName.trim() === '') {
      console.log('❌ Repository name is required');
      rl.close();
      process.exit(1);
    }

    // Get description
    const description = await question('Description (optional): ');

    // Get visibility
    const visibility = await question('Public or private? (public/private, default: public): ');
    const isPrivate = visibility.toLowerCase().trim() === 'private';

    console.log('');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('Summary:');
    console.log(`  Name:        ${repoName.trim()}`);
    console.log(`  Description: ${description.trim() || '(none)'}`);
    console.log(`  Visibility:  ${isPrivate ? 'private' : 'public'}`);
    console.log('═══════════════════════════════════════════════════════════');
    console.log('');

    const confirm = await question('Create this repository? (yes/no): ');

    if (confirm.toLowerCase() !== 'yes' && confirm.toLowerCase() !== 'y') {
      console.log('❌ Cancelled');
      rl.close();
      process.exit(0);
    }

    rl.close();
    console.log('');

    // Build arguments for the create script
    const args = [repoName.trim()];

    if (description.trim()) {
      args.push('--description', description.trim());
    }

    if (isPrivate) {
      args.push('--private');
    }

    // Run the create-github-repo script
    const scriptPath = path.join(__dirname, 'create-github-repo.js');
    const createProcess = spawn('node', [scriptPath, ...args], {
      stdio: 'inherit',
      env: process.env
    });

    createProcess.on('close', (code) => {
      process.exit(code);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
    rl.close();
    process.exit(1);
  }
}

main();
