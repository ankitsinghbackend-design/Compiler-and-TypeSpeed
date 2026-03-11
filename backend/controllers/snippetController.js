import Snippet from "../models/Snippets.js";
import codeTemplates from "../utils/codeTemplates.js";

const createSnippet = async (req, res) => {
  try {
    const { name, code } = req.body;
    if (!name) {
      return res.status(404).json({ message: "Snippet name is required" });
    }
    const snippets = new Snippet({
      user: req.user._id,
      name,
      code,
    });
    await snippets.save();
    res.status(201).json({ message: "Snippet created successfully", snippets });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating snippet", error: error.message });
  }
};

const getSnippets = async (req, res) => {
  try {
    const snippets = await Snippet.find({ user: req.user._id }); // Find notebooks linked to the logged-in user
    res.status(200).json({ snippets });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching snippets", error: error.message });
  }
};

const deleteSnippet = async (req, res) => {
  try {
    const { snippetId } = req.body;

    if (!snippetId) {
      return res.status(400).json({
        success: false,
        message: "Snippet ID is required.",
      });
    }

    // Find the snippet to ensure it belongs to the user
    const snippet = await Snippet.findOne({
      _id: snippetId,
      user: req.user._id,
    });

    if (!snippet) {
      return res.status(404).json({
        success: false,
        message: "Snippet not found or you don't have access to it.",
      });
    }

    // Delete the snippet
    await Snippet.findByIdAndDelete(snippetId);

    res.status(200).json({
      success: true,
      message: "Snippet deleted successfully.",
    });
  } catch (error) {
    // console.error(error); // Removed or commented out due to no-console rule
    res.status(500).json({
      success: false,
      message: "Error deleting snippet.",
      error: error.message,
    });
  }
};

const getTemplates = async (req, res) => {
  try {
    res.status(200).json({ templates: codeTemplates });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching templates", error: error.message });
  }
};

const updateSnippet = async (req, res) => {
  try {
    const { snippetId, name, code } = req.body;

    if (!snippetId) {
      return res.status(400).json({ message: "Snippet ID is required" });
    }

    if (!name) {
      return res.status(400).json({ message: "Snippet name is required" });
    }

    // Find and update the snippet (only if it belongs to the user)
    const snippet = await Snippet.findOneAndUpdate(
      { _id: snippetId, user: req.user._id },
      { name, code },
      { new: true }
    );

    if (!snippet) {
      return res.status(404).json({
        message: "Snippet not found or you don't have access to it",
      });
    }

    res.status(200).json({
      message: "Snippet updated successfully",
      snippet,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error updating snippet",
      error: error.message,
    });
  }
};

export { createSnippet, getSnippets, deleteSnippet, getTemplates, updateSnippet };
