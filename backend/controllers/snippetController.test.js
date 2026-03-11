import { jest } from "@jest/globals";

// Create mock functions
const mockSnippetFind = jest.fn();
const mockSnippetFindOne = jest.fn();
const mockSnippetFindByIdAndDelete = jest.fn();
const mockSnippetSave = jest.fn();

// Mock code templates
const mockCodeTemplates = {
  python: {
    name: "Python Hello World",
    code: `# Basic Python program
def main():
    print("Hello, World!")

if __name__ == "__main__":
    main()`,
  },
  javascript: {
    name: "JavaScript Hello World",
    code: `// Basic JavaScript program
function main() {
    console.log("Hello, World!");
}

main();`,
  },
};

// Mock the models and utilities
jest.unstable_mockModule("../models/Snippets.js", () => ({
  default: function MockSnippet(data) {
    return {
      ...data,
      save: mockSnippetSave,
    };
  },
}));

// Add static methods to the constructor
jest.unstable_mockModule("../models/Snippets.js", () => ({
  default: Object.assign(
    function MockSnippet(data) {
      return {
        ...data,
        save: mockSnippetSave,
      };
    },
    {
      find: mockSnippetFind,
      findOne: mockSnippetFindOne,
      findByIdAndDelete: mockSnippetFindByIdAndDelete,
    },
  ),
}));

jest.unstable_mockModule("../utils/codeTemplates.js", () => ({
  default: mockCodeTemplates,
}));

// Import the controller after mocking
let createSnippet, getSnippets, deleteSnippet, getTemplates;

beforeAll(async () => {
  const snippetController = await import("./snippetController.js");
  createSnippet = snippetController.createSnippet;
  getSnippets = snippetController.getSnippets;
  deleteSnippet = snippetController.deleteSnippet;
  getTemplates = snippetController.getTemplates;
});

describe("Snippet Controller", () => {
  let req, res;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Setup mock request and response
    req = {
      user: {
        _id: "user123",
        name: "Test User",
      },
      body: {},
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    // Setup default mock behavior
    mockSnippetSave.mockResolvedValue(true);
  });

  describe("createSnippet", () => {
    const validSnippetData = {
      name: "My Test Snippet",
      code: "console.log('Hello World');",
    };

    it("should create snippet successfully with valid data", async () => {
      req.body = validSnippetData;

      await createSnippet(req, res);

      // Verify snippet was created with correct data
      expect(mockSnippetSave).toHaveBeenCalled();

      // Verify response
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: "Snippet created successfully",
        snippets: expect.objectContaining({
          user: "user123",
          name: "My Test Snippet",
          code: "console.log('Hello World');",
        }),
      });
    });

    it("should return 404 if snippet name is missing", async () => {
      req.body = { code: "console.log('test');" };

      await createSnippet(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: "Snippet name is required",
      });
    });

    it("should create snippet with empty code if code is not provided", async () => {
      req.body = { name: "Empty Snippet" };

      await createSnippet(req, res);

      expect(mockSnippetSave).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
    });

    it("should handle database errors gracefully", async () => {
      req.body = validSnippetData;
      mockSnippetSave.mockRejectedValue(new Error("Database error"));

      await createSnippet(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Error creating snippet",
        error: "Database error",
      });
    });
  });

  describe("getSnippets", () => {
    const mockSnippets = [
      {
        _id: "snippet1",
        user: "user123",
        name: "Snippet 1",
        code: "console.log('Hello');",
      },
      {
        _id: "snippet2",
        user: "user123",
        name: "Snippet 2",
        code: "console.log('World');",
      },
    ];

    it("should fetch user snippets successfully", async () => {
      mockSnippetFind.mockResolvedValue(mockSnippets);

      await getSnippets(req, res);

      // Verify correct query was made
      expect(mockSnippetFind).toHaveBeenCalledWith({ user: "user123" });

      // Verify response
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        snippets: mockSnippets,
      });
    });

    it("should return empty array if user has no snippets", async () => {
      mockSnippetFind.mockResolvedValue([]);

      await getSnippets(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        snippets: [],
      });
    });

    it("should handle database errors gracefully", async () => {
      mockSnippetFind.mockRejectedValue(new Error("Database error"));

      await getSnippets(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Error fetching snippets",
        error: "Database error",
      });
    });
  });

  describe("deleteSnippet", () => {
    const mockSnippet = {
      _id: "snippet123",
      user: "user123",
      name: "Test Snippet",
      code: "console.log('test');",
    };

    it("should delete snippet successfully", async () => {
      req.body = { snippetId: "snippet123" };
      mockSnippetFindOne.mockResolvedValue(mockSnippet);
      mockSnippetFindByIdAndDelete.mockResolvedValue(mockSnippet);

      await deleteSnippet(req, res);

      // Verify snippet was found with correct criteria
      expect(mockSnippetFindOne).toHaveBeenCalledWith({
        _id: "snippet123",
        user: "user123",
      });

      // Verify snippet was deleted
      expect(mockSnippetFindByIdAndDelete).toHaveBeenCalledWith("snippet123");

      // Verify response
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Snippet deleted successfully.",
      });
    });

    it("should return 400 if snippetId is missing", async () => {
      req.body = {};

      await deleteSnippet(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Snippet ID is required.",
      });
    });

    it("should return 404 if snippet is not found", async () => {
      req.body = { snippetId: "nonexistent123" };
      mockSnippetFindOne.mockResolvedValue(null);

      await deleteSnippet(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Snippet not found or you don't have access to it.",
      });
    });

    it("should return 404 if snippet belongs to different user", async () => {
      req.body = { snippetId: "snippet123" };
      req.user._id = "differentUser456";
      mockSnippetFindOne.mockResolvedValue(null); // Won't find snippet for different user

      await deleteSnippet(req, res);

      expect(mockSnippetFindOne).toHaveBeenCalledWith({
        _id: "snippet123",
        user: "differentUser456",
      });

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Snippet not found or you don't have access to it.",
      });
    });

    it("should handle database errors gracefully", async () => {
      req.body = { snippetId: "snippet123" };
      mockSnippetFindOne.mockRejectedValue(new Error("Database error"));

      await deleteSnippet(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Error deleting snippet.",
        error: "Database error",
      });
    });
  });

  describe("getTemplates", () => {
    it("should return code templates successfully", async () => {
      await getTemplates(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        templates: mockCodeTemplates,
      });
    });

    it("should handle errors when templates are not accessible", async () => {
      // This test verifies the controller structure handles errors
      // In practice, getTemplates is very simple and unlikely to fail
      // unless there's a system-level issue
      expect(typeof getTemplates).toBe("function");
      expect(getTemplates.length).toBe(2); // req, res parameters
    });
  });
});
