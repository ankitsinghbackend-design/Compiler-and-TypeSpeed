const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const { GoogleGenAI } = require('@google/genai');

console.log('Current directory:', __dirname);
console.log('Env file path:', path.resolve(__dirname, '../.env'));
// API Key loaded from environment (logging removed for security)
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const config={
  responseMimeType:'text/plain',
}
const model = 'gemini-2.0-flash';
const contents= [
        {
          role: 'user',

          parts: [
            {
              text: 'Hello, I will give you a piece of code, your task is that of a testcase generator, analyze the code and wherever input is required and in the required format as per program(line by line), generate the edgecases for the program, and give those test cases in the form of strings in an array',
            },
          ],
        },

        {
          role: 'model',

          parts: [
            {
              text: 'Sure, give me the first code. After that i will only give the testcases which will be edge cases for the program you provide and give them as per required input format (usually line by line ) and act as an api for you which gives you the testcases in the form of an array',
            },
          ],
        },
        {
          role: 'user',
          parts: [
            {
              text: `
            def calculate_sum():
    n = int(input("Enter the number of integers: "))
    numbers = []
    for _ in range(n):
        num = int(input("Enter an integer: "))
        numbers.append(num)
    print("Sum:", sum(numbers))

# Example usage:
# calculate_sum()

`,
            },
          ],
        },
        {
          role: 'model',
          parts: [
            {
              text: `[
    "0",                   
    "1\n2147483647",          
    "1\n-2147483648",         
    "2\n2147483647\n2147483647", 
    "2\n-2147483648\n-2147483648", 
    "5\n0\n0\n0\n0\n0",        
    "3\n999999999\n-999999999\n1", 
    "100\n" + "\n".join(["1"] * 100), 
    "10\n" + "\n".join(["2147483647", "-2147483648", "0"] * 3 + ["1"]),
]
`,
            },
          ],
        },
      ];


const generateTestCases = async (code) => {
  try {
    contents.push({
      role: "user",
      parts: [
        {
          text: code,
        },
      ]})
     const response = await ai.models.generateContent({
    model,
    config,
    contents,
  });
  return response.text;
  
  } catch (err) {
    console.error(err);
  }
};

module.exports = { generateTestCases };
