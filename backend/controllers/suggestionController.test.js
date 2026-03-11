import { jest } from "@jest/globals";

// Mock the Suggestion model
const mockSuggestion = {
  find: jest.fn(),
  findOne: jest.fn(),
  findByIdAndDelete: jest.fn(),
  prototype: {
    save: jest.fn(),
  },
};

// Mock constructor function
const MockSuggestionConstructor = jest.fn().mockImplementation((data) => ({
  ...data,
  save: mockSuggestion.prototype.save,
}));

// Assign static methods to the constructor
Object.assign(MockSuggestionConstructor, {
  find: mockSuggestion.find,
  findOne: mockSuggestion.findOne,
  findByIdAndDelete: mockSuggestion.findByIdAndDelete,
});

// Mock the Suggestion model using unstable_mockModule
await jest.unstable_mockModule("../models/Suggestions.js", () => ({
  default: MockSuggestionConstructor,
}));

// Import the controller after mocking
const { createSuggestion, getSuggestions, deleteSuggestion } = await import(
  "./suggestionController.js"
);

describe("Suggestion Controller", () => {
  let req, res, consoleErrorSpy;

  beforeEach(() => {
    jest.clearAllMocks();
    req = {
      body: {},
      user: { _id: "user123" },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  describe("createSuggestion", () => {
    test("should create suggestion successfully", async () => {
      req.body = {
        code: "console.log('Hello World');",
        suggestion:
          "Consider using const instead of var for better scope control.",
      };

      const mockSavedSuggestion = {
        _id: "suggestion123",
        user: "user123",
        code: "console.log('Hello World');",
        suggestion:
          "Consider using const instead of var for better scope control.",
      };

      mockSuggestion.prototype.save.mockResolvedValue(mockSavedSuggestion);

      await createSuggestion(req, res);

      expect(MockSuggestionConstructor).toHaveBeenCalledWith({
        user: "user123",
        code: "console.log('Hello World');",
        suggestion:
          "Consider using const instead of var for better scope control.",
      });
      expect(mockSuggestion.prototype.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Suggestion created successfully",
          sugg: expect.objectContaining({
            user: "user123",
            code: "console.log('Hello World');",
            suggestion:
              "Consider using const instead of var for better scope control.",
          }),
        }),
      );
    });

    test("should return 404 when code is missing", async () => {
      req.body = {
        suggestion:
          "Consider using const instead of var for better scope control.",
      };

      await createSuggestion(req, res);

      expect(MockSuggestionConstructor).not.toHaveBeenCalled();
      expect(mockSuggestion.prototype.save).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: "Code or suggestion is missing",
      });
    });

    test("should return 404 when suggestion is missing", async () => {
      req.body = {
        code: "console.log('Hello World');",
      };

      await createSuggestion(req, res);

      expect(MockSuggestionConstructor).not.toHaveBeenCalled();
      expect(mockSuggestion.prototype.save).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: "Code or suggestion is missing",
      });
    });

    test("should return 404 when both code and suggestion are missing", async () => {
      req.body = {};

      await createSuggestion(req, res);

      expect(MockSuggestionConstructor).not.toHaveBeenCalled();
      expect(mockSuggestion.prototype.save).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: "Code or suggestion is missing",
      });
    });

    test("should return 404 when code is empty string", async () => {
      req.body = {
        code: "",
        suggestion:
          "Consider using const instead of var for better scope control.",
      };

      await createSuggestion(req, res);

      expect(MockSuggestionConstructor).not.toHaveBeenCalled();
      expect(mockSuggestion.prototype.save).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: "Code or suggestion is missing",
      });
    });

    test("should return 404 when suggestion is empty string", async () => {
      req.body = {
        code: "console.log('Hello World');",
        suggestion: "",
      };

      await createSuggestion(req, res);

      expect(MockSuggestionConstructor).not.toHaveBeenCalled();
      expect(mockSuggestion.prototype.save).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: "Code or suggestion is missing",
      });
    });

    test("should handle database save error", async () => {
      req.body = {
        code: "console.log('Hello World');",
        suggestion:
          "Consider using const instead of var for better scope control.",
      };

      const mockError = new Error("Database save error");
      mockSuggestion.prototype.save.mockRejectedValue(mockError);

      await createSuggestion(req, res);

      expect(MockSuggestionConstructor).toHaveBeenCalledWith({
        user: "user123",
        code: "console.log('Hello World');",
        suggestion:
          "Consider using const instead of var for better scope control.",
      });
      expect(mockSuggestion.prototype.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Error creating suggestion",
        error: "Database save error",
      });
    });
  });

  describe("getSuggestions", () => {
    test("should get all suggestions for user successfully", async () => {
      const mockSuggestions = [
        {
          _id: "suggestion1",
          user: "user123",
          code: "var x = 5;",
          suggestion: "Use const instead of var",
        },
        {
          _id: "suggestion2",
          user: "user123",
          code: "function test() {}",
          suggestion: "Consider using arrow functions",
        },
      ];

      mockSuggestion.find.mockResolvedValue(mockSuggestions);

      await getSuggestions(req, res);

      expect(mockSuggestion.find).toHaveBeenCalledWith({ user: "user123" });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        suggestions: mockSuggestions,
      });
    });

    test("should return empty array when user has no suggestions", async () => {
      mockSuggestion.find.mockResolvedValue([]);

      await getSuggestions(req, res);

      expect(mockSuggestion.find).toHaveBeenCalledWith({ user: "user123" });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        suggestions: [],
      });
    });

    test("should handle database error when fetching suggestions", async () => {
      const mockError = new Error("Database connection error");
      mockSuggestion.find.mockRejectedValue(mockError);

      await getSuggestions(req, res);

      expect(mockSuggestion.find).toHaveBeenCalledWith({ user: "user123" });
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Error fetching suggestion",
        error: "Database connection error",
      });
    });
  });

  describe("deleteSuggestion", () => {
    test("should delete suggestion successfully", async () => {
      req.body = {
        suggestionId: "suggestion123",
      };

      const mockSuggestion = {
        _id: "suggestion123",
        user: "user123",
        code: "var x = 5;",
        suggestion: "Use const instead of var",
      };

      MockSuggestionConstructor.findOne.mockResolvedValue(mockSuggestion);
      MockSuggestionConstructor.findByIdAndDelete.mockResolvedValue(
        mockSuggestion,
      );

      await deleteSuggestion(req, res);

      expect(MockSuggestionConstructor.findOne).toHaveBeenCalledWith({
        _id: "suggestion123",
        user: "user123",
      });
      expect(MockSuggestionConstructor.findByIdAndDelete).toHaveBeenCalledWith(
        "suggestion123",
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Suggestion deleted successfully.",
      });
    });

    test("should return 400 when suggestionId is missing", async () => {
      req.body = {};

      await deleteSuggestion(req, res);

      expect(MockSuggestionConstructor.findOne).not.toHaveBeenCalled();
      expect(
        MockSuggestionConstructor.findByIdAndDelete,
      ).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Suggestion ID is required.",
      });
    });

    test("should return 400 when suggestionId is empty string", async () => {
      req.body = {
        suggestionId: "",
      };

      await deleteSuggestion(req, res);

      expect(MockSuggestionConstructor.findOne).not.toHaveBeenCalled();
      expect(
        MockSuggestionConstructor.findByIdAndDelete,
      ).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Suggestion ID is required.",
      });
    });

    test("should return 404 when suggestion not found", async () => {
      req.body = {
        suggestionId: "nonexistent123",
      };

      MockSuggestionConstructor.findOne.mockResolvedValue(null);

      await deleteSuggestion(req, res);

      expect(MockSuggestionConstructor.findOne).toHaveBeenCalledWith({
        _id: "nonexistent123",
        user: "user123",
      });
      expect(
        MockSuggestionConstructor.findByIdAndDelete,
      ).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Suggestion not found or you don't have access to it.",
      });
    });

    test("should return 404 when user tries to delete another user's suggestion", async () => {
      req.body = {
        suggestionId: "suggestion123",
      };

      // Mock findOne to return null (suggestion not found for this user)
      MockSuggestionConstructor.findOne.mockResolvedValue(null);

      await deleteSuggestion(req, res);

      expect(MockSuggestionConstructor.findOne).toHaveBeenCalledWith({
        _id: "suggestion123",
        user: "user123",
      });
      expect(
        MockSuggestionConstructor.findByIdAndDelete,
      ).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Suggestion not found or you don't have access to it.",
      });
    });

    test("should handle database error during findOne", async () => {
      req.body = {
        suggestionId: "suggestion123",
      };

      const mockError = new Error("Database connection error");
      MockSuggestionConstructor.findOne.mockRejectedValue(mockError);

      await deleteSuggestion(req, res);

      expect(MockSuggestionConstructor.findOne).toHaveBeenCalledWith({
        _id: "suggestion123",
        user: "user123",
      });
      expect(
        MockSuggestionConstructor.findByIdAndDelete,
      ).not.toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalledWith(mockError);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Error deleting suggestion.",
        error: "Database connection error",
      });
    });

    test("should handle database error during deletion", async () => {
      req.body = {
        suggestionId: "suggestion123",
      };

      const mockSuggestion = {
        _id: "suggestion123",
        user: "user123",
        code: "var x = 5;",
        suggestion: "Use const instead of var",
      };

      MockSuggestionConstructor.findOne.mockResolvedValue(mockSuggestion);

      const mockError = new Error("Database deletion error");
      MockSuggestionConstructor.findByIdAndDelete.mockRejectedValue(mockError);

      await deleteSuggestion(req, res);

      expect(MockSuggestionConstructor.findOne).toHaveBeenCalledWith({
        _id: "suggestion123",
        user: "user123",
      });
      expect(MockSuggestionConstructor.findByIdAndDelete).toHaveBeenCalledWith(
        "suggestion123",
      );
      expect(consoleErrorSpy).toHaveBeenCalledWith(mockError);
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Error deleting suggestion.",
        error: "Database deletion error",
      });
    });
  });
});
