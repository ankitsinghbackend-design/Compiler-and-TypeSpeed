import { jest } from "@jest/globals";

// Create mock functions
const mockFind = jest.fn();
const mockSort = jest.fn();
const mockPopulate = jest.fn();
const mockLimit = jest.fn();

// Mock the Message model
jest.unstable_mockModule("../models/Message.js", () => ({
  default: {
    find: mockFind,
  },
}));

// Import the controller after mocking
let getChatHistory;

beforeAll(async () => {
  const chatController = await import("./chatController.js");
  getChatHistory = chatController.getChatHistory;
});

describe("Chat Controller", () => {
  let req, res;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Setup mock chain for Message queries
    mockLimit.mockResolvedValue([
      {
        _id: "msg1",
        content: "Hello everyone!",
        room: "sem_branch_3_CSE",
        sender: { name: "John Doe" },
        createdAt: new Date("2024-01-01T10:00:00Z"),
      },
      {
        _id: "msg2",
        content: "How's everyone doing?",
        room: "sem_branch_3_CSE",
        sender: { name: "Jane Smith" },
        createdAt: new Date("2024-01-01T10:05:00Z"),
      },
    ]);

    mockPopulate.mockReturnValue({ limit: mockLimit });
    mockSort.mockReturnValue({ populate: mockPopulate });
    mockFind.mockReturnValue({ sort: mockSort });

    // Setup mock request and response
    req = {
      user: {
        id: "user123",
        name: "Test User",
        semester: "3",
        branch: "CSE",
      },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  describe("getChatHistory", () => {
    it("should fetch chat history successfully for valid user", async () => {
      await getChatHistory(req, res);

      // Verify Message.find was called with correct room
      expect(mockFind).toHaveBeenCalledWith({ room: "sem_branch_3_CSE" });

      // Verify the query chain
      expect(mockSort).toHaveBeenCalledWith({ createdAt: 1 });
      expect(mockPopulate).toHaveBeenCalledWith("sender", "name");
      expect(mockLimit).toHaveBeenCalledWith(100);

      // Verify response
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        messages: expect.arrayContaining([
          expect.objectContaining({
            _id: "msg1",
            content: "Hello everyone!",
            sender: { name: "John Doe" },
          }),
        ]),
      });
    });

    it("should return 400 if user is missing", async () => {
      req.user = null;

      await getChatHistory(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "User details incomplete.",
      });
    });

    it("should return 400 if user semester is missing", async () => {
      req.user.semester = null;

      await getChatHistory(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "User details incomplete.",
      });
    });

    it("should return 400 if user branch is missing", async () => {
      req.user.branch = null;

      await getChatHistory(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: "User details incomplete.",
      });
    });

    it("should handle database errors gracefully", async () => {
      const errorMessage = "Database connection failed";
      mockFind.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            limit: jest.fn().mockRejectedValue(new Error(errorMessage)),
          }),
        }),
      });

      await getChatHistory(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Error fetching chat history",
        error: errorMessage,
      });
    });

    it("should construct correct room name for different semesters and branches", async () => {
      req.user.semester = "5";
      req.user.branch = "ECE";

      await getChatHistory(req, res);

      expect(mockFind).toHaveBeenCalledWith({ room: "sem_branch_5_ECE" });
    });

    it("should limit messages to 100", async () => {
      await getChatHistory(req, res);

      expect(mockLimit).toHaveBeenCalledWith(100);
    });

    it("should sort messages by creation time in ascending order", async () => {
      await getChatHistory(req, res);

      expect(mockSort).toHaveBeenCalledWith({ createdAt: 1 });
    });

    it("should populate sender with name only", async () => {
      await getChatHistory(req, res);

      expect(mockPopulate).toHaveBeenCalledWith("sender", "name");
    });
  });
});
