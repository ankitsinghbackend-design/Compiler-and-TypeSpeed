import Notebook from "../models/Notebook.js";
import QA from "../models/QA.js";
// Create a new notebook
const createNotebook = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(404).json({ message: "Notebook name is required" });
    }

    const notebook = new Notebook({
      user: req.user._id, // Get user ID from the authenticated request
      name,
      qa: [], // Start with an empty array
    });

    await notebook.save();
    res
      .status(201)
      .json({ message: "Notebook created successfully", notebook });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating notebook", error: error.message });
  }
};

// Fetch all notebooks for a logged-in user
const getNotebooks = async (req, res) => {
  try {
    const notebooks = await Notebook.find({ user: req.user._id }).populate(
      "qa",
    ); // Find notebooks linked to the logged-in user
    res.status(200).json({ notebooks });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching notebooks", error: error.message });
  }
};

const deleteNotebook = async (req, res) => {
  try {
    const { notebookId } = req.body;

    if (!notebookId) {
      return res.status(400).json({
        success: false,
        message: "Notebook ID is required.",
      });
    }

    // Find the notebook
    const notebook = await Notebook.findOne({
      _id: notebookId,
      user: req.user._id,
    });

    if (!notebook) {
      return res.status(404).json({
        success: false,
        message: "Notebook not found or you don't have access to it.",
      });
    }

    // Delete all associated QA entries
    const qaIds = notebook.qa; // IDs of QAs to be deleted
    if (qaIds.length > 0) {
      await QA.deleteMany({ _id: { $in: qaIds } }); // Bulk delete QAs
    }

    // Delete the notebook itself
    await Notebook.findByIdAndDelete(notebookId);

    res.status(200).json({
      success: true,
      message: "Notebook and its associated QA entries deleted successfully.",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error deleting notebook.",
      error: error.message,
    });
  }
};

export { createNotebook, getNotebooks, deleteNotebook };
