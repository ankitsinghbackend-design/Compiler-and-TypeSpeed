import { jest } from "@jest/globals";

// Increase the default test timeout
jest.setTimeout(30000);

// Create mock functions and modules
const mockFindOne = jest.fn().mockResolvedValue(null);
const mockCreate = jest.fn();
const mockSign = jest.fn().mockReturnValue("mocked_token");

// Mock modules using Jest ESM mocking
jest.unstable_mockModule("../models/User.js", () => ({
  default: {
    findOne: mockFindOne,
    create: mockCreate,
  },
}));

jest.unstable_mockModule("jsonwebtoken", () => ({
  default: {
    sign: mockSign,
  },
}));

// Import the module under test
let authController;

beforeAll(async () => {
  authController = await import("./authController.js");
});

describe("Auth Controller Basic Tests", () => {
  let req;
  let res;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Setup request and response objects
    req = { body: {}, cookies: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      cookie: jest.fn(),
    };

    // Setup environment variables
    process.env.JWT_SECRET = "test-secret";
    process.env.JWT_EXPIRES_IN = "1h";
  });

  afterEach(() => {
    delete process.env.JWT_SECRET;
    delete process.env.JWT_EXPIRES_IN;
  });

  test("signup should return 400 if required fields are missing", async () => {
    // Missing required fields
    req.body = { name: "Test User" };

    await authController.signup(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Please enter all the fields",
    });
  });

  test("signup should return 400 if passwords do not match", async () => {
    req.body = {
      name: "Test User",
      email: "test@example.com",
      password: "password123",
      confirmPassword: "different-password",
      semester: 1,
      branch: "CSE",
    };

    await authController.signup(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Passwords do not match",
    });
  });

  test("login should return 401 if user not found", async () => {
    req.body = {
      email: "notfound@example.com",
      password: "password123",
    };

    mockFindOne.mockResolvedValue(null);

    await authController.login(req, res);

    expect(mockFindOne).toHaveBeenCalledWith({
      email: "notfound@example.com",
    });
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: "Invalid email or password or user doesnt exist",
    });
  });
});
