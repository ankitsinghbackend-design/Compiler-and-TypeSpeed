import { jest } from "@jest/globals";

// Create mock function for executeCode utility
const mockExecuteCode = jest.fn();

// Mock the executeCode utility using unstable_mockModule
await jest.unstable_mockModule("../utils/executeCode.js", () => ({
  default: mockExecuteCode,
}));

// Import the controller after mocking
const { runCode } = await import("./codeRunnerController.js");

describe("Code Runner Controller", () => {
  let req, res, consoleErrorSpy;

  beforeEach(() => {
    jest.clearAllMocks();
    req = { body: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  describe("runCode", () => {
    test("should execute Python code successfully", async () => {
      req.body = {
        language: "python",
        code: "print('Hello World')",
        input: "",
      };

      const mockOutput = "Hello World\n";
      mockExecuteCode.mockResolvedValue(mockOutput);

      await runCode(req, res);

      expect(mockExecuteCode).toHaveBeenCalledWith(
        "python",
        "print('Hello World')",
        "",
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        output: mockOutput,
      });
    });

    test("should execute JavaScript code successfully", async () => {
      req.body = {
        language: "javascript",
        code: "console.log('Hello JS');",
        input: "",
      };

      const mockOutput = "Hello JS\n";
      mockExecuteCode.mockResolvedValue(mockOutput);

      await runCode(req, res);

      expect(mockExecuteCode).toHaveBeenCalledWith(
        "javascript",
        "console.log('Hello JS');",
        "",
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        output: mockOutput,
      });
    });

    test("should handle code execution with input", async () => {
      req.body = {
        language: "python",
        code: "name = input()\nprint(f'Hello {name}')",
        input: "Alice",
      };

      const mockOutput = "Hello Alice\n";
      mockExecuteCode.mockResolvedValue(mockOutput);

      await runCode(req, res);

      expect(mockExecuteCode).toHaveBeenCalledWith(
        "python",
        "name = input()\nprint(f'Hello {name}')",
        "Alice",
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        output: mockOutput,
      });
    });

    test("should return 400 when language is missing", async () => {
      req.body = {
        code: "print('Hello')",
        input: "",
      };

      await runCode(req, res);

      expect(mockExecuteCode).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Language and code are required",
      });
    });

    test("should return 400 when code is missing", async () => {
      req.body = {
        language: "python",
        input: "",
      };

      await runCode(req, res);

      expect(mockExecuteCode).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Language and code are required",
      });
    });

    test("should return 400 when both language and code are missing", async () => {
      req.body = {
        input: "",
      };

      await runCode(req, res);

      expect(mockExecuteCode).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Language and code are required",
      });
    });

    test("should return 400 when language is empty string", async () => {
      req.body = {
        language: "",
        code: "print('Hello')",
        input: "",
      };

      await runCode(req, res);

      expect(mockExecuteCode).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Language and code are required",
      });
    });

    test("should return 400 when code is empty string", async () => {
      req.body = {
        language: "python",
        code: "",
        input: "",
      };

      await runCode(req, res);

      expect(mockExecuteCode).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Language and code are required",
      });
    });

    test("should handle execution errors gracefully", async () => {
      req.body = {
        language: "python",
        code: "print('Hello')",
        input: "",
      };

      const mockError = new Error("Execution failed");
      mockExecuteCode.mockRejectedValue(mockError);

      await runCode(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Execution failed",
        error: "Execution failed",
      });

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Error while executing code:",
        mockError,
      );
    });

    test("should handle timeout errors", async () => {
      req.body = {
        language: "python",
        code: "import time; time.sleep(10)",
        input: "",
      };

      const mockError = new Error("Process timed out");
      mockExecuteCode.mockRejectedValue(mockError);

      await runCode(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Process timed out",
        error: "Process timed out",
      });

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Error while executing code:",
        mockError,
      );
    });

    test("should handle syntax errors in code", async () => {
      req.body = {
        language: "python",
        code: "print('Hello'",
        input: "",
      };

      const mockError = new Error("SyntaxError: unexpected EOF while parsing");
      mockExecuteCode.mockRejectedValue(mockError);

      await runCode(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "SyntaxError: unexpected EOF while parsing",
        error: "SyntaxError: unexpected EOF while parsing",
      });

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Error while executing code:",
        mockError,
      );
    });

    test("should handle unsupported language gracefully", async () => {
      req.body = {
        language: "unsupported",
        code: "some code",
        input: "",
      };

      const mockError = new Error("Unsupported language: unsupported");
      mockExecuteCode.mockRejectedValue(mockError);

      await runCode(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Unsupported language: unsupported",
        error: "Unsupported language: unsupported",
      });

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Error while executing code:",
        mockError,
      );
    });

    test("should handle missing input parameter gracefully", async () => {
      req.body = {
        language: "python",
        code: "print('Hello World')",
        // input is missing
      };

      const mockOutput = "Hello World\n";
      mockExecuteCode.mockResolvedValue(mockOutput);

      await runCode(req, res);

      expect(mockExecuteCode).toHaveBeenCalledWith(
        "python",
        "print('Hello World')",
        "",
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        output: mockOutput,
      });
    });

    test("should handle code that produces no output", async () => {
      req.body = {
        language: "python",
        code: "x = 5; y = 10; z = x + y",
        input: "",
      };

      const mockOutput = "";
      mockExecuteCode.mockResolvedValue(mockOutput);

      await runCode(req, res);

      expect(mockExecuteCode).toHaveBeenCalledWith(
        "python",
        "x = 5; y = 10; z = x + y",
        "",
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        output: mockOutput,
      });
    });

    test("should handle code with special characters", async () => {
      req.body = {
        language: "python",
        code: "print('Special chars: !@#$%^&*()_+{}|:<>?[];,./`~')",
        input: "",
      };

      const mockOutput = "Special chars: !@#$%^&*()_+{}|:<>?[];,./`~\n";
      mockExecuteCode.mockResolvedValue(mockOutput);

      await runCode(req, res);

      expect(mockExecuteCode).toHaveBeenCalledWith(
        "python",
        "print('Special chars: !@#$%^&*()_+{}|:<>?[];,./`~')",
        "",
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        output: mockOutput,
      });
    });

    test("should execute C++ code successfully", async () => {
      const cppCode =
        '#include <iostream>\nint main() { std::cout << "Hello C++" << std::endl; return 0; }';
      req.body = {
        language: "cpp",
        code: cppCode,
        input: "",
      };

      const mockOutput = "Hello C++\n";
      mockExecuteCode.mockResolvedValue(mockOutput);

      await runCode(req, res);

      expect(mockExecuteCode).toHaveBeenCalledWith("cpp", cppCode, "");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        output: mockOutput,
      });
    });

    test("should execute Java code successfully", async () => {
      const javaCode =
        'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello Java");\n    }\n}';
      req.body = {
        language: "java",
        code: javaCode,
        input: "",
      };

      const mockOutput = "Hello Java\n";
      mockExecuteCode.mockResolvedValue(mockOutput);

      await runCode(req, res);

      expect(mockExecuteCode).toHaveBeenCalledWith("java", javaCode, "");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        output: mockOutput,
      });
    });
  });
});
