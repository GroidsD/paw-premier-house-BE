const OpenAI = require("openai");

let cachedClient = null;

const FALLBACK_BY_LANGUAGE = {
    vi: "Xin loi, toi chua the tra loi luc nay.",
    en: "Sorry, I cannot answer that right now.",
};

const normalizeLanguage = (language) => (language === "en" ? "en" : "vi");

const getClient = () => {
    if (cachedClient) {
        return cachedClient;
    }

    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
        return null;
    }

    cachedClient = new OpenAI({ apiKey });
    return cachedClient;
};

const parseJsonContent = (content = "") => {
    const text = String(content || "").trim();

    if (!text) return null;

    try {
        return JSON.parse(text);
    } catch (error) {
        const first = text.indexOf("{");
        const last = text.lastIndexOf("}");

        if (first >= 0 && last > first) {
            try {
                return JSON.parse(text.slice(first, last + 1));
            } catch (nestedError) {
                return null;
            }
        }
    }

    return null;
};

const sanitizeSignalPayload = (payload = {}) => {
    const normalizeList = (value) =>
        Array.from(
            new Set(
                (Array.isArray(value) ? value : [])
                    .map((item) => String(item || "").trim())
                    .filter(Boolean),
            ),
        );

    return {
        language:
            payload.language === "en" || payload.language === "vi"
                ? payload.language
                : null,
        inputLanguage:
            payload.input_language === "en" ||
            payload.input_language === "vi" ||
            payload.input_language === "mixed"
                ? payload.input_language
                : null,
        petType:
            payload.pet_type === "dog" || payload.pet_type === "cat"
                ? payload.pet_type
                : null,
        petSize: ["small", "medium", "large"].includes(payload.pet_size)
            ? payload.pet_size
            : null,
        searchTerms: normalizeList(payload.search_terms || payload.searchTerms),
        categoryHints: normalizeList(
            payload.category_hints || payload.categoryHints,
        ),
    };
};

const generateReply = async (prompt, { language = "vi" } = {}) => {
    const fallback = FALLBACK_BY_LANGUAGE[normalizeLanguage(language)];
    const client = getClient();

    if (!client) {
        return fallback;
    }

    const completion = await client.chat.completions.create({
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        messages: [
            {
                role: "user",
                content: prompt,
            },
        ],
        temperature: 0.2,
    });

    return completion.choices?.[0]?.message?.content || fallback;
};

const expandSearchSignals = async ({ message, language = "vi" }) => {
    const promptLanguage = normalizeLanguage(language);
    const client = getClient();

    if (!client) {
        return null;
    }

    try {
        const completion = await client.chat.completions.create({
            model:
                process.env.OPENAI_QUERY_ANALYZER_MODEL ||
                process.env.OPENAI_MODEL ||
                "gpt-4o-mini",
            response_format: { type: "json_object" },
            temperature: 0,
            messages: [
                {
                    role: "system",
                    content: [
                        "Extract multilingual ecommerce search hints from a user message.",
                        "Return JSON only.",
                        'Schema: {"language":"vi|en|null","input_language":"vi|en|mixed|null","pet_type":"dog|cat|null","pet_size":"small|medium|large|null","search_terms":["..."],"category_hints":["..."]}.',
                        "Prefer concise noun phrases in both the original language and likely translated equivalents when helpful.",
                    ].join(" "),
                },
                {
                    role: "user",
                    content: `Preferred language hint: ${promptLanguage}\nMessage: ${message}`,
                },
            ],
        });

        const payload = parseJsonContent(
            completion.choices?.[0]?.message?.content || "",
        );

        return payload ? sanitizeSignalPayload(payload) : null;
    } catch (error) {
        return null;
    }
};

module.exports = {
    generateReply,
    expandSearchSignals,
};
