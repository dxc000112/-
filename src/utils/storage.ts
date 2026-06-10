import { UserProfile } from './formFiller';

const STORAGE_KEY = 'easyApplyProfile';

export const emptyProfile: UserProfile = {
  name: '', gender: '', birthDate: '', idNumber: '',
  phone: '', email: '', wechat: '',
  politicalStatus: '', ethnicity: '', hometown: '', currentCity: '', address: '',
  school: '', degree: '', major: '', graduationYear: '', gpa: '', rankPercent: '', englishLevel: '',
  targetJob: '', targetIndustry: '', targetCity: '', expectedSalary: '', jobStatus: '', yearsExp: '',
  skills: '', selfIntro: '',
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
