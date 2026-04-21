const axios = require("axios");

const AI_BASE_URL = process.env.AI_BASE_URL || "http://127.0.0.1:8001";

const analyze = async ({ message, currentUser }) => {
    const { data } = await axios.post(`${AI_BASE_URL}/analyze`, {
        message,
        currentUser,
    });
    return data;
};

const generateReply = async ({
    mode,
    intent,
    message,
    currentUser,
    context,
    analysis,
}) => {
    const { data } = await axios.post(`${AI_BASE_URL}/reply`, {
        mode,
        intent,
        message,
        currentUser,
        context,
        analysis,
    });

    return data?.reply || "";
};

module.exports = {
    analyze,
    generateReply,
};
