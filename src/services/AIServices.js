import axios from "axios";

const PYTHON_AI_URL = process.env.PYTHON_AI_URL || "http://127.0.0.1:8001";

let callPythonChat = async (payload) => {
    try {
        const response = await axios.post(`${PYTHON_AI_URL}/chat`, payload, {
            timeout: 30000,
        });

        return response.data;
    } catch (error) {
        console.error("[AI SERVICE] callPythonChat error:", error.message);

        if (error.response) {
            console.error("[AI SERVICE] Python response:", error.response.data);
        }

        throw new Error("Cannot connect to Python AI server");
    }
};

export default {
    callPythonChat,
};
