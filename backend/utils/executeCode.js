// filepath: /Users/ashutoshkumar/MyWork/PROJECTS/labBuddy/labbuddy-backend/utils/executeCode.js
import { exec } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import axios from "axios";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TEMP_DIR = path.join(__dirname, "../temp");

// External API configuration for code execution
// We'll use the Judge0 API (or similar) for remote code execution
const EXTERNAL_API_ENABLED = process.env.USE_EXTERNAL_API === 'true' || false;
const EXTERNAL_API_URL = process.env.EXTERNAL_API_URL || 'https://api.judge0.com/submissions';
const EXTERNAL_API_KEY = process.env.EXTERNAL_API_KEY;

// Check if we're in a deployment environment (like Render.com)
const isDeploymentEnv = process.env.NODE_ENV === 'production' || 
                        process.env.RENDER || 
                        process.cwd().includes('/opt/render/');

// Execution timeout in milliseconds (extend for deployment environments)
const EXECUTION_TIMEOUT = isDeploymentEnv ? 45000 : 30000;

// Memory limit for processes (adjust for deployment)
const MEMORY_LIMIT = isDeploymentEnv ? 192 * 1024 * 1024 : 256 * 1024 * 1024;

// External API configuration for Java execution
const RAPID_API_HOST = process.env.RAPID_API_HOST || 'judge0-ce.p.rapidapi.com';
const RAPID_API_KEY = process.env.RAPID_API_KEY;
// Always use external API in deployment, and optionally in development
const USE_EXTERNAL_API = process.env.USE_EXTERNAL_API === 'true' || isDeploymentEnv;

// Debug mode for API calls
const DEBUG_API = process.env.DEBUG_API === 'true' || isDeploymentEnv;

// Check for Render-specific environment settings
if (isDeploymentEnv) {
  console.log("Detected deployment environment (likely Render.com)");
  console.log("Environment variables check:");
  console.log("- RAPID_API_HOST:", RAPID_API_HOST ? "✓" : "✗");
  console.log("- RAPID_API_KEY:", RAPID_API_KEY ? "✓ (Exists)" : "✗ (Missing)");
  
  if (RAPID_API_KEY) {
    // Log first and last few characters for debugging
    console.log("- API Key format check:", 
      `${RAPID_API_KEY.substring(0, 5)}...${RAPID_API_KEY.substring(RAPID_API_KEY.length - 5)}`);
  }
}

// Ensure temp directory exists
if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR, { recursive: true });
}

