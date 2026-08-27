export interface StringDict {
  site_title: string;
  tagline: string;
  threshold_quote: string;
  enter_direct: string;
  make_rakhi: string;
  open_rakhi: string;
  privacy_footer: string;
  cost_guarantee: string;
  hand_movement_quote: string;
  tying_instruction: string;
  knot_slipped: string;
  knot_tied: string;
  letter_prompt_helper: string;
  link_weight_label: string;
  too_heavy_warning: string;
  empty_peti: string;
  broken_link_error: string;
  time_lock_label: string;
  time_lock_honest: string;
  save_to_peti: string;
  download_file: string;
  wipe_clean: string;
}

export const STRINGS_HI: StringDict = {
  site_title: 'धागा',
  tagline: 'राखी बांधी जाती है, भेजी नहीं जाती',
  threshold_quote: 'राखी बांधी जाती है, भेजी नहीं जाती। इसलिए यहां तुम खुद बांधोगी।',
  enter_direct: 'सीधा अंदर आ जाओ',
  make_rakhi: 'राखी बनाओ और बांधो',
  open_rakhi: 'आई हुई राखी खोलो',
  privacy_footer: 'कोई सर्वर नहीं। कोई अकाउंट नहीं। कोई कुकी नहीं। तुम्हारी चिट्ठी लिंक के अंदर है — हम उसे पढ़ भी नहीं सकते।',
  cost_guarantee: 'मुफ़्त है। हमेशा रहेगा। इसमें कमाने का कोई रास्ता ही नहीं बनाया।',
  hand_movement_quote: 'यह उनके हाथ की असली हरकत है',
  tying_instruction: 'धागा पकड़ो, और कलाई के चारों तरफ घुमाओ',
  knot_slipped: 'आराम से। धागा फिसल गया।',
  knot_tied: 'गांठ बंध गई। रक्षासूत्र पूर्ण हुआ।',
  letter_prompt_helper: 'जैसे तुम लिख रही हो, वैसे ही वो पढ़ेगा।',
  link_weight_label: 'लिंक का वज़न',
  too_heavy_warning: 'लिंक भारी हो गया। चिट्ठी से 40 अक्षर कम करो — या हाथ की हरकत दोबारा, थोड़ी छोटी।',
  empty_peti: 'पेटी खाली है। पहली राखी बनाओ, या जो मिली है उसे यहां रख दो।',
  broken_link_error: 'यह धागा कहीं उलझ गया। पूरा लिंक दोबारा पेस्ट करो — आखिर का हिस्सा कट गया हो सकता है।',
  time_lock_label: 'मुहूर्त पर खुले',
  time_lock_honest: 'यह ताला रस्म का है, ताला-चाबी का नहीं — डेटा लिंक में है, चाहे तो कोई पहले भी देख सकता है।',
  save_to_peti: 'राखी पेटी में रख दो',
  download_file: 'फ़ाइल बना के रख लो (.rakhi)',
  wipe_clean: 'निशान मिटा दो (डेटा साफ़ करें)',
};

export const STRINGS_EN: StringDict = {
  site_title: 'Dhaaga',
  tagline: 'A rakhi you actually tie, that travels as a link',
  threshold_quote: 'A rakhi is tied, never merely sent. Here, you tie it with your own hand.',
  enter_direct: 'Enter directly',
  make_rakhi: 'Craft & Tie Rakhi',
  open_rakhi: 'Open Received Rakhi',
  privacy_footer: 'Zero servers. Zero accounts. Zero cookies. Your letter lives inside the link — we cannot read it.',
  cost_guarantee: '₹0 forever. Free by design, with no monetization hooks.',
  hand_movement_quote: 'This is the true, recorded motion of their hand',
  tying_instruction: 'Hold the thread, and wrap it gently around the wrist',
  knot_slipped: 'Gently now. The thread slipped.',
  knot_tied: 'The sacred knot is sealed.',
  letter_prompt_helper: 'The cadence of your typing will be preserved on reading.',
  link_weight_label: 'Weight of the link',
  too_heavy_warning: 'The link is getting heavy. Shorten the letter or keep the tying loops concise.',
  empty_peti: 'The trunk is empty. Craft your first rakhi, or tuck a received one safely inside.',
  broken_link_error: 'The thread is tangled. Please paste the full link again — a piece at the end might be missing.',
  time_lock_label: 'Open at Shubh Muhurat',
  time_lock_honest: 'This is a ritual lock, not cryptographic — the data is inside the link.',
  save_to_peti: 'Safekeep in Rakhi Peti',
  download_file: 'Export as file (.rakhi)',
  wipe_clean: 'Erase all traces (Clear storage)',
};

/** Devanagari phonetic transliteration map for the built-in IME */
export const DEVANAGARI_MAP: Record<string, string> = {
  bhai: 'भाई',
  behen: 'बहन',
  rakhi: 'राखी',
  dhaaga: 'धागा',
  pyar: 'प्यार',
  prem: 'प्रेम',
  shubh: 'शुभ',
  muhurat: 'मुहूर्त',
  tilak: 'तिलक',
  mithai: 'मिठाई',
  khushi: 'खुशी',
  pranam: 'प्रणाम',
  namaste: 'नमस्ते',
  vachan: 'वचन',
  yaad: 'याद',
  ghar: 'घर',
  maa: 'मां',
  papa: 'पापा',
  bhabhi: 'भाभी',
  didi: 'दीदी',
  bhaiya: 'भैया',
  chhotu: 'छोटू',
};
