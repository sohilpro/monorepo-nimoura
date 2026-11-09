<script setup lang="ts">
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

interface Column {
  key: string;
  label: string;
}

const props = defineProps<{
  columns: Column[];
  rows: {
    title: string;
    englishTitle?: string;
    sku?: string;
    price?: number;
    priceDiscount?: number;
    stock?: number;
    variants?: { [key: string]: any }[];
  }[];
  fileName?: string;
}>();

// 🟢 هندل کردن هم محصولات ساده و هم محصولاتی با variant
const flattenRows = () => {
  const result: Record<string, any>[] = [];

  props.rows.forEach((item) => {
    if (Array.isArray(item.variants) && item.variants.length > 0) {
      // اگر محصول variant دارد
      item.variants.forEach((variant) => {
        const display = getVariantDisplay(variant);
        result.push({
          title: item.title,
          englishTitle: item.englishTitle,
          sku: variant.sku,
          price: variant.price,
          priceDiscount: variant.priceDiscount,
          stock: variant.stock,
          variantLabel: display.label,
          colorHex: display.colorHex ?? '',
        });
      });
    } else {
      // اگر محصول ساده است (فقط price و stock دارد)
      result.push({
        title: item.title,
        englishTitle: item.englishTitle,
        sku: item.sku,
        price: item.price,
        stock: item.stock,
        priceDiscount: item.priceDiscount,
      });
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
