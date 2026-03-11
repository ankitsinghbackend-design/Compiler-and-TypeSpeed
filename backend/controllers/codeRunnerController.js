import executeCode from "../utils/executeCode.js";

const runCode = async (req, res) => {
  const { language, code, input } = req.body; // Accept `input` from the request body

  if (!language || !code) {
    return res
      .status(400)
      .json({ success: false, message: "Language and code are required" });
  }

  try {
    const output = await executeCode(language, code, input || ""); // Pass input to executeCode
    return res.status(200).json({ success: true, output });
  } catch (error) {
    console.error("Error while executing code:", error);
    // Send the actual error message to the client
    return res.status(500).json({
      success: false,
      message: error?.message || error || "Error executing code",
      error: error?.message || error,
    });
  }
};

export { runCode };
