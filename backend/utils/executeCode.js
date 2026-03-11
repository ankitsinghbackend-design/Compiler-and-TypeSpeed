import axios from "axios";

// Using the synchronous endpoint from api.onlinecompiler.io
const API_URL = "https://api.onlinecompiler.io/api/run-code-sync/";

const getCompilerId = (language) => {
  const map = {
    python: "python-3.14",
    c: "gcc-15",
    cpp: "g++-15",
    java: "openjdk-25",
    csharp: "dotnet-csharp-9",
    fsharp: "dotnet-fsharp-9",
    php: "php-8.5",
    ruby: "ruby-4.0",
    haskell: "haskell-9.12",
    go: "go-1.26",
    rust: "rust-1.93",
    typescript: "typescript-deno",
    javascript: "typescript-deno", // Deno runs JS as well natively
  };
  return map[language.toLowerCase()] || language;
};

const executeCode = async (language, code, input = "") => {
  const compilerId = getCompilerId(language);
  const apiKey = process.env.COMPILER_API_KEY;

  if (!apiKey) {
    throw new Error("COMPILER_API_KEY is missing in environment configuration.");
  }

  try {
    const response = await axios.post(
      API_URL,
      {
        compiler: compilerId,
        code: code,
        input: input,
      },
      {
        headers: {
          Authorization: apiKey,
          "Content-Type": "application/json",
        },
      }
    );

    const data = response.data;

    if (data.status === "error" || data.exit_code !== 0) {
      if (data.error) {
        throw new Error(data.error);
      } else {
        throw new Error(`Execution failed with exit code ${data.exit_code}`);
      }
    }

    return data.output || "Program executed successfully with no output";
  } catch (error) {
    if (error.response && error.response.data) {
      const errData = error.response.data;
      throw new Error(errData.error || errData.message || "Execution failed on remote server");
    }
    throw new Error(error.message || "Failed to execute code on remote server");
  }
};

export default executeCode;
