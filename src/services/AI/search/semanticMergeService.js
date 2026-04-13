const buildSemanticMap = (semanticResults = []) => {
    const map = new Map();

    for (const item of semanticResults) {
        if (!item?.product_id) continue;

        map.set(Number(item.product_id), {
            similarity: Number(item.similarity || 0),
            metadata: item.metadata || {},
            content: item.content || "",
        });
    }

    return map;
};

const computeSemanticBoost = ({ analysis, semanticEntry }) => {
    if (!semanticEntry) return 0;

    const similarity = Number(semanticEntry.similarity || 0);
    const metadata = semanticEntry.metadata || {};

    if (similarity < 0.2) return 0;

    if (
        analysis?.petType &&
        metadata?.pet_type &&
        metadata.pet_type !== analysis.petType
    ) {
        return -100;
    }

    let boost = similarity * 40;

    if (
        analysis?.petType &&
        metadata?.pet_type &&
        metadata.pet_type === analysis.petType
    ) {
        boost += 12;
    }

    if (
        analysis?.productForm &&
        metadata?.product_form &&
        metadata.product_form === analysis.productForm
    ) {
        boost += 10;
    }

    return boost;
};

const mergeSemanticIntoItems = ({
    localItems = [],
    semanticMappedItems = [],
    semanticResults = [],
    analysis = {},
}) => {
    const semanticMap = buildSemanticMap(semanticResults);
    const mergedMap = new Map();

    const addOrMergeItem = (item, source = "local") => {
        if (!item?.product_id) return;

        const productId = Number(item.product_id);
        const semanticEntry = semanticMap.get(productId);
        const semanticBoost = computeSemanticBoost({
            analysis,
            semanticEntry,
        });

        const existing = mergedMap.get(productId);

        const baseItem = {
            ...item,
            _semantic_similarity: semanticEntry?.similarity || 0,
            _semantic_metadata: semanticEntry?.metadata || null,
            _semantic_boost: semanticBoost,
            _semantic_source: source,
            _score: Number(item._score || 0),
        };

        const finalItem = {
            ...(existing || {}),
            ...baseItem,
        };

        finalItem._final_score =
            Number(finalItem._score || 0) +
            Number(finalItem._semantic_boost || 0);

        // nếu item đã tồn tại từ local, giữ source local là chính
        if (existing?._semantic_source === "local" || source === "local") {
            finalItem._semantic_source = "local";
        }

        mergedMap.set(productId, finalItem);
    };

    for (const item of localItems) {
        addOrMergeItem(item, "local");
    }

    for (const item of semanticMappedItems) {
        addOrMergeItem(item, "semantic");
    }

    return Array.from(mergedMap.values()).sort(
        (a, b) =>
            Number(b._final_score || 0) - Number(a._final_score || 0) ||
            Number(b.quantity || 0) - Number(a.quantity || 0),
    );
};

module.exports = {
    mergeSemanticIntoItems,
};
