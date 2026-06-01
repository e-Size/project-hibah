import type { CategoryItem } from "../types/product";

export const normalizeSearchText = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

export const compactSearchText = (value: string) => normalizeSearchText(value).replace(/\s+/g, "");

export const matchesCategory = (category: CategoryItem, rawQuery: string) => {
  const normalizedQuery = normalizeSearchText(rawQuery);
  const compactQuery = compactSearchText(rawQuery);

  if (!normalizedQuery) return true;

  return [category.name, ...(category.keywords ?? [])].some((term) => {
    const normalizedTerm = normalizeSearchText(term);
    const compactTerm = compactSearchText(term);

    return (
      normalizedTerm.includes(normalizedQuery) ||
      normalizedQuery.includes(normalizedTerm) ||
      compactTerm.includes(compactQuery) ||
      compactQuery.includes(compactTerm)
    );
  });
};
