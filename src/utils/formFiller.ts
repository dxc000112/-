export interface UserProfile {
  // 基本信息
  name: string;
  gender: string;
  birthDate: string;
  idNumber: string;
  phone: string;
  email: string;
  wechat: string;
  // 个人背景
  politicalStatus: string;
  ethnicity: string;
  hometown: string;
  currentCity: string;
  address: string;
  // 教育背景
  school: string;
  degree: string;
  major: string;
  graduationYear: string;
  gpa: string;
  rankPercent: string;
  englishLevel: string;
  // 求职意向
  targetJob: string;
  targetIndustry: string;
  targetCity: string;
  expectedSalary: string;
  jobStatus: string;
  yearsExp: string;
  // 能力与介绍
  skills: string;
  selfIntro: string;
}

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

  el.dispatchEvent(new Event('input',  { bubbles: true }));
  el.dispatchEvent(new Event('change', { bubbles: true }));
  el.dispatchEvent(new Event('blur',   { bubbles: true }));
}

export function fillSelect(el: HTMLSelectElement, value: string) {
  const options = Array.from(el.options);

  // 精确匹配
  let matched = options.find(o => o.value === value || o.text === value);

  if (!matched) {
    // 把多值字符串（"A/B/C" 或 "A，B，C"）拆开，逐个尝试
    const parts = value.split(/[/／，,、\s]+/).map(s => s.trim()).filter(Boolean);
    for (const part of parts) {
      matched = options.find(o =>
        o.value === part || o.text === part ||
        o.text.includes(part) || part.includes(o.text)
      );
      if (matched) break;
    }
  }

  if (matched) {
    el.value = matched.value;
    el.dispatchEvent(new Event('change', { bubbles: true }));
  }
}

const FIELD_MAP: Array<{ keywords: string[]; field: keyof UserProfile }> = [
  // 特异性强的字段优先，避免被宽泛关键词抢占
  { keywords: ['身份证', '证件号', 'id card', 'identification number'], field: 'idNumber' },
  { keywords: ['政治面貌', '政治', '党员', '团员', 'political status'], field: 'politicalStatus' },
  { keywords: ['民族', 'ethnicity', 'nationality', '族别'], field: 'ethnicity' },
  { keywords: ['户籍', '生源地', '籍贯', '户口', 'hometown', 'native place'], field: 'hometown' },
  { keywords: ['出生', '生日', '年龄', 'birth', '出生年月', '出生日期', 'date of birth'], field: 'birthDate' },
  { keywords: ['性别', 'gender', 'sex'], field: 'gender' },
  { keywords: ['微信', 'wechat', '微信号'], field: 'wechat' },
  { keywords: ['地址', '住址', 'address', '详细地址', '通讯地址', '居住地址'], field: 'address' },
  // 基本联系信息
  { keywords: ['姓名', '名字', 'name', '真实姓名'], field: 'name' },
  { keywords: ['手机', '电话', 'phone', 'mobile', 'tel'], field: 'phone' },
  { keywords: ['邮箱', 'email', 'mail', '电子邮件'], field: 'email' },
  // 教育
  { keywords: ['gpa', '绩点', '成绩绩点', 'grade point'], field: 'gpa' },
  { keywords: ['排名', '专业排名', '成绩排名', 'rank', '班级排名'], field: 'rankPercent' },
  { keywords: ['英语', '英语水平', 'english', 'cet', '外语', '语言水平'], field: 'englishLevel' },
  { keywords: ['学历', '学位', 'degree', 'education', '最高学历', '文化程度'], field: 'degree' },
  { keywords: ['学校', '院校', 'school', 'university', 'college', '毕业学校'], field: 'school' },
  { keywords: ['专业', 'major', 'subject', '所学专业'], field: 'major' },
  { keywords: ['毕业', '毕业年份', '毕业时间', 'graduation', 'graduate'], field: 'graduationYear' },
  // 求职意向（targetJob/targetIndustry 先于宽泛的 city/salary）
  { keywords: ['期望职位', '意向职位', '求职意向', '目标职位', '期望岗位', '意向岗位', 'desired position', 'job title', 'position'], field: 'targetJob' },
  { keywords: ['期望行业', '意向行业', '目标行业', '行业', 'industry'], field: 'targetIndustry' },
  { keywords: ['期望城市', '意向城市', '目标城市', '期望工作城市', 'target city', 'desired city'], field: 'targetCity' },
  { keywords: ['现居城市', '所在城市', '目前城市', '居住城市', 'current city', 'location'], field: 'currentCity' },
  { keywords: ['期望薪资', '薪资要求', '薪资期望', 'salary', '薪酬', '月薪'], field: 'expectedSalary' },
  { keywords: ['求职状态', '工作状态', '在职状态', '到岗时间', 'job status'], field: 'jobStatus' },
  { keywords: ['工作年限', '工作经验', '经验', 'experience', 'years', '年限'], field: 'yearsExp' },
  // 能力
  { keywords: ['技能', '专业技能', '技术栈', 'skills', '技能特长', '专业能力'], field: 'skills' },
  { keywords: ['自我介绍', '个人介绍', '个人简介', 'self intro', 'about me', 'bio', '自我评价'], field: 'selfIntro' },
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
