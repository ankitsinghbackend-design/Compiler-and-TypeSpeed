import Suggestion from "../models/Suggestions.js";

const createSuggestion = async (req, res) => {
  try {
    const { code, suggestion } = req.body;
    if (!code || !suggestion) {
      return res.status(404).json({ message: "Code or suggestion is missing" });
    }
    const sugg = new Suggestion({
      user: req.user._id,
      code,
      suggestion,
    });
    await sugg.save();
    res.status(201).json({ message: "Suggestion created successfully", sugg });
  } catch (e) {
    res
      .status(500)
      .json({ message: "Error creating suggestion", error: e.message });
  }
};

const getSuggestions = async (req, res) => {
  try {
    const suggestions = await Suggestion.find({ user: req.user._id }); // Find notebooks linked to the logged-in user
    res.status(200).json({ suggestions });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching suggestion", error: error.message });
  }
};

const deleteSuggestion = async (req, res) => {
  try {
    const { suggestionId } = req.body;

    if (!suggestionId) {
      return res.status(400).json({
        success: false,
        message: "Suggestion ID is required.",
      });
    }

    // Find the suggestion to ensure it belongs to the user
    const suggestion = await Suggestion.findOne({
      _id: suggestionId,
      user: req.user._id,
    });

    if (!suggestion) {
      return res.status(404).json({
        success: false,
        message: "Suggestion not found or you don't have access to it.",
      });
    }

    // Delete the suggestion
    await Suggestion.findByIdAndDelete(suggestionId);

    res.status(200).json({
      success: true,
      message: "Suggestion deleted successfully.",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error deleting suggestion.",
      error: error.message,
    });
  }
};

export { createSuggestion, getSuggestions, deleteSuggestion };
