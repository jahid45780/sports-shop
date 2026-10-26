/**
 * Admin Account Bootstrap Script
 * Usage:
 *   ADMIN_EMAIL="admin@apexkit.com" ADMIN_PASSWORD="your-strong-password" npx tsx scripts/bootstrapAdmin.ts
 */
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

async function main() {
  console.log('====================================================');
  console.log('       ApexKit Sports Admin Bootstrap Utility       ');
  console.log('====================================================');

  const email = process.env.ADMIN_EMAIL || process.argv[2] || 'admin@apexkit.com';
  const password = process.env.ADMIN_PASSWORD || process.argv[3] || 'ApexKit@Secure2026';

  if (!email || !email.includes('@')) {
    console.error('❌ Error: A valid email address is required.');
    process.exit(1);
  }

  if (!password || password.length < 8) {
    console.error('❌ Error: Password must be at least 8 characters long for production security.');
    process.exit(1);
  }

  console.log(`\n📧 Configuring Administrator: ${email}`);
  console.log('🔒 Generating bcrypt salt rounds (12)...');

  const saltRounds = 12;
  const hash = await bcrypt.hash(password, saltRounds);

  const generatedJwtSecret = crypto.randomBytes(32).toString('hex');

  console.log('\n✅ Admin Account Credentials Prepared:');
  console.log('----------------------------------------------------');
  console.log(`ADMIN_EMAIL:         ${email}`);
  console.log(`ADMIN_PASSWORD_HASH: ${hash}`);
  console.log('----------------------------------------------------');
  console.log('\n📋 Add these lines to your production .env file:');
  console.log(`ADMIN_EMAIL="${email}"`);
  console.log(`ADMIN_PASSWORD_HASH="${hash}"`);
  console.log(`JWT_ACCESS_SECRET="${generatedJwtSecret}"`);
  console.log('----------------------------------------------------');
  console.log('\n⚠️  SECURITY REMINDER: Keep your plaintext password safe and NEVER commit .env to source control.');
}

main().catch((err) => {
  console.error('Bootstrap failed:', err);
  process.exit(1);
});
