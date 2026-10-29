<template>
  <ClientOnly>
    <div class="space-y-2">
      <label v-if="label" class="block mb-1 font-medium text-sm text-gray-700">
        {{ label }}
      </label>

      <!-- لیست تصاویر (هم تصاویر قدیمی سرور و هم آپلود شده‌های جدید که URL دارند) -->
      <div v-if="allItems.length" class="flex flex-wrap gap-4 mb-3">
        <div
          v-for="(item, index) in allItems"
          :key="item?.id ?? item.url"
          class="relative w-32 h-32 border-2 border-dashed border-gray-200 rounded-xl overflow-hidden group shadow-sm bg-gray-50 transition-all hover:border-indigo-500"
        >
          <img :src="item.url" class="object-cover w-full h-full" />
          
          <!-- لایه تیره هنگام هاور -->
          <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <button
              type="button"
              class="bg-red-600 text-white rounded-full p-1.5 shadow-md hover:scale-110 transition-transform"
              title="حذف تصویر"
              @click="removeItem(index, item)"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- نشانگر وضعیت در حال آپلود -->
          <div v-if="item.uploading" class="absolute inset-0 bg-white/80 flex flex-col items-center justify-center gap-1">
            <div class="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <span class="text-[10px] text-gray-600 font-medium">در حال آپلود...</span>
          </div>
        </div>
      </div>

      <!-- ناحیه کلیک برای انتخاب فایل (ظاهر مدرن و زیبا) -->
      <div 
        v-if="multiple || allItems.length === 0"
        @click="pond?.browse()"
        class="border-2 border-dashed border-gray-300 hover:border-indigo-500 rounded-xl p-6 text-center cursor-pointer bg-gray-50/50 hover:bg-indigo-50/30 transition-all group"
      >
        <div class="flex flex-col items-center gap-2">
          <div class="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
          </div>
          <p class="text-sm font-medium text-gray-700">
            برای آپلود فایل کلیک کنید یا فایل را اینجا رها کنید
          </p>
          <p class="text-xs text-gray-400">
            {{ multiple ? 'امکان آپلود چند فایل' : 'فقط یک فایل' }} (تبدیل خودکار به WebP)
          </p>
        </div>
      </div>

      <!-- FilePond پنهان -->
      <FilePond
        ref="pond"
        class="hidden"
        :name="name"
        :allow-multiple="multiple"
        :allow-revert="false"
        :allow-process="false"
        @addfile="handleFileAdded"
      />
    </div>
  </ClientOnly>
</template>

<script setup lang="ts">
import vueFilePond from "vue-filepond";
import "filepond/dist/filepond.min.css";
import { useToast } from "primevue/usetoast";

const FilePond = vueFilePond();
const toast = useToast();

const props = defineProps<{
  modelValue: string[] | string | null; // حالا URLها را نگه می‌دارد
  name: string;
  label?: string;
  multiple?: boolean;
  ownerType: string; // از انام‌های بک‌اند مثل MediaOwnerType.PRODUCT_THUMBNAIL
  existing?: { id?: string | number; url: string }[];
}>();

const emit = defineEmits<{
  (e: "update:modelValue", v: string[] | string | null): void;
  (e: "remove-existing", v: { id?: string | number; url: string }): void;
}>();

const pond = ref<any>();
const uploadingItems = ref<{ url: string; uploading: boolean }[]>([]);

// ترکیب تصاویر موجود از سرور و تصاویر جدیدی که در حال آپلود یا آپلود شده‌اند
const allItems = computed(() => {
  const existingList = (props.existing || []).map(e => ({ ...e, uploading: false }));
  
  if (props.multiple) {
    const newList = Array.isArray(props.modelValue) 
      ? props.modelValue.map(url => ({ url, uploading: false }))
      : [];
    return [...existingList, ...newList, ...uploadingItems.value];
  } else {
    if (props.modelValue && typeof props.modelValue === 'string') {
      return [{ url: props.modelValue, uploading: false }, ...uploadingItems.value];
    }
    return [...existingList, ...uploadingItems.value];
  }
});

// زمانی که فایلی انتخاب می‌شود، فوراً به سرور آپلود فرستاده می‌شود
async function handleFileAdded(error: any, fileItem: any) {
  if (error || !fileItem) return;

  const file = fileItem.file;
  const tempUrl = URL.createObjectURL(file);
  
  // نمایش لودینگ روی این آیتم خاص
  const loadingObj = { url: tempUrl, uploading: true };
  uploadingItems.value.push(loadingObj);

  const formData = new FormData();
  formData.append("file", file);
  formData.append("ownerType", props.ownerType);
  formData.append("ownerId", "temp_product"); // یا شناسه دلخواه

  try {
    // ارسال به روت سرور Nuxt که به MediaService در NestJS وصل است
    const response: any = await $fetch("/api/admin/upload", {
      method: "POST",
      body: formData,
    });

    const publicUrl = response?.url || response?.data?.publicUrl;

    if (publicUrl) {
      if (props.multiple) {
        const currentArr = Array.isArray(props.modelValue) ? [...props.modelValue] : [];
        currentArr.push(publicUrl);
        emit("update:modelValue", currentArr);
      } else {
        emit("update:modelValue", publicUrl);
      }
      
      toast.add({ severity: 'success', summary: 'موفقیت', detail: 'تصویر با موفقیت بهینه و آپلود شد', life: 2000 });
    }
  } catch (err: any) {
    toast.add({ severity: 'error', summary: 'خطا در آپلود', detail: err?.data?.message || 'بارگذاری فایل ناموفق بود', life: 3000 });
  } finally {
    // پاک کردن از لیست لودینگ موقت
    uploadingItems.value = uploadingItems.value.filter(item => item !== loadingObj);
    URL.revokeObjectURL(tempUrl);
    if (pond.value) {
      pond.value.removeFile(fileItem.id);
    }
  }
}

// حذف آیتم
function removeItem(index: number, item: any) {
  // اگر جزو لیست موجودهای سرور بود
  if (props.existing && props.existing.some(e => e.url === item.url)) {
    emit("remove-existing", item);
    return;
  }

  // اگر جزو فایل‌های جدید آپلود شده بود
  if (props.multiple) {
    const currentArr = Array.isArray(props.modelValue) ? [...props.modelValue] : [];
    // پیدا کردن ایندکس واقعی در آرایه مدل
    const targetUrl = item.url;
    const filtered = currentArr.filter(u => u !== targetUrl);
    emit("update:modelValue", filtered.length ? filtered : null);
  } else {
    emit("update:modelValue", null);
  }
}
</script>