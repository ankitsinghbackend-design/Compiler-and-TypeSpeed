import { jest } from "@jest/globals";

// Create mock functions
const mockFindOne = jest.fn();
const mockCreate = jest.fn();
const mockSign = jest.fn(() => "test-token");
const mockMatchPassword = jest.fn();

// Mock modules before importing them
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

// Import the module under test after mocking
let signup, login, logout;

beforeAll(async () => {
  const authController = await import("./authController.js");
  signup = authController.signup;
  login = authController.login;
  logout = authController.logout;
});

describe("Auth Controller", () => {
  let req;
  let res;

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup request and response objects
    req = { body: {}, cookies: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      cookie: jest.fn(),
      clearCookie: jest.fn(),
    };

    // Setup environment variables
    process.env.JWT_SECRET = "test-secret";
    process.env.JWT_EXPIRES_IN = "1h";
    process.env.NODE_ENV = "development";
  });

  afterEach(() => {
    delete process.env.JWT_SECRET;
    delete process.env.JWT_EXPIRES_IN;
    delete process.env.NODE_ENV;
  });

  describe("signup", () => {
    it("should return 400 if fields are missing", async () => {
      req.body = { name: "Test User" };

      await signup(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Please enter all the fields",
      });
    });

    it("should return 400 if passwords do not match", async () => {
      req.body = {
        name: "Test User",
        email: "test@example.com",
        password: "password123",
        confirmPassword: "different",
        semester: 1,
        branch: "CSE",
      };

      await signup(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Passwords do not match",
      });
    });

    it("should return 400 if email already exists", async () => {
      req.body = {
        name: "Test User",
        email: "existing@example.com",
        password: "password123",
        confirmPassword: "password123",
        semester: 1,
        branch: "CSE",
      };

      mockFindOne.mockResolvedValue({ email: "existing@example.com" });

      await signup(req, res);

      expect(mockFindOne).toHaveBeenCalledWith({
        email: "existing@example.com",
      });
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "Email already exists",
      });
    });

    it("should create a new user and return success", async () => {
      req.body = {
        name: "Test User",
        email: "test@example.com",
        password: "password123",
        confirmPassword: "password123",
        semester: 1,
        branch: "CSE",
      };

      mockFindOne.mockResolvedValue(null);
      mockCreate.mockResolvedValue({
        _id: "user123",
        ...req.body,
      });
      mockSign.mockReturnValue("test-token");

      await signup(req, res);

      expect(mockFindOne).toHaveBeenCalledWith({ email: "test@example.com" });
      expect(mockCreate).toHaveBeenCalledWith({
        name: "Test User",
        email: "test@example.com",
        password: "password123",
        semester: 1,
        branch: "CSE",
      });
      expect(res.cookie).toHaveBeenCalledWith(
        "token",
        "test-token",
        expect.objectContaining({
          httpOnly: true,
        }),
      );
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: "User registered successfully",
      });
    });
  });

  describe("login", () => {
    it("should return 401 if user not found", async () => {
      req.body = { email: "test@example.com", password: "password123" };
      mockFindOne.mockResolvedValue(null);

      await login(req, res);

      expect(mockFindOne).toHaveBeenCalledWith({ email: "test@example.com" });
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: "Invalid email or password or user doesnt exist",
      });
    });

    it("should return 401 if password is incorrect", async () => {
      req.body = { email: "test@example.com", password: "wrongpass" };
      const mockUser = {
        _id: "user123",
        email: "test@example.com",
        matchPassword: mockMatchPassword.mockResolvedValue(false),
      };
      mockFindOne.mockResolvedValue(mockUser);

      await login(req, res);

      expect(mockFindOne).toHaveBeenCalledWith({ email: "test@example.com" });
      expect(mockMatchPassword).toHaveBeenCalledWith("wrongpass");
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: "Invalid email or password or user doesnt exist",
      });
    });

    it("should return token and user data on successful login", async () => {
      req.body = { email: "test@example.com", password: "correctpass" };
      const mockUser = {
        _id: "user123",
        name: "Test User",
        email: "test@example.com",
        semester: 1,
        branch: "CSE",
        role: "user",
        matchPassword: mockMatchPassword.mockResolvedValue(true),
      };
      mockFindOne.mockResolvedValue(mockUser);
      mockSign.mockReturnValue("test-token");

      await login(req, res);

      expect(mockMatchPassword).toHaveBeenCalledWith("correctpass");
      expect(mockSign).toHaveBeenCalledWith({ id: "user123" }, "test-secret", {
        expiresIn: "1h",
      });
      expect(res.cookie).toHaveBeenCalledWith(
        "token",
        "test-token",
        expect.any(Object),
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "successfully",
        token: "test-token",
        user: {
          _id: "user123",
          name: "Test User",
          email: "test@example.com",
          semester: 1,
          branch: "CSE",
        },
      });
    });
  });

  describe("logout", () => {
    it("should clear the token cookie", async () => {
      await logout(req, res);

      expect(res.clearCookie).toHaveBeenCalledWith("token", expect.any(Object));
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Logged out successfully",
      });
    });
  });

  // getUserProfile tests removed as they're not part of this implementation
});
