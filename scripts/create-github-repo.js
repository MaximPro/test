#!/usr/bin/env node

/**
 * GitHub Repository Creator
 *
 * This script creates a new GitHub repository using the GitHub REST API.
 *
 * Usage:
 *   node scripts/create-github-repo.js <repo-name> [options]
 *
 * Options:
 *   --description, -d    Repository description
 *   --private           Create as private repository (default: false)
 *   --public            Create as public repository (default: true)
 *
 * Environment Variables:
 *   GITHUB_TOKEN        Your GitHub personal access token (required)
 *
 * Example:
 *   GITHUB_TOKEN=your_token node scripts/create-github-repo.js my-new-repo --description "My awesome project"
 */

const https = require('https');

// Parse command line arguments
const args = process.argv.slice(2);

if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
  console.log(`
GitHub Repository Creator

Usage:
  node scripts/create-github-repo.js <repo-name> [options]

Options:
  --description, -d    Repository description
  --private           Create as private repository (default: false)
  --public            Create as public repository (default: true)

Environment Variables:
  GITHUB_TOKEN        Your GitHub personal access token (required)

Example:
  GITHUB_TOKEN=your_token node scripts/create-github-repo.js my-new-repo --description "My awesome project"
  `);
  process.exit(0);
}

// Extract repo name and options
const repoName = args[0];
let description = '';
let isPrivate = false;

for (let i = 1; i < args.length; i++) {
  if (args[i] === '--description' || args[i] === '-d') {
    description = args[i + 1] || '';
    i++;
  } else if (args[i] === '--private') {
    isPrivate = true;
  } else if (args[i] === '--public') {
    isPrivate = false;
  }
}

// Get GitHub token from environment
const githubToken = process.env.GITHUB_TOKEN;

if (!githubToken) {
  console.error('❌ Error: GITHUB_TOKEN environment variable is required');
  console.error('');
  console.error('To create a GitHub token:');
  console.error('1. Go to https://github.com/settings/tokens');
  console.error('2. Click "Generate new token (classic)"');
  console.error('3. Select the "repo" scope');
  console.error('4. Generate token and copy it');
  console.error('5. Set it as an environment variable: export GITHUB_TOKEN=your_token');
  process.exit(1);
}

// Prepare repository data
const repoData = {
  name: repoName,
  description: description,
  private: isPrivate,
  auto_init: true, // Initialize with README
};

// Create the repository
console.log(`📦 Creating GitHub repository: ${repoName}`);
console.log(`   Description: ${description || '(none)'}`);
console.log(`   Visibility: ${isPrivate ? 'private' : 'public'}`);
console.log('');

const postData = JSON.stringify(repoData);

const options = {
  hostname: 'api.github.com',
  port: 443,
  path: '/user/repos',
  method: 'POST',
  headers: {
    'User-Agent': 'Node.js GitHub Repo Creator',
    'Authorization': `token ${githubToken}`,
    'Accept': 'application/vnd.github.v3+json',
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData),
  },
};

const req = https.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    try {
      const response = JSON.parse(data);

      if (res.statusCode === 201) {
        console.log('✅ Repository created successfully!');
        console.log('');
        console.log(`   Name:     ${response.name}`);
        console.log(`   Owner:    ${response.owner.login}`);
        console.log(`   URL:      ${response.html_url}`);
        console.log(`   Clone:    ${response.clone_url}`);
        console.log(`   SSH:      ${response.ssh_url}`);
        console.log('');

        // Output as JSON for programmatic use
        if (process.env.OUTPUT_JSON === 'true') {
          console.log(JSON.stringify({
            success: true,
            name: response.name,
            full_name: response.full_name,
            html_url: response.html_url,
            clone_url: response.clone_url,
            ssh_url: response.ssh_url,
          }, null, 2));
        }

        process.exit(0);
      } else {
        console.error(`❌ Error creating repository (HTTP ${res.statusCode})`);
        console.error('');
        if (response.message) {
          console.error(`   Message: ${response.message}`);
        }
        if (response.errors) {
          console.error('   Errors:');
          response.errors.forEach(err => {
            console.error(`     - ${err.message}`);
          });
        }
        console.error('');
        process.exit(1);
      }
    } catch (error) {
      console.error('❌ Error parsing response:', error.message);
      console.error('   Raw response:', data);
      process.exit(1);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Error making request:', error.message);
  process.exit(1);
});

req.write(postData);
req.end();
