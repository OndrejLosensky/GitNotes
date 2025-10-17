import * as bcrypt from 'bcrypt';

async function hashPassword(password: string) {
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);
  console.log('\nHashed password:');
  console.log(hash);
  console.log('\nAdd this to your .env file as AUTH_PASSWORD');
}

// Get password from command line argument
const password = process.argv[2];

if (!password) {
  console.error('Usage: ts-node hash-password.ts <password>');
  process.exit(1);
}

hashPassword(password);
