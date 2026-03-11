import { jest } from "@jest/globals";

// Create mock functions
const mockFindOne = jest.fn().mockResolvedValue(null);
const mockCreate = jest.fn();

// Mock modules using Jest ESM mocking
jest.unstable_mockModule("../models/User.js", () => ({
  default: {
    findOne: mockFindOne,
    create: mockCreate,
  },
}));

describe("Auth Controller Tests", () => {
  let req;
  let res;

  beforeEach(() => {
    jest.clearAllMocks();
    req = { body: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  test("login should return 401 if user not found", async () => {
    const { login } = await import("./authController.js");

    req.body = {
      email: "test@example.com",
      password: "password",
    };

    await login(req, res);

    expect(mockFindOne).toHaveBeenCalledWith({ email: "test@example.com" });
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: "Invalid email or password or user doesnt exist",
    });
  });
});
