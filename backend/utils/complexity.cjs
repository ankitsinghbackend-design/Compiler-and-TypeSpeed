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
const contents=[
        {
          role: "user",
          parts: [
            {
              text: "Hello, I will give you a piece of code. Your task is that of a complexity analyzer. You have to give the time complexity and space complexity space-separated so that I can use you as an API to show complexities on my app. Don't give anything else.",
            },
          ],
        },
        {
          role: "model",
          parts: [
            {
              text: "Sure, give me the first code. After that, I will only give complexities and act as an API for you which gives space-separated time complexity and space complexity of the code you provided.",
            },
          ],
        },
        {
          role: "user",
          parts: [
            {
              text: `#include <bits/stdc++.h>
using namespace std;

// An optimized version of Bubble Sort 
void bubbleSort(vector<int>& arr) {
    int n = arr.size();
    bool swapped;
  
    for (int i = 0; i < n - 1; i++) {
        swapped = false;
        for (int j = 0; j < n - i - 1; j++) {
            if (arr[j] > arr[j + 1]) {
                swap(arr[j], arr[j + 1]);
                swapped = true;
            }
        }
      
        // If no two elements were swapped, then break
        if (!swapped)
            break;
    }
}

// Function to print a vector
void printVector(const vector<int>& arr) {
    for (int num : arr)
        cout << " " << num;
}

int main() {
    vector<int> arr = { 64, 34, 25, 12, 22, 11, 90 };
    bubbleSort(arr);
    cout << "Sorted array: \\n";
    printVector(arr);
    return 0;
}`,
            },
          ],
        },
        {
          role: "model",
          parts: [
            {
              text: "O(n^2) O(1)",
            },
          ],
        },
      ];



const generateComplexity = async (code) => {
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


module.exports = { generateComplexity };
