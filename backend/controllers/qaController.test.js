import { jest } from "@jest/globals";

// Create mock functions
const mockQACreate = jest.fn();
const mockQAFindById = jest.fn();
const mockQAFindByIdAndDelete = jest.fn();
const mockNotebookFindById = jest.fn();
const mockNotebookFindOne = jest.fn();
const mockNotebookSave = jest.fn();

// Mock the models
jest.unstable_mockModule("../models/QA.js", () => ({
  default: {
    create: mockQACreate,
    findById: mockQAFindById,
    findByIdAndDelete: mockQAFindByIdAndDelete,
  },
}));

jest.unstable_mockModule("../models/Notebook.js", () => ({
  default: {
    findById: mockNotebookFindById,
    findOne: mockNotebookFindOne,
  },
}));

// Import the controller after mocking
let createQA, deleteQA;

beforeAll(async () => {
  const qaController = await import("./qaController.js");
  createQA = qaController.createQA;
  deleteQA = qaController.deleteQA;
});

describe("QA Controller", () => {
  let req, res;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Setup mock request and response
    req = {
      body: {},
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    // Setup default mock behavior
    mockNotebookSave.mockResolvedValue(true);
  });

  describe("createQA", () => {
    const validQAData = {
      question: "What is a loop?",
      language: "javascript",
      code: "for(let i = 0; i < 10; i++) { console.log(i); }",
      nbid: "notebook123",
    };

    const mockNotebook = {
      _id: "notebook123",
      title: "Test Notebook",
      qa: [],
      save: mockNotebookSave,
    };

    const mockNewQA = {
      _id: "qa123",
      question: "What is a loop?",
      language: "javascript",
      code: "for(let i = 0; i < 10; i++) { console.log(i); }",
    };

    it("should create QA successfully with valid data", async () => {
      req.body = validQAData;
      mockNotebookFindById.mockResolvedValue(mockNotebook);
      mockQACreate.mockResolvedValue(mockNewQA);

      await createQA(req, res);

      // Verify QA creation
      expect(mockQACreate).toHaveBeenCalledWith({
        question: validQAData.question,
        language: validQAData.language,
        code: validQAData.code,
      });

      // Verify notebook was found and updated
      expect(mockNotebookFindById).toHaveBeenCalledWith("notebook123");
      expect(mockNotebook.qa).toContain("qa123");
      expect(mockNotebookSave).toHaveBeenCalled();

      // Verify response
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "ban gaya jaa banana le ke aa",
        nb: mockNotebook,
        newQA: mockNewQA,
      });
    });

    it("should return 404 if question is missing", async () => {
      req.body = { ...validQAData, question: undefined };

      await createQA(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Please enter all the fields you ballman",
      });
    });

    it("should return 404 if language is missing", async () => {
      req.body = { ...validQAData, language: undefined };

      await createQA(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Please enter all the fields you ballman",
      });
    });

    it("should return 404 if code is missing", async () => {
      req.body = { ...validQAData, code: undefined };

      await createQA(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Please enter all the fields you ballman",
      });
    });

    it("should return 404 if notebook is not found", async () => {
      req.body = validQAData;
      mockNotebookFindById.mockResolvedValue(null);

      await createQA(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Nahi mila notebook tera jake banake aaa pehle",
      });
    });

    it("should return 404 if QA creation fails", async () => {
      req.body = validQAData;
      mockNotebookFindById.mockResolvedValue(mockNotebook);
      mockQACreate.mockResolvedValue(null);

      await createQA(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Nahi bana tera q and a jaa bana",
      });
    });

    it("should handle database errors gracefully", async () => {
      req.body = validQAData;
      mockNotebookFindById.mockRejectedValue(new Error("Database error"));

      await createQA(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Nahi ban paya qa",
      });
    });
  });

  describe("deleteQA", () => {
    const mockQA = {
      _id: "qa123",
      question: "What is a loop?",
      language: "javascript",
      code: "for(let i = 0; i < 10; i++) { console.log(i); }",
    };

    const mockNotebook = {
      _id: "notebook123",
      title: "Test Notebook",
      qa: ["qa123", "qa456"],
      save: mockNotebookSave,
    };

    it("should delete QA successfully", async () => {
      req.body = { qaId: "qa123" };
      mockQAFindById.mockResolvedValue(mockQA);
      mockNotebookFindOne.mockResolvedValue(mockNotebook);
      mockQAFindByIdAndDelete.mockResolvedValue(mockQA);

      await deleteQA(req, res);

      // Verify QA was found and deleted
      expect(mockQAFindById).toHaveBeenCalledWith("qa123");
      expect(mockQAFindByIdAndDelete).toHaveBeenCalledWith("qa123");

      // Verify notebook was found and QA reference removed
      expect(mockNotebookFindOne).toHaveBeenCalledWith({ qa: "qa123" });
      expect(mockNotebook.qa).toEqual(["qa456"]);
      expect(mockNotebookSave).toHaveBeenCalled();

      // Verify response
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "QA deleted successfully.",
      });
    });

    it("should return 400 if qaId is missing", async () => {
      req.body = {};

      await deleteQA(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "QA ID is required to delete a QA.",
      });
    });

    it("should return 404 if QA is not found", async () => {
      req.body = { qaId: "nonexistent123" };
      mockQAFindById.mockResolvedValue(null);

      await deleteQA(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "QA not found.",
      });
    });

    it("should return 404 if notebook referencing QA is not found", async () => {
      req.body = { qaId: "qa123" };
      mockQAFindById.mockResolvedValue(mockQA);
      mockNotebookFindOne.mockResolvedValue(null);

      await deleteQA(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Notebook referencing the QA not found.",
      });
    });

    it("should handle database errors gracefully", async () => {
      req.body = { qaId: "qa123" };
      mockQAFindById.mockRejectedValue(new Error("Database error"));

      await deleteQA(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Failed to delete QA due to server error.",
      });
    });
  });
});
