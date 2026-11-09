<template>
  <div class="space-y-5">
    <ConfirmDialog />

    <div class="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 class="text-xl font-bold text-gray-900">مدیریت تگ‌های محصول</h1>
        <p class="mt-1 text-sm text-gray-500">
          گروه‌ها و تگ‌هایی که مشتری با آن‌ها محصولات را فیلتر می‌کند؛ مثل نوع پوست، جنس مو یا مزیت محصول.
        </p>
      </div>
    </div>

    <div class="grid gap-5 lg:grid-cols-[19rem_minmax(0,1fr)]">
      <TagGroupList
        :groups="groups"
        :active-id="activeGroupId"
        @select="selectGroup"
        @create="openGroupDialog(null)"
        @edit="openGroupDialog"
        @move="moveGroup"
      />

      <TagTagList
        :group="activeGroup"
        :tags="tags"
        :total="total"
        :loading="loadingTags"
        :adding="adding"
        :search="search"
        @update:search="onSearch"
        @add="addTags"
        @edit="openTagDialog"
        @toggle="toggleTag"
        @move="moveTag"
        @merge="openMergeDialog"
        @delete="confirmDeleteTag"
      />
    </div>

    <TagGroupDialog
      :visible="groupDialog"
      :group="editingGroup"
      :saving="saving"
      @close="groupDialog = false"
      @save="saveGroup"
      @delete="confirmDeleteGroup"
    />
    <TagTagDialog :visible="tagDialog" :tag="editingTag" :groups="groups" :saving="saving" @close="tagDialog = false" @save="saveTag" />
    <TagMergeDialog :visible="mergeDialog" :source="mergeSource" :tags="tags" :saving="saving" @close="mergeDialog = false" @merge="doMerge" />
  </div>
</template>

<script setup lang="ts">
import { useConfirm } from 'primevue/useconfirm';
import type { CreateTagGroupPayload, Tag, TagGroup, UpdateTagPayload } from '@nimoura/shared-types';

type GroupRow = TagGroup & { tagCount: number };

const api = useProductTags();
const confirm = useConfirm();

const groups = ref<GroupRow[]>([]);
const activeGroupId = ref<number | null>(null);
const tags = ref<Tag[]>([]);
const total = ref(0);
const search = ref('');
const loadingTags = ref(false);
const adding = ref(false);
const saving = ref(false);

const groupDialog = ref(false);
const editingGroup = ref<TagGroup | null>(null);
const tagDialog = ref(false);
const editingTag = ref<Tag | null>(null);
const mergeDialog = ref(false);
const mergeSource = ref<Tag | null>(null);

const activeGroup = computed(() => groups.value.find((g) => g.id === activeGroupId.value) ?? null);

async function loadGroups(keepSelection = true) {
  const result = await api.listGroups();
  if (!result) return;
  groups.value = result;
  if (!keepSelection || !groups.value.some((g) => g.id === activeGroupId.value)) {
    activeGroupId.value = groups.value[0]?.id ?? null;
  }
}

async function loadTags() {
  if (!activeGroupId.value) {
    tags.value = [];
    total.value = 0;
    return;
  }
  loadingTags.value = true;
  const result = await api.listTags({ groupId: activeGroupId.value, q: search.value || undefined, limit: 200 });
  loadingTags.value = false;
  if (result) {
    tags.value = result.items;
    total.value = result.total;
  }
}

function selectGroup(id: number) {
  activeGroupId.value = id;
  search.value = '';
  loadTags();
}

let searchTimer: ReturnType<typeof setTimeout> | undefined;
function onSearch(value: string) {
  search.value = value;
  clearTimeout(searchTimer);
  searchTimer = setTimeout(loadTags, 350);
}

/* ------------------------------- groups -------------------------------- */

function openGroupDialog(group: TagGroup | null) {
  editingGroup.value = group;
  groupDialog.value = true;
}

async function saveGroup(payload: CreateTagGroupPayload) {
  saving.value = true;
  const saved = editingGroup.value
    ? await api.updateGroup(editingGroup.value.id, payload)
    : await api.createGroup(payload);
  saving.value = false;
  if (!saved) return;

  groupDialog.value = false;
  await loadGroups();
  if (!editingGroup.value) selectGroup(saved.id);
}

function confirmDeleteGroup(group: TagGroup) {
  confirm.require({
    header: 'حذف گروه',
    message: `گروه «${group.name}» حذف شود؟ (فقط گروه‌های بدون تگ قابل حذف هستند)`,
    acceptLabel: 'حذف کن',
    rejectLabel: 'انصراف',
    acceptClass: '!bg-red-500 !border-red-500',
    accept: async () => {
      if (await api.deleteGroup(group.id)) {
        groupDialog.value = false;
        await loadGroups(false);
        await loadTags();
      }
    },
  });
}

async function moveGroup(id: number, direction: -1 | 1) {
  const list = [...groups.value];
  const from = list.findIndex((g) => g.id === id);
  const to = from + direction;
  if (from < 0 || to < 0 || to >= list.length) return;
  [list[from], list[to]] = [list[to]!, list[from]!];
  groups.value = list;
  await api.reorderGroups(list.map((g) => g.id));
}

/* -------------------------------- tags --------------------------------- */

async function addTags(names: string[]) {
  if (!activeGroupId.value) return;
  adding.value = true;
  const result = await api.addTagsBulk(activeGroupId.value, names);
  adding.value = false;
  if (result) {
    await Promise.all([loadTags(), loadGroups()]);
  }
}

function openTagDialog(tag: Tag) {
  editingTag.value = tag;
  tagDialog.value = true;
}

function openMergeDialog(tag: Tag) {
  mergeSource.value = tag;
  mergeDialog.value = true;
}

async function saveTag(payload: UpdateTagPayload) {
  if (!editingTag.value) return;
  saving.value = true;
  const saved = await api.editTag(editingTag.value.id, payload);
  saving.value = false;
  if (!saved) return;
  tagDialog.value = false;
  await Promise.all([loadTags(), loadGroups()]);
}

async function toggleTag(tag: Tag, isActive: boolean) {
  tag.isActive = isActive;
  if (!(await api.editTag(tag.id, { isActive }))) tag.isActive = !isActive;
}

async function moveTag(tag: Tag, direction: -1 | 1) {
  const list = [...tags.value];
  const from = list.findIndex((t) => t.id === tag.id);
  const to = from + direction;
  if (from < 0 || to < 0 || to >= list.length) return;
  [list[from], list[to]] = [list[to]!, list[from]!];
  tags.value = list;
  await api.reorderTags(list.map((t) => t.id));
}

function confirmDeleteTag(tag: Tag) {
  const used = tag.productCount ?? 0;
  confirm.require({
    header: 'حذف تگ',
    message: used
      ? `«${tag.name}» روی ${used} محصول استفاده شده؛ با حذف، از همه آن‌ها برداشته می‌شود. ادامه می‌دهید؟`
      : `تگ «${tag.name}» حذف شود؟`,
    acceptLabel: 'حذف کن',
    rejectLabel: 'انصراف',
    acceptClass: '!bg-red-500 !border-red-500',
    accept: async () => {
      if (await api.removeTag(tag.id)) await Promise.all([loadTags(), loadGroups()]);
    },
  });
}

async function doMerge(targetId: number) {
  if (!mergeSource.value) return;
  saving.value = true;
  const merged = await api.mergeTags(mergeSource.value.id, targetId);
  saving.value = false;
  if (!merged) return;
  mergeDialog.value = false;
  await Promise.all([loadTags(), loadGroups()]);
}

onMounted(async () => {
  await loadGroups(false);
  await loadTags();
});
</script>
