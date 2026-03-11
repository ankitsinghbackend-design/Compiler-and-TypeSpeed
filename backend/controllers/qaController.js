import QA from "../models/QA.js";
import Notebook from "../models/Notebook.js";
const createQA = async (req, res) => {
  try {
    const { question, language, code, nbid } = req.body;
    if (!question || !language || !code) {
      return res.status(404).json({
        success: false,
        message: "Please enter all the fields you ballman",
      });
    }

    //first find the notebook you want to add the qa for
    //agar wo nhi mila to bora bistara bandho aur ghar jao

    const nb = await Notebook.findById(nbid);

    if (!nb) {
      //bhag sale
      return res.status(404).json({
        success: false,
        message: "Nahi mila notebook tera jake banake aaa pehle",
      });
    }

    //now create the q and a

    const newQA = await QA.create({
      question,
      language,
      code,
    });

    if (!newQA) {
      return res.status(404).json({
        success: false,
        message: "Nahi bana tera q and a jaa bana",
      });
    }

    nb.qa.push(newQA._id);

    await nb.save();

    return res.status(200).json({
      success: true,
      message: "ban gaya jaa banana le ke aa",
      nb,
      newQA,
    });
  } catch (e) {
    console.log(e);
    return res.status(500).json({
      success: false,
      message: "Nahi ban paya qa",
    });
  }
};

const deleteQA = async (req, res) => {
  try {
    const { qaId } = req.body;

    if (!qaId) {
      return res.status(400).json({
        success: false,
        message: "QA ID is required to delete a QA.",
      });
    }

    // Find the QA to be deleted
    const qa = await QA.findById(qaId);
    if (!qa) {
      return res.status(404).json({
        success: false,
        message: "QA not found.",
      });
    }

    // Find the notebook that references this QA
    const notebook = await Notebook.findOne({ qa: qaId });
    if (!notebook) {
      return res.status(404).json({
        success: false,
        message: "Notebook referencing the QA not found.",
      });
    }

    // Remove the QA reference from the notebook's qa array
    notebook.qa = notebook.qa.filter((id) => id.toString() !== qaId);
    await notebook.save();

    // Delete the QA from the database
    await QA.findByIdAndDelete(qaId);

    return res.status(200).json({
      success: true,
      message: "QA deleted successfully.",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete QA due to server error.",
    });
  }
};

const updateQA = async (req, res) => {
  try {
    const { qaId, question, language, code } = req.body;
    
    if (!qaId) {
      return res.status(400).json({
        success: false,
        message: "QA ID is required to update a QA.",
      });
    }
    
    if (!question || !language || !code) {
      return res.status(400).json({
        success: false,
        message: "Question, language, and code are required.",
      });
    }

    // Update the QA
    const updatedQA = await QA.findByIdAndUpdate(
      qaId,
      { question, language, code },
      { new: true }
    );

    if (!updatedQA) {
      return res.status(404).json({
        success: false,
        message: "QA not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "QA updated successfully.",
      qa: updatedQA,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to update QA due to server error.",
    });
  }
};

export { createQA, deleteQA, updateQA };
