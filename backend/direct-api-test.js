// Direct test for Judge0 API on RapidAPI
import axios from 'axios';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Get credentials from env
const RAPID_API_KEY = process.env.RAPID_API_KEY;
const RAPID_API_HOST = process.env.RAPID_API_HOST || 'judge0-ce.p.rapidapi.com';

async function testRapidAPI() {
  console.log('Testing RapidAPI Connection');
  console.log('---------------------------');
  console.log('API Host:', RAPID_API_HOST);
  console.log('API Key:', RAPID_API_KEY ? `${RAPID_API_KEY.substring(0, 5)}...${RAPID_API_KEY.substring(RAPID_API_KEY.length - 5)}` : 'Not set');
  
  try {
    // Step 1: Test with a language list request (doesn't require a subscription)
    console.log('\nStep 1: Testing basic API connectivity...');
    const languagesOptions = {
      method: 'GET',
      url: `https://${RAPID_API_HOST}/languages`,
      headers: {
        'X-RapidAPI-Key': RAPID_API_KEY,
        'X-RapidAPI-Host': RAPID_API_HOST
      }
    };
    
    const languagesResponse = await axios.request(languagesOptions);
    console.log('Languages API response status:', languagesResponse.status);
    console.log('Number of languages:', languagesResponse.data.length);
    
    // Step 2: Test a simple submission (requires subscription)
    console.log('\nStep 2: Testing submission API...');
    const options = {
      method: 'POST',
      url: `https://${RAPID_API_HOST}/submissions`,
      headers: {
        'content-type': 'application/json',
        'X-RapidAPI-Key': RAPID_API_KEY,
        'X-RapidAPI-Host': RAPID_API_HOST
      },
      data: {
        language_id: 62, // Java
        source_code: 'public class Main { public static void main(String[] args) { System.out.println("Hello Judge0!"); } }',
        stdin: ''
      }
    };
    
    const response = await axios.request(options);
    console.log('Submission API response status:', response.status);
    
    if (response.data && response.data.token) {
      console.log('Token received:', response.data.token);
      console.log('\nAPI connection successful! Your key and subscription are working.');
    } else {
      console.log('Unexpected response:', response.data);
    }
  } catch (error) {
    console.error('\nAPI Connection Error:');
    
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Status Text:', error.response.statusText);
      console.error('Response data:', error.response.data);
      
      if (error.response.status === 403) {
        console.error('\n⚠️ Authentication Error (403 Forbidden)');
        console.error('This usually means your RapidAPI key is valid but you have not subscribed to the Judge0 API.');
        console.error('To fix this:');
        console.error('1. Go to https://rapidapi.com/judge0-official/api/judge0-ce');
        console.error('2. Sign in with your RapidAPI account');
        console.error('3. Click "Subscribe to Test" and select a plan (even the free BASIC plan)');
        console.error('4. Once subscribed, try again');
      } else if (error.response.status === 401) {
        console.error('\n⚠️ Authentication Error (401 Unauthorized)');
        console.error('This means your RapidAPI key is invalid or incorrect.');
        console.error('To fix this:');
        console.error('1. Go to https://rapidapi.com/developer/dashboard');
        console.error('2. Find your API key and make sure it matches what you have in your .env file');
      } else if (error.response.status === 429) {
        console.error('\n⚠️ Rate Limit Exceeded (429 Too Many Requests)');
        console.error('You have exceeded the quota for your subscription tier.');
      }
    } else {
      console.error('Error:', error.message);
    }
  }
}

testRapidAPI().catch(err => {
  console.error('Unhandled error:', err);
});
