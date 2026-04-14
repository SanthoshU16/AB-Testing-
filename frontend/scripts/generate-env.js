const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '..', 'src', 'environments');
const file = 'environment.ts';
const prodFile = 'environment.prod.ts';

const content = `export const environment = {
  production: true,
  firebase: {
    apiKey: "${process.env.FIREBASE_API_KEY || 'dummy_api_key'}",
    authDomain: "${process.env.FIREBASE_AUTH_DOMAIN || 'dummy_auth_domain'}",
    projectId: "${process.env.FIREBASE_PROJECT_ID || 'dummy_project_id'}",
    storageBucket: "${process.env.FIREBASE_STORAGE_BUCKET || 'dummy_storage_bucket'}",
    messagingSenderId: "${process.env.FIREBASE_MESSAGING_SENDER_ID || 'dummy_sender_id'}",
    appId: "${process.env.FIREBASE_APP_ID || 'dummy_app_id'}",
    measurementId: "${process.env.FIREBASE_MEASUREMENT_ID || 'dummy_measurement_id'}"
  }
};
`;

if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

// Only create files if they don't already exist.
// This prevents overriding the developer's local environment files containing real keys.
if (!fs.existsSync(path.join(dir, file))) {
  console.log('Generating missing environment.ts for CI/CD build...');
  fs.writeFileSync(path.join(dir, file), content);
} else {
  console.log('environment.ts already exists. Skipping generation.');
}

if (!fs.existsSync(path.join(dir, prodFile))) {
  console.log('Generating missing environment.prod.ts for CI/CD build...');
  fs.writeFileSync(path.join(dir, prodFile), content);
} else {
  console.log('environment.prod.ts already exists. Skipping generation.');
}
