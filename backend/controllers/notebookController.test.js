import { jest } from "@jest/globals";

// Create mock functions
const mockNotebookSave = jest.fn();
const mockNotebookFind = jest.fn();
const mockNotebookFindOne = jest.fn();
const mockNotebookFindByIdAndDelete = jest.fn();
const mockQADeleteMany = jest.fn();

// Mock Notebook constructor
const mockNotebook = jest.fn().mockImplementation((data) => ({
  ...data,
  save: mockNotebookSave,
}));

// Mock models using unstable_mockModule
await jest.unstable_mockModule("../models/Notebook.js", () => ({
  default: mockNotebook,
}));

await jest.unstable_mockModule("../models/QA.js", () => ({
  default: {
    deleteMany: mockQADeleteMany,
  },
}));

// Import the controller after mocking
const { createNotebook, getNotebooks, deleteNotebook } = await import(
  "./notebookController.js"
);

describe("Notebook Controller", () => {
  let req, res;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Setup request and response objects
    req = {
      body: {},
      user: { _id: "user123" },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    // Setup static methods on the constructor function
    mockNotebook.find = mockNotebookFind;
    mockNotebook.findOne = mockNotebookFindOne;
    mockNotebook.findByIdAndDelete = mockNotebookFindByIdAndDelete;
  });

  describe("createNotebook", () => {
    test("should create notebook successfully", async () => {
      req.body.name = "Test Notebook";

      const mockNotebookInstance = {
        user: "user123",
        name: "Test Notebook",
        qa: [],
        save: mockNotebookSave,
      };

      mockNotebook.mockReturnValue(mockNotebookInstance);
      mockNotebookSave.mockResolvedValue(mockNotebookInstance);

      await createNotebook(req, res);

      expect(mockNotebook).toHaveBeenCalledWith({
        user: "user123",
        name: "Test Notebook",
        qa: [],
      });
      expect(mockNotebookSave).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: "Notebook created successfully",
        notebook: mockNotebookInstance,
      });
    });

    test("should return 404 when notebook name is missing", async () => {
      req.body = {}; // No name provided

      await createNotebook(req, res);

      expect(mockNotebook).not.toHaveBeenCalled();
      expect(mockNotebookSave).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: "Notebook name is required",
      });
    });

    test("should return 404 when notebook name is empty string", async () => {
      req.body.name = "";

      await createNotebook(req, res);

      expect(mockNotebook).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: "Notebook name is required",
      });
    });

    test("should handle database errors during notebook creation", async () => {
      req.body.name = "Test Notebook";

      const mockNotebookInstance = {
        save: mockNotebookSave,
      };

      mockNotebook.mockReturnValue(mockNotebookInstance);
      mockNotebookSave.mockRejectedValue(new Error("Database error"));

      await createNotebook(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Error creating notebook",
        error: "Database error",
      });
    });

    test("should handle user authentication correctly", async () => {
      req.body.name = "Auth Test Notebook";
      req.user._id = "different-user-id";

      const mockNotebookInstance = {
        save: mockNotebookSave,
      };

      mockNotebook.mockReturnValue(mockNotebookInstance);
      mockNotebookSave.mockResolvedValue(mockNotebookInstance);

      await createNotebook(req, res);

      expect(mockNotebook).toHaveBeenCalledWith({
        user: "different-user-id",
        name: "Auth Test Notebook",
        qa: [],
      });
    });
  });

  describe("getNotebooks", () => {
    test("should fetch notebooks successfully", async () => {
      const mockNotebooks = [
        { _id: "nb1", name: "Notebook 1", user: "user123", qa: [] },
        { _id: "nb2", name: "Notebook 2", user: "user123", qa: [] },
      ];

      const mockQuery = {
        populate: jest.fn().mockResolvedValue(mockNotebooks),
      };

      mockNotebookFind.mockReturnValue(mockQuery);

      await getNotebooks(req, res);

      expect(mockNotebookFind).toHaveBeenCalledWith({ user: "user123" });
      expect(mockQuery.populate).toHaveBeenCalledWith("qa");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        notebooks: mockNotebooks,
      });
    });

    test("should return empty array when no notebooks found", async () => {
      const mockQuery = {
        populate: jest.fn().mockResolvedValue([]),
      };

      mockNotebookFind.mockReturnValue(mockQuery);

      await getNotebooks(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        notebooks: [],
      });
    });

    test("should handle database errors during notebook fetching", async () => {
      const mockQuery = {
        populate: jest
          .fn()
          .mockRejectedValue(new Error("Database connection failed")),
      };

      mockNotebookFind.mockReturnValue(mockQuery);

      await getNotebooks(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: "Error fetching notebooks",
        error: "Database connection failed",
      });
    });

    test("should filter notebooks by authenticated user", async () => {
      req.user._id = "specific-user-123";

      const mockQuery = {
        populate: jest.fn().mockResolvedValue([]),
      };

      mockNotebookFind.mockReturnValue(mockQuery);

      await getNotebooks(req, res);

      expect(mockNotebookFind).toHaveBeenCalledWith({
        user: "specific-user-123",
      });
    });
  });

  describe("deleteNotebook", () => {
    test("should delete notebook and associated QAs successfully", async () => {
      req.body.notebookId = "notebook123";

      const mockNotebook = {
        _id: "notebook123",
        user: "user123",
        qa: ["qa1", "qa2", "qa3"],
      };

      mockNotebookFindOne.mockResolvedValue(mockNotebook);
      mockQADeleteMany.mockResolvedValue({ deletedCount: 3 });
      mockNotebookFindByIdAndDelete.mockResolvedValue(mockNotebook);

      await deleteNotebook(req, res);

      expect(mockNotebookFindOne).toHaveBeenCalledWith({
        _id: "notebook123",
        user: "user123",
      });
      expect(mockQADeleteMany).toHaveBeenCalledWith({
        _id: { $in: ["qa1", "qa2", "qa3"] },
      });
      expect(mockNotebookFindByIdAndDelete).toHaveBeenCalledWith("notebook123");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Notebook and its associated QA entries deleted successfully.",
      });
    });

    test("should return 400 when notebook ID is missing", async () => {
      req.body = {}; // No notebookId

      await deleteNotebook(req, res);

      expect(mockNotebookFindOne).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Notebook ID is required.",
      });
    });

    test("should return 400 when notebook ID is empty string", async () => {
      req.body.notebookId = "";

      await deleteNotebook(req, res);

      expect(mockNotebookFindOne).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Notebook ID is required.",
      });
    });

    test("should return 404 when notebook not found", async () => {
      req.body.notebookId = "nonexistent123";

      mockNotebookFindOne.mockResolvedValue(null);

      await deleteNotebook(req, res);

      expect(mockNotebookFindOne).toHaveBeenCalledWith({
        _id: "nonexistent123",
        user: "user123",
      });
      expect(mockQADeleteMany).not.toHaveBeenCalled();
      expect(mockNotebookFindByIdAndDelete).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Notebook not found or you don't have access to it.",
      });
    });

    test("should handle deletion of notebook with empty QA array", async () => {
      req.body.notebookId = "notebook456";

      const mockNotebook = {
        _id: "notebook456",
        user: "user123",
        qa: [], // Empty QA array
      };

      mockNotebookFindOne.mockResolvedValue(mockNotebook);
      mockNotebookFindByIdAndDelete.mockResolvedValue(mockNotebook);

      await deleteNotebook(req, res);

      expect(mockQADeleteMany).not.toHaveBeenCalled(); // Should not try to delete QAs
      expect(mockNotebookFindByIdAndDelete).toHaveBeenCalledWith("notebook456");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Notebook and its associated QA entries deleted successfully.",
      });
    });

    test("should handle database errors during notebook deletion", async () => {
      req.body.notebookId = "notebook789";

      mockNotebookFindOne.mockRejectedValue(new Error("Database error"));

      // Spy on console.error to verify error logging
      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();

      await deleteNotebook(req, res);

      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Error deleting notebook.",
        error: "Database error",
      });

      consoleErrorSpy.mockRestore();
    });

    test("should handle QA deletion errors gracefully", async () => {
      req.body.notebookId = "notebook999";

      const mockNotebook = {
        _id: "notebook999",
        user: "user123",
        qa: ["qa1", "qa2"],
      };

      mockNotebookFindOne.mockResolvedValue(mockNotebook);
      mockQADeleteMany.mockRejectedValue(new Error("QA deletion failed"));

      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();

      await deleteNotebook(req, res);

      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Error deleting notebook.",
        error: "QA deletion failed",
      });

      consoleErrorSpy.mockRestore();
    });

    test("should ensure user authorization for notebook deletion", async () => {
      req.body.notebookId = "unauthorized-notebook";
      req.user._id = "different-user";

      mockNotebookFindOne.mockResolvedValue(null); // Not found for this user

      await deleteNotebook(req, res);

      expect(mockNotebookFindOne).toHaveBeenCalledWith({
        _id: "unauthorized-notebook",
        user: "different-user",
      });
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Notebook not found or you don't have access to it.",
      });
    });
  });
});
