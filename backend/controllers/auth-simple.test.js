import { jest } from "@jest/globals";

let login;

// Mock setup
const mockUserModule = {
  default: {
    findOne: jest.fn().mockResolvedValue(null),
    create: jest.fn(),
  },
};

const mockJwtModule = {
  default: {
    sign: jest.fn().mockReturnValue("mocked_token"),
  },
};

// Apply mocks
jest.unstable_mockModule("../models/User.js", () => mockUserModule);
jest.unstable_mockModule("jsonwebtoken", () => mockJwtModule);

const req = { body: { email: "test@example.com", password: "password123" } };
const res = {
  status: jest.fn().mockReturnThis(),
  json: jest.fn(),
  cookie: jest.fn(),
};

process.env.JWT_SECRET = "test-secret";
process.env.JWT_EXPIRES_IN = "1h";

// Set up module imports before tests
beforeAll(async () => {
  const module = await import("./authController.js");
  login = module.login;
});

test("login should return 401 if user not found", async () => {
  await login(req, res);

  expect(res.status).toHaveBeenCalledWith(401);
  expect(res.json).toHaveBeenCalledWith({
    message: "Invalid email or password or user doesnt exist",
  });
});
