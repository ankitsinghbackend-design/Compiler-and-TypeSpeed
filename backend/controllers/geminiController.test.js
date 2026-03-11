import { jest } from "@jest/globals";

// Create mock functions for utility modules
const mockGenerateComplexity = jest.fn();
const mockGenerateSuggestion = jest.fn();
const mockGenerateTestCases = jest.fn();

// Mock utility modules using unstable_mockModule
await jest.unstable_mockModule("../utils/complexity.cjs", () => ({
  generateComplexity: mockGenerateComplexity,
}));

await jest.unstable_mockModule("../utils/suggestion.cjs", () => ({
  generateSuggestion: mockGenerateSuggestion,
}));

await jest.unstable_mockModule("../utils/testCases.cjs", () => ({
  generateTestCases: mockGenerateTestCases,
}));

// Import the controller after mocking
const { giveSuggestion, giveComplexity, giveTestCases } = await import(
  "./geminiController.js"
);

describe("Gemini Controller", () => {
  let req, res, consoleLogSpy;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Setup request and response objects
    req = {
      body: {},
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    // Mock console.log to avoid test output pollution
    consoleLogSpy = jest.spyOn(console, "log").mockImplementation();
  });

  afterEach(() => {
    // Restore console.log
    consoleLogSpy.mockRestore();
  });

  describe("giveSuggestion", () => {
    test("should generate code suggestions successfully", async () => {
      req.body.code = "function add(a, b) { return a + b; }";

      const mockSuggestionResponse = {
        suggestions: [
          "Add type annotations for better type safety",
          "Consider adding input validation",
          "Add JSDoc comments for documentation",
        ],
        complexity: "Low",
        performance: "Good",
      };

      mockGenerateSuggestion.mockResolvedValue(mockSuggestionResponse);

      await giveSuggestion(req, res);

      expect(mockGenerateSuggestion).toHaveBeenCalledWith(
        "function add(a, b) { return a + b; }",
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(mockSuggestionResponse);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: "succesfully generated suggestions for the given code",
        response: mockSuggestionResponse,
      });
    });

    test("should return 404 when code is missing", async () => {
      req.body = {}; // No code provided

      await giveSuggestion(req, res);

      expect(mockGenerateSuggestion).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: "Code is required",
      });
    });

    test("should return 404 when code is empty string", async () => {
      req.body.code = "";

      await giveSuggestion(req, res);

      expect(mockGenerateSuggestion).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: "Code is required",
      });
    });

    test("should handle AI service errors gracefully", async () => {
      req.body.code = "console.log('test');";

      mockGenerateSuggestion.mockRejectedValue(
        new Error("AI service unavailable"),
      );

      await giveSuggestion(req, res);

      expect(mockGenerateSuggestion).toHaveBeenCalledWith(
        "console.log('test');",
      );
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Error generating suggestion",
        error: "AI service unavailable",
      });
    });

    test("should handle complex code input", async () => {
      const complexCode = `
        class Calculator {
          constructor() {
            this.history = [];
          }
          
          add(a, b) {
            const result = a + b;
            this.history.push(\`\${a} + \${b} = \${result}\`);
            return result;
          }
        }
      `;
      req.body.code = complexCode;

      const mockResponse = {
        suggestions: ["Consider using TypeScript", "Add error handling"],
        readability: "Good",
        maintainability: "High",
      };

      mockGenerateSuggestion.mockResolvedValue(mockResponse);

      await giveSuggestion(req, res);

      expect(mockGenerateSuggestion).toHaveBeenCalledWith(complexCode);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: "succesfully generated suggestions for the given code",
        response: mockResponse,
      });
    });

    test("should handle API timeout errors", async () => {
      req.body.code = "function test() {}";

      mockGenerateSuggestion.mockRejectedValue(new Error("Request timeout"));

      await giveSuggestion(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Error generating suggestion",
        error: "Request timeout",
      });
    });
  });

  describe("giveComplexity", () => {
    test("should analyze code complexity successfully", async () => {
      req.body.code =
        "for(let i = 0; i < n; i++) { for(let j = 0; j < m; j++) { console.log(i, j); } }";

      const mockComplexityResponse = {
        timeComplexity: "O(n*m)",
        spaceComplexity: "O(1)",
        cyclomaticComplexity: 3,
        description: "Nested loops with quadratic time complexity",
      };

      mockGenerateComplexity.mockResolvedValue(mockComplexityResponse);

      await giveComplexity(req, res);

      expect(mockGenerateComplexity).toHaveBeenCalledWith(
        "for(let i = 0; i < n; i++) { for(let j = 0; j < m; j++) { console.log(i, j); } }",
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(mockComplexityResponse);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: "succesfully generated complexity for the given code",
        response: mockComplexityResponse,
      });
    });

    test("should return 404 when code is missing", async () => {
      req.body = {};

      await giveComplexity(req, res);

      expect(mockGenerateComplexity).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: "Code is required",
      });
    });

    test("should return 404 when code is null", async () => {
      req.body.code = null;

      await giveComplexity(req, res);

      expect(mockGenerateComplexity).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: "Code is required",
      });
    });

    test("should handle complexity analysis errors", async () => {
      req.body.code =
        "function recursive(n) { return n > 0 ? recursive(n-1) : 0; }";

      mockGenerateComplexity.mockRejectedValue(new Error("Analysis failed"));

      await giveComplexity(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Error generating complexity",
        error: "Analysis failed",
      });
    });

    test("should analyze simple linear code", async () => {
      req.body.code = "for(let i = 0; i < n; i++) { console.log(i); }";

      const mockResponse = {
        timeComplexity: "O(n)",
        spaceComplexity: "O(1)",
        cyclomaticComplexity: 2,
      };

      mockGenerateComplexity.mockResolvedValue(mockResponse);

      await giveComplexity(req, res);

      expect(mockGenerateComplexity).toHaveBeenCalledWith(
        "for(let i = 0; i < n; i++) { console.log(i); }",
      );
      expect(res.status).toHaveBeenCalledWith(201);
    });

    test("should handle AI service rate limiting", async () => {
      req.body.code = "function test() { return 'hello'; }";

      mockGenerateComplexity.mockRejectedValue(
        new Error("Rate limit exceeded"),
      );

      await giveComplexity(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Error generating complexity",
        error: "Rate limit exceeded",
      });
    });
  });

  describe("giveTestCases", () => {
    test("should generate test cases successfully", async () => {
      req.body.code = "function multiply(a, b) { return a * b; }";

      const mockTestCasesResponse = {
        testCases: [
          { input: [2, 3], expected: 6, description: "Basic multiplication" },
          { input: [0, 5], expected: 0, description: "Multiplication by zero" },
          {
            input: [-2, 3],
            expected: -6,
            description: "Negative number multiplication",
          },
          {
            input: [0.5, 4],
            expected: 2,
            description: "Decimal multiplication",
          },
        ],
        coverage: "95%",
        edgeCases: ["zero", "negative", "decimal"],
      };

      mockGenerateTestCases.mockResolvedValue(mockTestCasesResponse);

      await giveTestCases(req, res);

      expect(mockGenerateTestCases).toHaveBeenCalledWith(
        "function multiply(a, b) { return a * b; }",
      );
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: "succesfully generated complexity for the given code",
        response: mockTestCasesResponse,
      });
    });

    test("should return 404 when code is missing", async () => {
      req.body = {};

      await giveTestCases(req, res);

      expect(mockGenerateTestCases).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: "Code is required",
      });
    });

    test("should return 404 when code is undefined", async () => {
      req.body.code = undefined;

      await giveTestCases(req, res);

      expect(mockGenerateTestCases).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: "Code is required",
      });
    });

    test("should handle test case generation errors", async () => {
      req.body.code = "function divide(a, b) { return a / b; }";

      mockGenerateTestCases.mockRejectedValue(
        new Error("Test generation failed"),
      );

      await giveTestCases(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Error generating complexity",
        error: "Test generation failed",
      });
    });

    test("should generate test cases for complex functions", async () => {
      const complexFunction = `
        function fibonacci(n) {
          if (n <= 1) return n;
          return fibonacci(n - 1) + fibonacci(n - 2);
        }
      `;
      req.body.code = complexFunction;

      const mockResponse = {
        testCases: [
          { input: [0], expected: 0, description: "Base case: n = 0" },
          { input: [1], expected: 1, description: "Base case: n = 1" },
          { input: [5], expected: 5, description: "Recursive case" },
          { input: [-1], expected: -1, description: "Negative input" },
        ],
      };

      mockGenerateTestCases.mockResolvedValue(mockResponse);

      await giveTestCases(req, res);

      expect(mockGenerateTestCases).toHaveBeenCalledWith(complexFunction);
      expect(res.status).toHaveBeenCalledWith(201);
    });

    test("should handle AI service authentication errors", async () => {
      req.body.code = "function add(x, y) { return x + y; }";

      mockGenerateTestCases.mockRejectedValue(
        new Error("Authentication failed"),
      );

      await giveTestCases(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Error generating complexity",
        error: "Authentication failed",
      });
    });

    test("should handle empty test case responses", async () => {
      req.body.code = "function empty() {}";

      mockGenerateTestCases.mockResolvedValue({
        testCases: [],
        message: "No meaningful test cases could be generated",
      });

      await giveTestCases(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: "succesfully generated complexity for the given code",
        response: {
          testCases: [],
          message: "No meaningful test cases could be generated",
        },
      });
    });
  });

  describe("Error Handling Integration", () => {
    test("should handle network errors consistently across all functions", async () => {
      const networkError = new Error("Network error");
      req.body.code = "test code";

      // Test all three functions with network error
      mockGenerateSuggestion.mockRejectedValue(networkError);
      mockGenerateComplexity.mockRejectedValue(networkError);
      mockGenerateTestCases.mockRejectedValue(networkError);

      await giveSuggestion(req, res);
      expect(res.status).toHaveBeenCalledWith(500);

      await giveComplexity(req, res);
      expect(res.status).toHaveBeenCalledWith(500);

      await giveTestCases(req, res);
      expect(res.status).toHaveBeenCalledWith(500);
    });

    test("should handle malformed code inputs gracefully", async () => {
      req.body.code = "invalid syntax {{{";

      mockGenerateSuggestion.mockRejectedValue(new Error("Parse error"));
      mockGenerateComplexity.mockRejectedValue(new Error("Parse error"));
      mockGenerateTestCases.mockRejectedValue(new Error("Parse error"));

      await giveSuggestion(req, res);
      expect(res.json).toHaveBeenCalledWith({
        message: "Error generating suggestion",
        error: "Parse error",
      });

      await giveComplexity(req, res);
      expect(res.json).toHaveBeenCalledWith({
        message: "Error generating complexity",
        error: "Parse error",
      });

      await giveTestCases(req, res);
      expect(res.json).toHaveBeenCalledWith({
        message: "Error generating complexity",
        error: "Parse error",
      });
    });
  });
});
