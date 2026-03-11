import executeCode from "../utils/executeCode.js";
import CompilerRun from "../models/CompilerRun.js";
import getLocationFromIP from "../utils/getLocationFromIP.js";

const runCode = async (req, res) => {
  const { language, code, input } = req.body; // Accept `input` from the request body

  if (!language || !code) {
    return res
      .status(400)
      .json({ success: false, message: "Language and code are required" });
  }

  try {
    const output = await executeCode(language, code, input || ""); // Pass input to executeCode

    // Save the run to Database
    const compilerRun = new CompilerRun({
      language,
      code,
      input,
      output
    });
    await compilerRun.save();

    // Optional: Log execution with location
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const location = await getLocationFromIP(ip);
    if (location) {
      console.log(`Code executed from: ${location.city}, ${location.country}`);
    }

    return res.status(200).json({ success: true, output });
  } catch (error) {
    console.error("Error while executing code:", error);

    const compilerRunError = new CompilerRun({
      language,
      code,
      input,
      error: error?.message || "Execution error"
    });
    await compilerRunError.save().catch(e => console.error("Could not save error run", e));

    // Send the actual error message to the client
    return res.status(500).json({
      success: false,
      message: error?.message || error || "Error executing code",
      error: error?.message || error,
    });
  }
};

export { runCode };
