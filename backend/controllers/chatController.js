import Message from "../models/Message.js";

const getChatHistory = async (req, res) => {
  try {
    const user = req.user;
    if (!user || !user.semester || !user.branch) {
      return res.status(400).json({ message: "User details incomplete." });
    }
    const room = `sem_branch_${user.semester}_${user.branch}`;

    const messages = await Message.find({ room })
      .sort({ createdAt: 1 })
      .populate("sender", "name")
      .limit(100);
    res.status(200).json({ messages });
  } catch (error) {
    console.error("Error fetching chat history:", error);
    res
      .status(500)
      .json({ message: "Error fetching chat history", error: error.message });
  }
};

export { getChatHistory };
