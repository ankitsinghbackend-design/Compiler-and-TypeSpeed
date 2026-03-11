// filepath: /Users/ashutoshkumar/MyWork/PROJECTS/labBuddy/labbuddy-backend/utils/executeCode.js
import { exec } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TEMP_DIR = path.join(__dirname, "../temp");

// Check if we're in a deployment environment (like Render.com)
const isDeploymentEnv = process.env.NODE_ENV === 'production' || 
                        process.env.RENDER || 
                        process.cwd().includes('/opt/render/');

// Execution timeout in milliseconds (extend for deployment environments)
const EXECUTION_TIMEOUT = isDeploymentEnv ? 45000 : 30000;

// Memory limit for processes (adjust for deployment)
const MEMORY_LIMIT = isDeploymentEnv ? 192 * 1024 * 1024 : 256 * 1024 * 1024;

// Ensure temp directory exists
if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR, { recursive: true });
}

const executeCode = async (language, code, input = "") => {
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
          
          // Check if we're in a Render.com environment (or other cloud deployment)
          const isRenderEnvironment = process.env.RENDER || process.env.RENDER_EXTERNAL_URL || 
                                     process.cwd().includes('/opt/render/');
          
          if (isRenderEnvironment) {
            // For Render environment, we'll use an alternative approach since Java is not installed
            // Return a special message that we'll handle later
            return `echo "JAVA_NOT_AVAILABLE_IN_ENVIRONMENT"`;
          } else {
            // Local development environment where Java is installed
            const javacPath = process.env.JAVA_HOME ? `${process.env.JAVA_HOME}/bin/javac` : 'javac';
            const javaPath = process.env.JAVA_HOME ? `${process.env.JAVA_HOME}/bin/java` : 'java';
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
          
          // Check if we're in a deployment environment
          const isProductionEnv = process.env.NODE_ENV === 'production' || 
                                 process.env.RENDER || 
                                 process.cwd().includes('/opt/render/');
          
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
        const fetchWaitTime = isDeploymentEnv ? 5000 : 2000;
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
        const controller = new AbortController();
        const signal = controller.signal;
        const timeoutId = setTimeout(() => controller.abort(), ${fetchWaitTime - 500});
        
        const fetchPromise = originalFetch(args[0], { 
          ...(args[1] || {}), 
          signal,
        });
        
        return fetchPromise.finally(() => clearTimeout(timeoutId));
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
            // Check for special marker from our Java command
            if (stdout && stdout.includes("JAVA_NOT_AVAILABLE_IN_ENVIRONMENT")) {
              return reject(new Error("Java is not available in this deployment environment. Try using Python, JavaScript, C, or C++ instead."));
            }
            
            // Regular Java error
            if (error && (error.message.includes('javac') || error.message.includes('java'))) {
              return reject(new Error("Java compiler or runtime not found. Please ensure Java is properly installed and accessible."));
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
