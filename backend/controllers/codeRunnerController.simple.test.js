import { jest } from "@jest/globals";

// Create mock function for executeCode utility
const mockExecuteCode = jest.fn();

// Mock the executeCode utility using unstable_mockModule
await jest.unstable_mockModule("../utils/executeCode.js", () => ({
  default: mockExecuteCode,
}));

// Import the controller after mocking
const { runCode } = await import("./codeRunnerController.js");

describe("Code Runner Controller - Simple", () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();
    req = { body: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

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
});
