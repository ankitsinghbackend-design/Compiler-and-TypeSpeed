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
              text: 'Hello, I will give you a piece of code, your task is that of a code suggestor, you have to give the code suggestions for a cleaner code and better code practises  so that i can use you as an api , to show suggestions on my app.',
            },
          ],
        },

        {
          role: 'model',

          parts: [
            {
              text: 'Sure, give me the first code. After that i will only give the suggestions  and act as an api for you which gives you the best practises and the clean nature of code you provided',
            },
          ],
        },
        {
          role: 'user',
          parts: [
            {
              text: `
            #include <iostream>
using namespace std;

void bubbleSort(int arr[], int n) {
    for (int i = 0; i < n - 1; i++) {
        for (int j = 0; j < n - i - 1; j++) {
            if (arr[j] > arr[j + 1]) {
                // Swap arr[j] and arr[j+1]
                int temp = arr[j];
                arr[j] = arr[j + 1];
                arr[j + 1] = temp;
            }
        }
    }
}

int main() {
    int arr[] = {64, 34, 25, 12, 22, 11, 90};
    int n = sizeof(arr) / sizeof(arr[0]);
    bubbleSort(arr, n);
    cout << "Sorted array: ";
    for (int i = 0; i < n; i++) {
        cout << arr[i] << " ";
    }
    return 0;
}

`,
            },
          ],
        },
        {
          role: 'model',
          parts: [
            {
              text: `#include <iostream>
#include <algorithm> // For std::swap
using namespace std;

// Function to perform Bubble Sort
void bubbleSort(int arr[], const int n) {
    bool swapped; // Flag to track if any swap happened in the iteration
    for (int i = 0; i < n - 1; ++i) {
        swapped = false;
        for (int j = 0; j < n - i - 1; ++j) {
            if (arr[j] > arr[j + 1]) {
                // Swap using std::swap
                swap(arr[j], arr[j + 1]);
                swapped = true;
            }
        }
        // If no elements were swapped, the array is already sorted
        if (!swapped) {
            break;
        }
    }
}

// Function to print an array
void printArray(const int arr[], const int n) {
    for (int i = 0; i < n; ++i) {
        cout << arr[i] << " ";
    }
    cout << endl;
}

int main() {
    int arr[] = {64, 34, 25, 12, 22, 11, 90};
    const int n = sizeof(arr) / sizeof(arr[0]);
    
    bubbleSort(arr, n);
    cout << "Sorted array: ";
    printArray(arr, n);
    
    return 0;
}
`,
            },
          ],
        },
      ];


const generateSuggestion = async (code) => {
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

module.exports = { generateSuggestion };
