import supabase from "../../config/supabase.js";

export async function getTopSelling(limit = 5) {
    const { data, error } = await supabase
        .from("product_vectors")
        .select("*")
        .order("totalSold", { ascending: false })
        .limit(limit);

    if (error) {
        console.error("Supabase error:", error);
        return [];
    }

    return mapProductRows(data);
}

export async function getDiscounted(limit = 20) {
    const { data, error } = await supabase
        .from("product_vectors")
        .select("*")
        .gt("discount", 0)
        .order("discount", { ascending: false })
        .limit(limit);

    if (error) {
        console.error("Supabase error:", error);
        return [];
    }

    return mapProductRows(data);
}

export async function getLowStock(threshold = 5) {
    const { data, error } = await supabase
        .from("product_vectors")
        .select("*")
        .lt("quantity", threshold)
        .order("quantity", { ascending: true });

    if (error) {
        console.error("Supabase error:", error);
        return [];
    }

    return mapProductRows(data);
}

export async function getLowestPrice(topK = 5) {
    const { data, error } = await supabase
        .from("product_vectors")
        .select("*")
        .order("price", { ascending: true })
        .limit(topK);

    if (error) {
        console.error("Supabase error:", error);
        return [];
    }

    return mapProductRows(data);
}

export async function getTopExpensive(limit = 5) {
    const { data, error } = await supabase
        .from("product_vectors")
        .select("*")
        .order("price", { ascending: false })
        .limit(limit);

    if (error) {
        console.error("Supabase error:", error);
        return [];
    }

    return mapProductRows(data);
}

function mapProductRows(rows = []) {
    return rows.map((d) => ({
        product_id: d.product_id,
        name: d.name,
        price: d.price,
        original_price: d.original_price,
        discount: d.discount,
        translates: [{ name: d.name, language: d.language }],
    }));
}

