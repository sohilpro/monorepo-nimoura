const numberFormatter = new Intl.NumberFormat("fa-IR");

export function numberFormat(value: number | string | null | undefined): string {
  if (value === null || value === undefined || value === "") return "";

  const numericValue =
    typeof value === "string" 
      ? Number(value.replace(/[^\d.-]/g, "")) 
      : value;

  if (isNaN(numericValue)) return String(value);
  
  return numberFormatter.format(numericValue);
}