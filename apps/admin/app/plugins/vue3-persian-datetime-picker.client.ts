import { defineNuxtPlugin } from "#app";
import Vue3PersianDatetimePicker from "vue3-persian-datetime-picker";

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(Vue3PersianDatetimePicker, {
    name: "PersianDatePicker",
    props: {
      format: "YYYY-MM-DDTHH:mm:ss.SSS[Z]",
      displayFormat: "jYYYY/jMM/jDD HH:mm",
      editable: true,
      inputClass:
        "w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2 text-sm text-gray-800 placeholder-gray-400 transition-colors focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500",
      placeholder: "انتخاب تاریخ و ساعت...",
      color: "#2563eb",
      autoSubmit: false,
    },
  });

  nuxtApp.vueApp.component("DatePicker", Vue3PersianDatetimePicker);
  nuxtApp.vueApp.component("PersianDatePicker", Vue3PersianDatetimePicker);
  nuxtApp.vueApp.component("Vue3PersianDatetimePicker", Vue3PersianDatetimePicker);
});
