<script setup lang="ts">
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

interface Column {
  key: string;
  label: string;
}

const props = withDefaults(
  defineProps<{
    columns: Column[];
    rows?: Record<string, any>[];
    fileName?: string;
  }>(),
  {
    rows: () => [],
    fileName: "export",
  },
);

// 🟢 هندل کردن هم محصولات ساده و با variant و هم سایر موجودیت‌ها (کاربران، سفارشات و...)
const flattenRows = () => {
  const result: Record<string, any>[] = [];
  if (!props.rows || !Array.isArray(props.rows)) return result;

  props.rows.forEach((item) => {
    if (!item) return;
    if (Array.isArray(item.variants) && item.variants.length > 0) {
      // اگر محصول variant دارد
      item.variants.forEach((variant) => {
        const display =
          typeof getVariantDisplay === "function"
            ? getVariantDisplay(variant)
            : { label: "", colorHex: "" };
        result.push({
          ...item,
          sku: variant.sku ?? item.sku,
          price: variant.price ?? item.price,
          priceDiscount: variant.priceDiscount ?? item.priceDiscount,
          stock: variant.stock ?? item.stock,
          variantLabel: display.label,
          colorHex: display.colorHex ?? "",
        });
      });
    } else {
      // اگر محصول ساده است یا سایر موجودیت‌ها
      result.push({ ...item });
    }
  });

  return result;
};

// خروجی اکسل
const exportExcel = () => {
  const filteredRows = flattenRows().map((row) => {
    const obj: Record<string, any> = {};
    props.columns.forEach((col) => {
      obj[col.label] = row[col.key];
    });
    return obj;
  });

  const worksheet = XLSX.utils.json_to_sheet(filteredRows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

  const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  const data = new Blob([excelBuffer], { type: "application/octet-stream" });
  saveAs(data, (props.fileName || "export") + ".xlsx");
};

// خروجی CSV
const exportCSV = () => {
  const filteredRows = flattenRows().map((row) => {
    const obj: Record<string, any> = {};
    props.columns.forEach((col) => {
      obj[col.label] = row[col.key];
    });
    return obj;
  });

  const worksheet = XLSX.utils.json_to_sheet(filteredRows);
  const csv = XLSX.utils.sheet_to_csv(worksheet);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  saveAs(blob, (props.fileName || "export") + ".csv");
};
</script>

<template>
  <div class="flex gap-2">
    <button @click="exportCSV" class="text-neutral-500">
      <IconsCSV />
    </button>

    <button @click="exportExcel">
      <IconsExcel />
    </button>
  </div>
</template>
