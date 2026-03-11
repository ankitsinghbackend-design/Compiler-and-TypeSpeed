#!/usr/bin/env node

/**
 * Code Runner Validation Test Suite
 * Tests all enhanced functionality of the code runner backend
 */

import executeCode from '../utils/executeCode.js';

const testCases = [
  {
    name: "C++ STL and Modern Features",
    language: "cpp",
    code: `#include <iostream>
#include <vector>
#include <algorithm>
#include <map>
#include <set>
using namespace std;

int main() {
    vector<int> vec = {5, 2, 8, 1, 9};
    sort(vec.begin(), vec.end());
    
    map<string, int> wordCount;
    wordCount["hello"] = 1;
    wordCount["world"] = 2;
    
    cout << "Sorted vector: ";
    for(int x : vec) {
        cout << x << " ";
    }
    cout << endl;
    
    cout << "Map contents: ";
    for(auto& p : wordCount) {
        cout << p.first << "=" << p.second << " ";
    }
    cout << endl;
    
    return 0;
}`,
    input: "",
    expectedOutputContains: ["Sorted vector:", "1 2 5 8 9", "Map contents:", "hello=1", "world=2"]
  },
  
  {
    name: "JavaScript Network Functionality",
    language: "javascript",
    code: `const https = require("https");

function fetchData(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let data = "";
            res.on("data", chunk => data += chunk);
            res.on("end", () => {
                try {
                    const parsed = JSON.parse(data);
                    resolve(parsed);
                } catch (e) {
                    resolve(data.slice(0, 200));
                }
            });
        }).on("error", reject);
    });
}

async function testNetwork() {
    try {
        console.log("Testing network request...");
        const result = await fetchData("https://jsonplaceholder.typicode.com/posts/1");
        console.log("Network test successful!");
        console.log("Title:", result.title);
        return true;
    } catch (error) {
        console.log("Network error:", error.message);
        return false;
    }
}

testNetwork();`,
    input: "",
    expectedOutputContains: ["Testing network request...", "Network test successful!", "Title:"]
  },
  
  {
    name: "Python Advanced Features",
    language: "python",
    code: `import json
import math

# Test basic functionality
print("Hello from Python!")

# Test data structures
data = {"numbers": [1, 2, 3, 4, 5], "name": "test"}
print("Data:", json.dumps(data))

# Test math operations
result = [math.sqrt(x) for x in data["numbers"]]
print("Square roots:", [round(x, 2) for x in result])

# Test list comprehensions
even_squares = [x**2 for x in range(10) if x % 2 == 0]
print("Even squares:", even_squares)

print("Processing complete!")`,
    input: "",
    expectedOutputContains: ["Hello from Python!", "Data:", "Square roots:", "Even squares:", "Processing complete!"]
  },
  
  {
    name: "Java Streams and Collections",
    language: "java",
    code: `import java.util.*;
import java.util.stream.*;

public class TestJava {
    public static void main(String[] args) {
        System.out.println("Hello from Java!");
        
        List<Integer> numbers = Arrays.asList(1, 2, 3, 4, 5, 6, 7, 8, 9, 10);
        
        List<Integer> evenSquares = numbers.stream()
            .filter(n -> n % 2 == 0)
            .map(n -> n * n)
            .collect(Collectors.toList());
            
        System.out.println("Even squares: " + evenSquares);
        
        Map<String, Integer> wordCount = new HashMap<>();
        wordCount.put("hello", 1);
        wordCount.put("world", 2);
        
        System.out.println("Map contents:");
        wordCount.forEach((key, value) -> 
            System.out.println(key + "=" + value)
        );
    }
}`,
    input: "",
    expectedOutputContains: ["Hello from Java!", "Even squares:", "Map contents:"]
  },
  
  {
    name: "C Language with Sorting",
    language: "c",
    code: `#include <stdio.h>
#include <stdlib.h>

int main() {
    printf("Hello from C!\\n");
    
    int numbers[] = {5, 2, 8, 1, 9};
    int size = sizeof(numbers) / sizeof(numbers[0]);
    
    printf("Original array: ");
    for(int i = 0; i < size; i++) {
        printf("%d ", numbers[i]);
    }
    printf("\\n");
    
    // Simple bubble sort
    for(int i = 0; i < size - 1; i++) {
        for(int j = 0; j < size - i - 1; j++) {
            if(numbers[j] > numbers[j + 1]) {
                int temp = numbers[j];
                numbers[j] = numbers[j + 1];
                numbers[j + 1] = temp;
            }
        }
    }
    
    printf("Sorted array: ");
    for(int i = 0; i < size; i++) {
        printf("%d ", numbers[i]);
    }
    printf("\\n");
    
    return 0;
}`,
    input: "",
    expectedOutputContains: ["Hello from C!", "Original array:", "Sorted array:", "1 2 5 8 9"]
  },
  
  {
    name: "Python Input Handling",
    language: "python",
    code: `name = input("Enter your name: ")
age = int(input("Enter your age: "))

print(f"Hello {name}!")
print(f"You are {age} years old.")
print(f"Next year you will be {age + 1} years old.")`,
    input: "Alice\n30\n",
    expectedOutputContains: ["Hello Alice!", "You are 30 years old", "Next year you will be 31"]
  }
];

async function runTest(testCase) {
  console.log(`\n🧪 Testing: ${testCase.name}`);
  console.log("=".repeat(50));
  
  try {
    const startTime = Date.now();
    const output = await executeCode(testCase.language, testCase.code, testCase.input);
    const executionTime = Date.now() - startTime;
    
    console.log(`✅ Execution successful (${executionTime}ms)`);
    console.log("Output:", output);
    
    // Check if output contains expected strings
    const allMatched = testCase.expectedOutputContains.every(expected => 
      output.includes(expected)
    );
    
    if (allMatched) {
      console.log("✅ All expected outputs found");
      return { success: true, name: testCase.name, executionTime };
    } else {
      console.log("❌ Some expected outputs missing");
      console.log("Expected:", testCase.expectedOutputContains);
      return { success: false, name: testCase.name, error: "Missing expected outputs" };
    }
    
  } catch (error) {
    console.log(`❌ Execution failed: ${error.message}`);
    return { success: false, name: testCase.name, error: error.message };
  }
}

async function runAllTests() {
  console.log("🚀 Starting Code Runner Validation Tests");
  console.log("=".repeat(60));
  
  const results = [];
  
  for (const testCase of testCases) {
    const result = await runTest(testCase);
    results.push(result);
  }
  
  // Summary
  console.log("\n" + "=".repeat(60));
  console.log("📊 Test Results Summary");
  console.log("=".repeat(60));
  
  const passed = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  
  console.log(`Total Tests: ${results.length}`);
  console.log(`Passed: ${passed} ✅`);
  console.log(`Failed: ${failed} ❌`);
  
  if (passed === results.length) {
    console.log("\n🎉 All tests passed! Code runner is fully functional.");
  } else {
    console.log("\n❌ Some tests failed:");
    results.filter(r => !r.success).forEach(r => {
      console.log(`  - ${r.name}: ${r.error}`);
    });
  }
  
  return results;
}

// Run if called directly
if (process.argv[1].includes('code-runner-validation.js')) {
  runAllTests().catch(console.error);
}

export { runAllTests, testCases };