// Function to execute Java code using an external API
async function executeJavaWithExternalAPI(code, input = "") {
  console.log("Executing Java code with external API...");
  
  // Debug API configuration
  if (DEBUG_API) {
    console.log("API Debug Mode ON");
    console.log("API Host:", RAPID_API_HOST);
    console.log("API Key:", RAPID_API_KEY ? `${RAPID_API_KEY.substring(0, 5)}...${RAPID_API_KEY.substring(RAPID_API_KEY.length - 5)}` : "No key");
    console.log("Environment:", process.env.NODE_ENV || "development");
    console.log("Render env:", process.env.RENDER ? "Yes" : "No");
    console.log("Working directory:", process.cwd());
    // Print all environment variables that might be relevant
    console.log("Environment variables:");
    for (const key in process.env) {
      if (key.includes('API') || key.includes('RAPID') || key.includes('RENDER') || key.includes('NODE')) {
        console.log(`- ${key}: ${key.includes('KEY') ? '[HIDDEN]' : process.env[key]}`);
      }
    }
  }
  
  if (!RAPID_API_KEY) {
    throw new Error("RAPID_API_KEY is not configured. Please set it in your environment variables to use Java in deployment.");
  }
  
  if (!RAPID_API_HOST) {
    throw new Error("RAPID_API_HOST is not configured. Using default 'judge0-ce.p.rapidapi.com'");
  }
  
  try {
    // Prepare the code - Judge0 expects Main class for Java
    let processedCode = code;
    // If code doesn't contain "public class Main", rename the class to Main
    if (!code.includes("public class Main")) {
      // Extract the current class name
      const classMatch = code.match(/public\s+class\s+(\w+)/);
      if (classMatch && classMatch[1]) {
        const className = classMatch[1];
        // Replace all occurrences of the class name with "Main"
        processedCode = code.replace(new RegExp(`public\\s+class\\s+${className}`, 'g'), 'public class Main');
      }
    }
    
    // First, create a submission
    const submissionUrl = `https://${RAPID_API_HOST}/submissions`;
    console.log(`Sending request to: ${submissionUrl}`);
    
    const options = {
      method: 'POST',
      url: submissionUrl,
      headers: {
        'content-type': 'application/json',
        'X-RapidAPI-Key': RAPID_API_KEY,
        'X-RapidAPI-Host': RAPID_API_HOST,
        // Add User-Agent header which might help with some API gateways
        'User-Agent': 'LabBuddy-Backend/1.0'
      },
      data: {
        language_id: 62, // Java (OpenJDK 13.0.1)
        source_code: processedCode,
        stdin: input
      },
      // Add timeout for the request
      timeout: 30000 // 30 seconds
    };
    
    if (DEBUG_API) {
      console.log("Request configuration:");
      console.log("- URL:", options.url);
      console.log("- Headers:", JSON.stringify({
        ...options.headers,
        'X-RapidAPI-Key': '[HIDDEN]'
      }));
      console.log("- Data:", JSON.stringify({
        ...options.data,
        source_code: options.data.source_code.length > 100 ? 
          options.data.source_code.substring(0, 100) + '...' : 
          options.data.source_code
      }));
    }
    
    console.log("Sending request to external API...");
    
    const response = await axios.request(options);
    console.log("API Response status:", response.status);
    
    if (response.data && response.data.token) {
      const token = response.data.token;
      console.log("Submission created, token:", token);
      
      // Now get the result using the batch endpoint, which is more reliable
      const batchUrl = `https://${RAPID_API_HOST}/submissions/batch?tokens=${token}`;
      console.log(`Polling for results at: ${batchUrl}`);
      
      const batchOptions = {
        method: 'GET',
        url: batchUrl,
        headers: {
          'X-RapidAPI-Key': RAPID_API_KEY,
          'X-RapidAPI-Host': RAPID_API_HOST,
          'User-Agent': 'LabBuddy-Backend/1.0'
        },
        // Add timeout for the request
        timeout: 10000 // 10 seconds per poll request
      };
      
      // Poll for results
      let result;
      let attempts = 0;
      const maxAttempts = 15;
      const pollInterval = 3000; // 3 seconds
      
      while (attempts < maxAttempts) {
        attempts++;
        console.log(`Polling attempt ${attempts}/${maxAttempts}...`);
        
        // Wait between polls
        await new Promise(resolve => setTimeout(resolve, pollInterval));
        
        const batchResponse = await axios.request(batchOptions);
        console.log("Batch response status:", batchResponse.status);
        
        if (batchResponse.data && batchResponse.data.submissions && batchResponse.data.submissions.length > 0) {
          const submission = batchResponse.data.submissions[0];
          
          // Check if execution is complete
          if (submission.status && submission.status.id > 2) {
            result = submission;
            console.log("Execution completed with status:", submission.status.description);
            break;
          } else {
            console.log(`Execution in progress, status: ${submission.status?.description || 'unknown'}`);
          }
        } else {
          console.log("No submissions found in batch response");
        }
      }
      
      if (!result) {
        throw new Error("Timed out waiting for code execution results");
      }
      
      // Handle different execution outcomes
      if (result.status.id === 3) { // Accepted / Success
        return result.stdout || "Program executed successfully with no output";
      } else if (result.status.id === 6) { // Compilation Error
        throw new Error(`Compilation Error: ${result.compile_output || "Unknown compilation error"}`);
      } else if (result.status.id >= 7 && result.status.id <= 12) { // Runtime errors
        throw new Error(`Runtime Error: ${result.stderr || "Unknown runtime error"}`);
      } else if (result.status.id === 13) { // Internal Error
        throw new Error(`Judge0 API Internal Error. Please try again later.`);
      } else {
        throw new Error(`Execution failed with status: ${result.status.description}`);
      }
    } else {
      console.error("Invalid API response:", response.data);
      throw new Error("Failed to create code execution submission - invalid API response");
    }
  } catch (error) {
    console.error("External API execution error:", error.message);
    
    // Specific error handling for axios errors
    if (error.response) {
      const status = error.response.status;
      console.error(`API returned status code ${status}`);
      
      // Log headers and request details for debugging
      console.error("Request URL:", error.config.url);
      console.error("Request Method:", error.config.method);
      console.error("Request Headers:", JSON.stringify({
        ...error.config.headers,
        'X-RapidAPI-Key': '[HIDDEN]'  // Hide the key in logs
      }));
      
      // Log response data for troubleshooting
      console.error("Response data:", JSON.stringify(error.response.data));
      
      if (status === 401 || status === 403) {
        console.error("Authentication error details:", error.response.data);
        // Enhanced error message with troubleshooting steps
        throw new Error(`Authentication failed (${status}). Please verify:
        1. Your RapidAPI key is correct
        2. You've subscribed to the Judge0 API on RapidAPI
        3. Your subscription is active
        4. The environment variables are correctly set in Render.com dashboard`);
      }
      
      if (status === 429) {
        throw new Error("API rate limit exceeded. Please try again later or upgrade your RapidAPI subscription.");
      }
      
      throw new Error(`API error: ${status} ${error.response.statusText || ''} - ${JSON.stringify(error.response.data || {})}`);
    } else if (error.request) {
      // The request was made but no response was received
      console.error("No response received. Network issue or timeout.");
      throw new Error(`Network error: No response from Judge0 API. This could be due to network restrictions in the Render.com environment.`);
    }
    
    throw new Error(`Java execution failed: ${error.message}`);
  }
}

