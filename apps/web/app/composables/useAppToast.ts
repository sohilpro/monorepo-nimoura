import { useToast } from 'primevue/usetoast';

export type ToastSeverity =
  | 'success'
  | 'info'
  | 'warn'
  | 'error'
  | 'secondary'
  | 'contrast';

export interface ToastPayloadObject {
  message?: string;
  detail?: string;
  summary?: string;
  life?: number;
  group?: string;
  closable?: boolean;
}

export type ToastInput = string | ToastPayloadObject;

function parseToastInput(
  input: ToastInput,
  defaultSummary: string,
  defaultLife: number,
) {
  if (typeof input === 'string') {
    return {
      detail: input,
      summary: defaultSummary,
      life: defaultLife,
      group: undefined,
      closable: undefined,
    };
  }

  const detail = input?.detail || input?.message || '';
  const summary = input?.summary || defaultSummary;
  const life = input?.life ?? defaultLife;

  return {
    detail,
    summary,
    life,
    group: input?.group,
    closable: input?.closable,
  };
}

/**
 * کامپوزبل ماژولار و استاندارد نمایش اعلان‌ها (Toast) بر پایه PrimeVue ToastService
 * سازگار با هر دو سبک ورودی رشته‌ای و آبجکت ({ message, summary, life })
 */
export function useAppToast() {
  const toast = useToast();

  const success = (input: ToastInput, summary = 'موفقیت', life = 3500) => {
    const p = parseToastInput(input, summary, life);
    return toast.add({
      severity: 'success',
      summary: p.summary,
      detail: p.detail,
      life: p.life,
      group: p.group,
      closable: p.closable,
    });
  };

  const error = (input: ToastInput, summary = 'خطا', life = 4500) => {
    const p = parseToastInput(input, summary, life);
    return toast.add({
      severity: 'error',
      summary: p.summary,
      detail: p.detail,
      life: p.life,
      group: p.group,
      closable: p.closable,
    });
  };

  const info = (input: ToastInput, summary = 'اطلاع', life = 3500) => {
    const p = parseToastInput(input, summary, life);
    return toast.add({
      severity: 'info',
      summary: p.summary,
      detail: p.detail,
      life: p.life,
      group: p.group,
      closable: p.closable,
    });
  };

  const warn = (input: ToastInput, summary = 'هشدار', life = 4000) => {
    const p = parseToastInput(input, summary, life);
    return toast.add({
      severity: 'warn',
      summary: p.summary,
      detail: p.detail,
      life: p.life,
      group: p.group,
      closable: p.closable,
    });
  };

  return {
    success,
    error,
    info,
    warn,
    add: toast.add.bind(toast),
    removeGroup: toast.removeGroup ? toast.removeGroup.bind(toast) : undefined,
    removeAllGroups: toast.removeAllGroups ? toast.removeAllGroups.bind(toast) : undefined,
    raw: toast,
  };
}
