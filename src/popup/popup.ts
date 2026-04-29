import { loadProfile, saveProfile } from '../utils/storage';
import { UserProfile } from '../utils/formFiller';

const FIELDS: (keyof UserProfile)[] = [
  'name', 'phone', 'email', 'school', 'major', 'graduationYear',
  'yearsExp', 'currentCity', 'targetCity', 'expectedSalary', 'selfIntro',
];

function getFormValues(): UserProfile {
  const profile = {} as UserProfile;
  for (const field of FIELDS) {
    const el = document.getElementById(field) as HTMLInputElement | HTMLTextAreaElement;
    profile[field] = el?.value.trim() ?? '';
  }
  return profile;
}

function setFormValues(profile: UserProfile) {
  for (const field of FIELDS) {
    const el = document.getElementById(field) as HTMLInputElement | HTMLTextAreaElement;
    if (el) el.value = profile[field] ?? '';
  }
}

function showToast(msg: string) {
  const toast = document.getElementById('toast')!;
  toast.textContent = msg;
  toast.classList.remove('hidden');
  setTimeout(() => toast.classList.add('hidden'), 2000);
}

document.addEventListener('DOMContentLoaded', async () => {
  const profile = await loadProfile();
  setFormValues(profile);

  document.getElementById('saveBtn')!.addEventListener('click', async () => {
    await saveProfile(getFormValues());
    showToast('已保存 ✓');
  });

  document.getElementById('fillBtn')!.addEventListener('click', async () => {
    await saveProfile(getFormValues());

    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) return;

    chrome.tabs.sendMessage(tab.id, { type: 'FILL_FORMS', profile: getFormValues() }, res => {
      if (chrome.runtime.lastError) {
        showToast('注入失败，请刷新页面重试');
        return;
      }
      showToast(`已填入 ${res?.filled ?? 0} 个字段 ✦`);
    });
  });
});
