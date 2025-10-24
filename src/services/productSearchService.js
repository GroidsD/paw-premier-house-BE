import db from "../models";

export const searchProducts = async (query, lang = "vi") => {
  if (!query) return [];

  const allProducts = await db.Product.findAll({
    include: [{ model: db.ProductTranslate, as: "translations" }],
    where: { status: "active" },
  });

  const filtered = allProducts.filter((product) => {
    const t = product.translations.find((tr) => tr.lang === lang);
    if (!t) return false;
    return t.name.toLowerCase().includes(query.toLowerCase());
  });

  return filtered.slice(0, 5).map((product) => {
    const t = product.translations.find((tr) => tr.lang === lang);
    return {
      id: product.product_id,
      name: t.name,
      description: t.description,
      price: t.price,
    };
  });
};
