export interface UserProfile {
  name: string;
  phone: string;
  email: string;
  school: string;
  major: string;
  graduationYear: string;
  yearsExp: string;
  currentCity: string;
  targetCity: string;
  expectedSalary: string;
  selfIntro: string;
}

/**
 * React/Vue 受控组件的填入方法。
 * 直接赋值 .value 对框架无效，需要触发原生 setter + 合成事件。
 */
export function fillInput(el: HTMLInputElement | HTMLTextAreaElement, value: string) {
  const proto = el instanceof HTMLTextAreaElement
    ? HTMLTextAreaElement.prototype
    : HTMLInputElement.prototype;

  const nativeSetter = Object.getOwnPropertyDescriptor(proto, 'value')?.set;
  if (nativeSetter) {
    nativeSetter.call(el, value);
  } else {
    el.value = value;
  }

  el.dispatchEvent(new Event('input', { bubbles: true }));
  el.dispatchEvent(new Event('change', { bubbles: true }));
  el.dispatchEvent(new Event('blur', { bubbles: true }));
}

export function fillSelect(el: HTMLSelectElement, value: string) {
  // 先尝试精确匹配 option value，再尝试 text 模糊匹配
  const options = Array.from(el.options);
  let matched = options.find(o => o.value === value || o.text === value);
  if (!matched) {
    matched = options.find(o => o.text.includes(value) || value.includes(o.text));
  }
  if (matched) {
    el.value = matched.value;
    el.dispatchEvent(new Event('change', { bubbles: true }));
  }
}

/**
 * 字段关键词映射表：根据 label / placeholder / name / id 猜测该填什么
 */
const FIELD_MAP: Array<{ keywords: string[]; field: keyof UserProfile }> = [
  { keywords: ['姓名', '名字', 'name', '真实姓名'], field: 'name' },
  { keywords: ['手机', '电话', 'phone', 'mobile', 'tel'], field: 'phone' },
  { keywords: ['邮箱', 'email', 'mail', '电子邮件'], field: 'email' },
  { keywords: ['学校', '院校', 'school', 'university', 'college'], field: 'school' },
  { keywords: ['专业', 'major', 'subject'], field: 'major' },
  { keywords: ['毕业', '毕业年份', 'graduation', 'graduate'], field: 'graduationYear' },
  { keywords: ['工作年限', '工作经验', '经验', 'experience', 'years'], field: 'yearsExp' },
  { keywords: ['现居城市', '所在城市', '目前城市', 'current city', 'location'], field: 'currentCity' },
  { keywords: ['期望城市', '意向城市', '目标城市', 'target city'], field: 'targetCity' },
  { keywords: ['期望薪资', '薪资要求', '薪资期望', 'salary', '薪酬'], field: 'expectedSalary' },
  { keywords: ['自我介绍', '个人介绍', '个人简介', 'self intro', 'about me', 'bio'], field: 'selfIntro' },
];

function guessField(el: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement): keyof UserProfile | null {
  const hints = [
    'placeholder' in el ? el.placeholder : '',
    el.name,
    el.id,
    el.getAttribute('aria-label') ?? '',
    el.closest('label')?.textContent ?? '',
    el.closest('.form-item, .field, [class*="form"]')
      ?.querySelector('label, .label, [class*="label"]')?.textContent ?? '',
  ].map(s => (s ?? '').toLowerCase());

  for (const { keywords, field } of FIELD_MAP) {
    if (keywords.some(kw => hints.some(h => h.includes(kw.toLowerCase())))) {
      return field;
    }
  }
  return null;
}

/**
 * 扫描页面所有表单字段，按映射规则填入用户数据。
 * 返回成功填入的字段数量。
 */
export function fillPageForms(profile: UserProfile): number {
  let count = 0;

  const inputs = Array.from(
    document.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(
      'input:not([type="hidden"]):not([type="submit"]):not([type="button"]):not([type="checkbox"]):not([type="radio"]), textarea, select'
    )
  );

  for (const el of inputs) {
    const field = guessField(el);
    if (!field) continue;

    const value = profile[field];
    if (!value) continue;

    if (el instanceof HTMLSelectElement) {
      fillSelect(el, value);
    } else {
      fillInput(el, value);
    }
    count++;
  }

  return count;
}