const executeCode = async (language, code, input = "") => {
  // Special case for Java in deployment environments with external API enabled
  if (language === 'java' && USE_EXTERNAL_API) {
    try {
      console.log("Using external API for Java execution...");
      
      // Add more debugging for deployment troubleshooting
      console.log("API Configuration:");
      console.log("- API Host:", RAPID_API_HOST);
      console.log("- API Key Length:", RAPID_API_KEY ? RAPID_API_KEY.length : 0);
      console.log("- Environment:", isDeploymentEnv ? "Production/Render" : "Development");
      
      return await executeJavaWithExternalAPI(code, input);
    } catch (apiError) {
      if (apiError.message.includes('RAPID_API_KEY is not configured')) {
        console.error("External Java API configuration missing:", apiError.message);
        throw new Error("Java execution failed: API key is missing. Please configure RAPID_API_KEY in your environment variables.");
      } else if (apiError.message.includes('403') || apiError.message.includes('401')) {
        console.error("External Java API authentication error:", apiError.message);
        throw new Error("Java execution failed: API authentication error. Please check your API key and subscription status.");
      } else if (apiError.message.includes('429')) {
        console.error("External Java API rate limit exceeded:", apiError.message);
        throw new Error("Java execution failed: API rate limit exceeded. Please try again later.");
      } else {
        console.error("External Java API execution error:", apiError.message);
        throw new Error(`Java execution failed: ${apiError.message}`);
      }
    }
  }

  return new Promise((resolve, reject) => {
    console.log("Initializing code execution for:", language);

    const fileMap = {
      python: {
        extension: ".py",
        command: (filePath, inputFilePath) =>
          `python ${filePath} < ${inputFilePath}`,
      },
      javascript: {
        extension: ".cjs", // Use .cjs extension to avoid ES module issues
        command: (filePath) => {
          return `node ${filePath}`;
        },
      },
      java: {
        extension: ".java",
        command: (filePath, inputFilePath, className) => {
          const dirPath = path.dirname(filePath);
          
          // Environment detection with extended checks
          const isRenderEnvironment = process.env.RENDER || 
                                     process.env.RENDER_EXTERNAL_URL || 
                                     process.cwd().includes('/opt/render/');
          
          if (isRenderEnvironment) {
            // For Render environment, we'll use the external API approach
            // Just return a special marker that we'll handle in the execution flow
            return `echo "USE_EXTERNAL_API_FOR_JAVA"`;
          } else {
            // Local development environment where Java is installed
            // Use full absolute paths for reliability
            const javaPath = '/usr/bin/java';
            const javacPath = '/usr/bin/javac';
            
            // Use the full paths to ensure it works in all environments
            return `cd ${dirPath} && ${javacPath} ${className}.java && ${javaPath} ${className} < ${inputFilePath}`;
          }
        },
      },
      cpp: {
        extension: ".cpp",
        command: (filePath, inputFilePath) => {
          const outputFile = path.join(
            path.dirname(filePath),
            path.basename(filePath, ".cpp"),
          );
          
          // ABSOLUTE MINIMAL flags for C++ compilation
          // -w disables all warnings (major speed boost)
          // No other flags are needed for basic compilation
          return `g++ -w ${filePath} -o ${outputFile} && ${outputFile} < ${inputFilePath}`;
        },
      },
      c: {
        extension: ".c",
        command: (filePath, inputFilePath) => {
          const outputFile = path.join(
            path.dirname(filePath),
            path.basename(filePath, ".c"),
          );
          
          // ABSOLUTE MINIMAL flags for C compilation
          // -w disables all warnings (major speed boost)
          return `gcc -w ${filePath} -o ${outputFile} && ${outputFile} < ${inputFilePath}`;
        },
      },
      go: {
        extension: ".go",
        command: (filePath, inputFilePath) => {
          return `go run ${filePath} < ${inputFilePath}`;
        },
      },
      rust: {
        extension: ".rs",
        command: (filePath, inputFilePath) => {
          const outputFile = path.join(
            path.dirname(filePath),
            path.basename(filePath, ".rs"),
          );
          return `rustc ${filePath} -o ${outputFile} && ${outputFile} < ${inputFilePath}`;
        },
      },
      typescript: {
        extension: ".ts",
        command: (filePath, inputFilePath) => {
          return `npx ts-node ${filePath} < ${inputFilePath}`;
        },
      },
      php: {
        extension: ".php",
        command: (filePath, inputFilePath) => {
          return `php ${filePath} < ${inputFilePath}`;
        },
      },
      ruby: {
        extension: ".rb",
        command: (filePath, inputFilePath) => {
          return `ruby ${filePath} < ${inputFilePath}`;
        },
      },
      kotlin: {
        extension: ".kt",
        command: (filePath, inputFilePath) => {
          const outputFile = path.join(
            path.dirname(filePath),
            path.basename(filePath, ".kt") + ".jar",
          );
          return `kotlinc ${filePath} -include-runtime -d ${outputFile} && java -jar ${outputFile} < ${inputFilePath}`;
        },
      },
      swift: {
        extension: ".swift",
        command: (filePath, inputFilePath) => {
          return `swift ${filePath} < ${inputFilePath}`;
        },
      },
      csharp: {
        extension: ".cs",
        command: (filePath, inputFilePath) => {
          const outputFile = path.join(
            path.dirname(filePath),
            path.basename(filePath, ".cs") + ".exe",
          );
          return `mcs ${filePath} -out:${outputFile} && mono ${outputFile} < ${inputFilePath}`;
        },
      },
      sql: {
        extension: ".sql",
        command: (filePath) => {
          return `sqlite3 < ${filePath}`;
        },
      },
    };

    const fileConfig = fileMap[language];
    if (!fileConfig) {
      return reject(new Error(`Unsupported language: ${language}`));
    }

    const tempFileName = Date.now();
    const inputFileName = `input-${tempFileName}.txt`;
    const inputFilePath = path.join(TEMP_DIR, inputFileName);

    // Handle Java class name specially
    let className = null;
    let codeFilePath;

    if (language === "java") {
      const match = code.match(/public\s+class\s+(\w+)/);
      if (!match) {
        return reject(new Error("Java code must contain a public class"));
      }
      className = match[1];
      codeFilePath = path.join(TEMP_DIR, `${className}.java`);
    } else {
      codeFilePath = path.join(
        TEMP_DIR,
        `code-${tempFileName}${fileConfig.extension}`,
      );
    }

    // Cleanup function to ensure files are always deleted
    const cleanupFiles = () => {
      try {
        if (language === "java" && className) {
          const classFile = path.join(TEMP_DIR, `${className}.class`);
          if (fs.existsSync(classFile)) {
            fs.unlinkSync(classFile);
          }
        }
        if (fs.existsSync(codeFilePath)) fs.unlinkSync(codeFilePath);
        if (fs.existsSync(inputFilePath)) fs.unlinkSync(inputFilePath);
        if (["cpp", "c"].includes(language)) {
          const outputFile = path.join(
            TEMP_DIR,
            path.basename(codeFilePath, fileConfig.extension),
          );
          if (fs.existsSync(`${outputFile}.exe`))
            fs.unlinkSync(`${outputFile}.exe`);
          if (fs.existsSync(outputFile)) fs.unlinkSync(outputFile);
        }
      } catch (cleanupError) {
        console.error("Error during cleanup:", cleanupError.message);
      }
    };

    try {
      // For JavaScript, wrap the code to handle async operations properly
      let processedCode = code;
      if (language === 'javascript') {
        // Check if the code contains async operations or top-level await
        const hasAsync = code.includes('await') || code.includes('.then(') || code.includes('Promise') || 
                         code.includes('setTimeout') || code.includes('setInterval') || 
                         code.includes('fetch(') || code.includes('https.') || code.includes('http.');
        
        // Check specifically for fetch API which needs more time
        const hasFetch = code.includes('fetch(');
        
        // Deployment environment detection
        const isDeploymentEnv = process.env.NODE_ENV === 'production' || 
                               process.env.RENDER || 
                               process.cwd().includes('/opt/render/');
        
        // Adjust wait times based on environment and operations
        const normalWaitTime = isDeploymentEnv ? 3000 : 2000;
        const fetchWaitTime = isDeploymentEnv ? 7000 : 3000; // Increased for Render environment
        const finalWaitTime = hasFetch ? fetchWaitTime : normalWaitTime;
        
        if (hasAsync) {
          // Wrap the code to ensure proper async handling with adjusted wait times
          processedCode = `
(async function() {
  try {
    // Configure fetch timeout if fetch is used
    ${hasFetch ? `
    // Override fetch with timeout for better performance
    const originalFetch = globalThis.fetch;
    if (originalFetch) {
      globalThis.fetch = function(...args) {
        // Check if there's already an AbortController in the options
        const hasAbortController = args[1]?.signal instanceof AbortSignal;
        
        // If no AbortController is specified, create one with our timeout
        if (!hasAbortController) {
          const controller = new AbortController();
          const signal = controller.signal;
          // Longer timeout in deployment environment
          const timeout = ${isDeploymentEnv ? 6000 : 2500};
          const timeoutId = setTimeout(() => controller.abort(), timeout);
          
          // Prepare new options with our signal
          const options = args[1] || {};
          args[1] = { ...options, signal };
          
          const fetchPromise = originalFetch(...args);
          return fetchPromise.finally(() => clearTimeout(timeoutId));
        } else {
          // If an AbortController is already provided, use it as is
          return originalFetch(...args);
        }
      };
    }` : ''}

${code.split('\n').map(line => '    ' + line).join('\n')}
    
    // Wait for any pending promises to complete
    await new Promise(resolve => setTimeout(resolve, ${finalWaitTime}));
  } catch (error) {
    console.error('Runtime error:', error.message);
    process.exit(1);
  }
})().then(() => {
  // Give a delay to ensure all fetch results are logged
  setTimeout(() => process.exit(0), ${finalWaitTime});
}).catch((error) => {
  console.error('Async error:', error.message);
  process.exit(1);
});`;
        }
      }
      
      fs.writeFileSync(codeFilePath, processedCode);
      fs.writeFileSync(inputFilePath, input || "");
    } catch (err) {
      // Clean up any files that might have been created before the error
      cleanupFiles();
      return reject(new Error(`Error writing temporary files: ${err.message}`));
    }

    console.log("Executing code in:", language);
    const compileCommand = fileConfig.command(
      codeFilePath,
      inputFilePath,
      className,
    );
    console.log(`Executing command: ${compileCommand}`);

    // Set up execution options with timeout and resource limits
    const execOptions = {
      cwd: TEMP_DIR,
      timeout: EXECUTION_TIMEOUT,
      maxBuffer: 1024 * 1024, // 1MB buffer
      env: {
        ...process.env,
        NODE_OPTIONS: `--max-old-space-size=${MEMORY_LIMIT / (1024 * 1024)}`,
      },
    };

    const child = exec(
      compileCommand,
      execOptions,
      (error, stdout, stderr) => {
        // Always clean up files first, regardless of success or failure
        cleanupFiles();

        // Handle different types of errors
        if (error) {
          console.error("Execution error:", error);
          
          // Handle timeout errors
          if (error.code === 'ETIMEDOUT' || error.killed) {
            return reject(new Error("Code execution timed out. Make sure your code doesn't run indefinitely."));
          }
          
          // Handle Java path issues in deployment environments
          if (language === 'java') {
            // Check for external API marker
            if (stdout && stdout.includes("USE_EXTERNAL_API_FOR_JAVA")) {
              console.log("Detected Java execution request in Render environment, using external API...");
              
              // Use external API for Java execution
              executeJavaWithExternalAPI(code, input)
                .then(result => {
                  resolve(result);
                })
                .catch(apiError => {
                  reject(new Error(apiError.message));
                });
              
              return; // Early return as we're handling this asynchronously
            }
            
            // Check for old special marker from our Java command
            if (stdout && stdout.includes("JAVA_NOT_AVAILABLE_IN_ENVIRONMENT")) {
              return reject(new Error("Java is not available in this deployment environment. The system will now use an external API for Java execution."));
            }
            
            // Enhanced Java error debugging
            if (error) {
              console.error("Java execution error details:");
              console.error("- Error code:", error.code);
              console.error("- Command:", error.cmd);
              console.error("- Stdout:", stdout);
              console.error("- Stderr:", stderr);
              
              // If the error contains any of these phrases, it's a path issue
              const pathErrorPhrases = ['javac: not found', 'java: not found', 'command not found', 'ENOENT'];
              const isPathError = pathErrorPhrases.some(phrase => 
                (stderr && stderr.includes(phrase)) || 
                (error.message && error.message.includes(phrase))
              );
              
              if (isPathError) {
                return reject(new Error("Java is not properly installed or accessible in this environment. Please try using Python, JavaScript, C, or C++ instead."));
              }
              
              // Standard Java compile error
              if (stderr && stderr.includes(".java:")) {
                return reject(new Error(`Java compilation error: ${stderr.trim()}`));
              }
              
              // Generic Java error
              return reject(new Error(`Java execution error: ${stderr || error.message || "Unknown error"}`));
            }
          }
          
          // Handle compilation errors vs runtime errors
          if (error.code && error.code !== 0) {
            const errorMessage = stderr || error.message || "Compilation/Runtime error";
            return reject(new Error(errorMessage));
          }
          
          // If there's an error but we still have output, it might be a warning
          if (!stdout && !stderr) {
            return reject(new Error(error.message || "Unknown execution error"));
          }
        }

        // Handle output - prefer stdout, but include stderr if it contains output
        const output = stdout || stderr || "";
        
        // Check for common runtime errors in output
        if (output.includes("Error:") || output.includes("Exception:")) {
          return reject(new Error(output.trim()));
        }
        
        resolve(
          output.trim() || "Program executed successfully with no output",
        );
      },
    );

    // Handle input for all languages through stdin
    if (input) {
      child.stdin.write(input);
      child.stdin.end();
    }

    // Add error handling for process termination
    child.on('error', (err) => {
      console.error('Child process error:', err);
      cleanupFiles();
      reject(new Error(`Process execution failed: ${err.message}`));
    });

    // Cleanup on process signals (if main process is terminated)
    const processCleanupHandler = () => {
      cleanupFiles();
    };

    process.once('SIGINT', processCleanupHandler);
    process.once('SIGTERM', processCleanupHandler);
    process.once('exit', processCleanupHandler);
  });
};

export default executeCode;
