import { generateComplexity } from "../utils/complexity.cjs";
import { generateSuggestion } from "../utils/suggestion.cjs";
import { generateTestCases } from "../utils/testCases.cjs";
import { generateNotebookSummary } from "../utils/notebookSummary.cjs";

const giveSuggestion = async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(404).json({ message: "Code is required" });
    }

    const response = await generateSuggestion(code);
    console.log(response);
    res.status(201).json({
      message: "succesfully generated suggestions for the given code",
      response,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error generating suggestion", error: error.message });
  }
};

const giveComplexity = async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(404).json({ message: "Code is required" });
    }

    const response = await generateComplexity(code);
    console.log(response);
    res.status(201).json({
      message: "succesfully generated complexity for the given code",
      response,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error generating complexity", error: error.message });
  }
};

const giveTestCases = async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(404).json({ message: "Code is required" });
    }

    const response = await generateTestCases(code);

    res.status(201).json({
      message: "succesfully generated complexity for the given code",
      response,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error generating complexity", error: error.message });
  }
};

const generateNotebookSummaryAPI = async (req, res) => {
  try {
    const { notebook } = req.body;

    if (!notebook) {
      return res.status(400).json({ message: "Notebook data is required" });
    }

    // Handle both 'qas' and 'qa' properties for compatibility
    const qaEntries = notebook.qas || notebook.qa || [];
    
    if (!qaEntries || qaEntries.length === 0) {
      return res.status(400).json({ message: "Notebook must contain Q&As to summarize" });
    }

    const response = await generateNotebookSummary(notebook);
    console.log(response);
    res.status(200).json({
      message: "Successfully generated notebook summary",
      summary: response,
    });
  } catch (error) {
    console.error('Error generating notebook summary:', error);
    res
      .status(500)
      .json({ message: "Error generating notebook summary", error: error.message });
  }
};

export { giveSuggestion, giveComplexity, giveTestCases, generateNotebookSummaryAPI };
