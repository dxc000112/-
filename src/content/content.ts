import { fillPageForms, UserProfile } from '../utils/formFiller';

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg.type === 'FILL_FORMS') {
    const profile: UserProfile = msg.profile;
    const count = fillPageForms(profile);
    sendResponse({ success: true, filled: count });
  }
  return true; // 保持 channel 开放
});
