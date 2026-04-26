const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '..', 'src', 'environments');
const file = 'environment.ts';
const prodFile = 'environment.prod.ts';

const content = `export const environment = {
  production: true,
  apiUrl: "${process.env.API_URL || 'http://localhost:8080/api'}",
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

// In CI/CD environments like Vercel, we want to OVERWRITE the files with the injected variables.
const isCI = process.env.VERCEL === '1' || process.env.CI === 'true';

if (isCI || !fs.existsSync(path.join(dir, file))) {
  console.log('Generating environment.ts for CI/CD build...');
  fs.writeFileSync(path.join(dir, file), content);
} else {
  console.log('environment.ts already exists. Skipping generation.');
}

if (isCI || !fs.existsSync(path.join(dir, prodFile))) {
  console.log('Generating environment.prod.ts for CI/CD build...');
  fs.writeFileSync(path.join(dir, prodFile), content);
} else {
  console.log('environment.prod.ts already exists. Skipping generation.');
}
