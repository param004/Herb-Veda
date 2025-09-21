import axios from 'axios';

async function main() {
  const base = process.env.API_URL || 'http://localhost:5050';
  const email = process.env.TEST_EMAIL || 'work.parampambhar@gmail.com';
  try {
    const { data, status } = await axios.post(`${base}/api/auth/password/forgot`, { email });
    console.log('Status:', status);
    console.log('Body:', data);
  } catch (err) {
    console.error('Error:', err.response?.status, err.response?.data || err.message);
  }
}

main();
