const normalizeText = require("../../../utils/normalizeText");

const buildSearchQuery = ({ message = "", analysis = {} }) => {
    const messageText = String(message || "").trim();

    if (messageText) {
        return messageText;
    }

    const parts = [
        analysis?.petType === "cat" ? "cat" : "",
        analysis?.petType === "dog" ? "dog" : "",
        analysis?.productForm || "",
        ...(analysis?.searchTerms || []).slice(0, 5),
    ].filter(Boolean);

    return normalizeText(parts.join(" ")).trim();
};

const mapTavilyResults = (results = []) =>
    (Array.isArray(results) ? results : [])
        .filter((item) => item && (item.title || item.content || item.url))
        .map((item) => ({
            title: item.title || "Untitled source",
            snippet: item.content || "",
            url: item.url || "",
            source: item.url || "",
        }));

const searchExternalKnowledge = async ({ message, analysis, limit = 4 }) => {
    const apiKey = process.env.TAVILY_API_KEY;

    if (!apiKey) {
        console.error("externalSearchService: missing TAVILY_API_KEY");
        return [];
    }

    if (typeof fetch !== "function") {
        console.error(
            "externalSearchService: fetch is not available in this Node runtime",
        );
        return [];
    }

    const query = buildSearchQuery({ message, analysis });

    if (!query) {
        console.error("externalSearchService: empty search query");
        return [];
    }

    console.log("externalSearchService query:", query);

    try {
        const response = await fetch("https://api.tavily.com/search", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                api_key: apiKey,
                query,
                search_depth: "basic",
                max_results: limit,
                topic: "general",
                include_answer: false,
                include_raw_content: false,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("externalSearchService search failed:", {
                status: response.status,
                statusText: response.statusText,
                body: errorText,
            });
            return [];
        }

        const data = await response.json();
        const mapped = mapTavilyResults(data?.results || []);

        console.log("externalSearchService results:", {
            count: mapped.length,
            titles: mapped.map((item) => item.title),
        });

        return mapped;
    } catch (error) {
        console.error("externalSearchService error:", error);
        return [];
    }
};

module.exports = {
    searchExternalKnowledge,
};