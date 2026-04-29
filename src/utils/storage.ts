import { UserProfile } from './formFiller';

const STORAGE_KEY = 'easyApplyProfile';

export const emptyProfile: UserProfile = {
  name: '',
  phone: '',
  email: '',
  school: '',
  major: '',
  graduationYear: '',
  yearsExp: '',
  currentCity: '',
  targetCity: '',
  expectedSalary: '',
  selfIntro: '',
};

export function loadProfile(): Promise<UserProfile> {
  return new Promise(resolve => {
    chrome.storage.local.get(STORAGE_KEY, result => {
      resolve({ ...emptyProfile, ...(result[STORAGE_KEY] ?? {}) });
    });
  });
}

export function saveProfile(profile: UserProfile): Promise<void> {
  return new Promise(resolve => {
    chrome.storage.local.set({ [STORAGE_KEY]: profile }, resolve);
  });
}
