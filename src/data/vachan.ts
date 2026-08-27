export interface VachanItem {
  id: number;
  text_hi: string;
  text_en: string;
  category: 'practical' | 'emotional' | 'nostalgic' | 'funny' | 'general';
}

export const VACHAN_PROMISES: VachanItem[] = [
  // 1-8 Practical & Everyday Support
  {
    id: 0,
    text_hi: 'जब भी तू फोन करेगी, मैं उठाऊंगा। हर बार, चाहे कितनी भी व्यस्तता हो।',
    text_en: 'Whenever you call, I will answer. Every single time, no matter how busy.',
    category: 'practical',
  },
  {
    id: 1,
    text_hi: 'रात के किसी भी पहर मदद चाहिए हो, बस एक संदेश — मैं हाज़िर रहूंगा।',
    text_en: 'If you need help at any hour of the night, one text and I will be there.',
    category: 'practical',
  },
  {
    id: 2,
    text_hi: 'तेरे करियर, पढ़ाई और सपनों के बीच किसी रुकावट को नहीं आने दूंगा।',
    text_en: 'I will stand by your dreams, education, and career against every hurdle.',
    category: 'practical',
  },
  {
    id: 3,
    text_hi: 'फाइनेंस, कागज़ात या बैंक के मामलों में कभी भी उलझन हो, मिलकर सुलझाएंगे।',
    text_en: 'Whenever finances, paperwork, or legal matters feel daunting, we solve it together.',
    category: 'practical',
  },
  {
    id: 4,
    text_hi: 'जब भी शहर बदलेगी, तेरे घर का पहला चक्कर और सहारा मेरा होगा।',
    text_en: 'Whenever you move cities, helping you settle in will always be my job.',
    category: 'practical',
  },
  {
    id: 5,
    text_hi: 'तेरे स्वास्थ्य और आराम का ध्यान रखूंगा, तुझे काम में खुद को भूलने नहीं दूंगा।',
    text_en: 'I promise to check on your health and never let you burn out silently.',
    category: 'practical',
  },
  {
    id: 6,
    text_hi: 'घर पर जब भी कोई मनमुटाव हो, निष्पक्ष होकर सच का साथ दूंगा।',
    text_en: 'Whenever there is family tension, I promise to listen fairly and stand by truth.',
    category: 'practical',
  },
  {
    id: 7,
    text_hi: 'साल में कम से कम एक बार बिना किसी वजह के सिर्फ मिलने आऊंगा।',
    text_en: 'At least once every year, I will visit you just to spend quiet unhurried time.',
    category: 'practical',
  },

  // 9-18 Emotional & Deep Psychological Safety
  {
    id: 8,
    text_hi: 'तेरे फैसलों पर कभी शक नहीं करूंगा; दुनिया जो भी कहे, मेरा भरोसा तेरे साथ है।',
    text_en: 'I will never doubt your life choices; whatever the world says, my faith is yours.',
    category: 'emotional',
  },
  {
    id: 9,
    text_hi: 'तेरे आंसुओं को कभी कमजोरी नहीं समझूंगा, तेरे दुख में ढाल बनूंगा।',
    text_en: 'I will never treat your tears as weakness; I will be your sanctuary and shield.',
    category: 'emotional',
  },
  {
    id: 10,
    text_hi: 'तुझे कभी अकेले नहीं लड़ने दूंगा — चाहे तू सही हो या सीख रही हो।',
    text_en: 'I will never let you fight alone — whether you are right or simply learning.',
    category: 'emotional',
  },
  {
    id: 11,
    text_hi: 'ससुराल हो या नया परिवार, याद रखना तेरे पीछे तेरा अपना घर हमेशा खड़ा है।',
    text_en: 'Wherever life takes you, remember your original home always has its doors open.',
    category: 'emotional',
  },
  {
    id: 12,
    text_hi: 'जब सब तुझे जज करेंगे, मैं चुपचाप बैठकर तेरी पूरी बात सुनूंगा।',
    text_en: 'When everyone is quick to judge, I will sit quietly and listen to your side.',
    category: 'emotional',
  },
  {
    id: 13,
    text_hi: 'तुझे किसी के सामने झुकने या अपनी पहचान खोने की ज़रूरत नहीं पड़ने दूंगा।',
    text_en: 'I will never let you compromise your self-respect or personal identity.',
    category: 'emotional',
  },
  {
    id: 14,
    text_hi: 'तेरे हर छोटे-बड़े जश्न में सबसे पहली ताली मेरी होगी।',
    text_en: 'In every milestone of yours, big or small, the loudest applause will be mine.',
    category: 'emotional',
  },
  {
    id: 15,
    text_hi: 'अगर कभी हम दोनों में झगड़ा भी हो, तो भी हमारा रिश्ता कभी कमजोर नहीं होगा।',
    text_en: 'Even if we argue or disagree, our foundational bond will never waver.',
    category: 'emotional',
  },
  {
    id: 16,
    text_hi: 'तेरे राज़ मेरे पास हमेशा तिजोरी की तरह महफ़ूज़ रहेंगे।',
    text_en: 'Your secrets are locked in a vault with me; they will never be betrayed.',
    category: 'emotional',
  },
  {
    id: 17,
    text_hi: 'बुढ़ापे तक हम एक-दूसरे के हाथ पकड़कर हंसेंगे और यादें दोहराएंगे।',
    text_en: 'Into our silver years, we will hold hands, laugh at old days, and reminisce.',
    category: 'emotional',
  },

  // 19-27 Nostalgic & Childhood Anchors
  {
    id: 18,
    text_hi: 'बचपन के वो झगड़े और खेल कभी नहीं भूलूंगा, वो हमारी सबसे बड़ी दौलत हैं।',
    text_en: 'I will never forget our childhood scrapes and games; they are our greatest wealth.',
    category: 'nostalgic',
  },
  {
    id: 19,
    text_hi: 'मां-बाप के संस्कारों और उनके प्रेम की विरासत को मिलकर जिंदा रखेंगे।',
    text_en: 'Together we will cherish and carry forward our parents’ values and warmth.',
    category: 'nostalgic',
  },
  {
    id: 20,
    text_hi: 'घर के उस पुराने कमरे की हंसी को अपनी नई जिंदगी में भी गूंजने देंगे।',
    text_en: 'We will keep the laughter of our childhood home alive in our present lives.',
    category: 'nostalgic',
  },
  {
    id: 21,
    text_hi: 'त्योहारों पर वही पुरानी कहानियां और किस्से फिर दोहराएंगे।',
    text_en: 'On every festive occasion, we will retell those beloved family folklore tales.',
    category: 'nostalgic',
  },
  {
    id: 22,
    text_hi: 'हमारी वो सीक्रेट भाषा और कोडवर्ड्स हमेशा जिंदा रहेंगे।',
    text_en: 'Our secret sibling code-words and inside jokes will never be retired.',
    category: 'nostalgic',
  },
  {
    id: 23,
    text_hi: 'छत पर बैठकर वो तारों को देखने वाली शामें फिर से जिएंगे।',
    text_en: 'We will make time to sit on rooftops and gaze at starlit skies together again.',
    category: 'nostalgic',
  },
  {
    id: 24,
    text_hi: 'स्कूल के दिनों वाली वो चाय और मैगी फिर कभी साथ बनाएंगे।',
    text_en: 'We will brew that midnight chai and maggi just like our school exam nights.',
    category: 'nostalgic',
  },
  {
    id: 25,
    text_hi: 'दुनिया चाहे जितनी बदल जाए, हम दोनों एक-दूसरे के लिए वही पुराने बच्चे रहेंगे।',
    text_en: 'However much the world changes, with each other we will always be those same kids.',
    category: 'nostalgic',
  },
  {
    id: 26,
    text_hi: 'पुरानी तस्वीरों के एलबम को संभाल कर रखेंगे और अगली पीढ़ी को सुनाएंगे।',
    text_en: 'We will guard our old photo albums and share our family history with the next generation.',
    category: 'nostalgic',
  },

  // 28-36 Humorous, Warm & Everyday Sibling Banter
  {
    id: 27,
    text_hi: 'तेरा पसंदीदा खाना जब भी बनेगा, आधा हिस्सा तेरा ही रहेगा।',
    text_en: 'Whenever your favorite meal is cooked, the bigger half is permanently reserved for you.',
    category: 'funny',
  },
  {
    id: 28,
    text_hi: 'टीवी के रिमोट पर झगड़ा भले ही कर लूं, लेकिन चैनल तेरा ही चलेगा।',
    text_en: 'I may fight over the remote, but in the end, whatever you want to watch wins.',
    category: 'funny',
  },
  {
    id: 29,
    text_hi: 'तेरी खराब चुटकुलों पर भी थोड़ा हंस दूंगा ताकि तेरा दिल न टूटे।',
    text_en: 'I promise to smile at your silliest jokes so your spirit never dims.',
    category: 'funny',
  },
  {
    id: 30,
    text_hi: 'जब भी मां तुझे डांटेगी, ध्यान भटकाने के लिए कोई नई शरारत कर दूंगा।',
    text_en: 'Whenever Mom is about to scold you, I will create a timely distraction.',
    category: 'funny',
  },
  {
    id: 31,
    text_hi: 'शादी में तेरे सारे नखरे और फरमाइशें पूरे करने की ज़िम्मेदारी मेरी।',
    text_en: 'At any celebration, fulfilling your ridiculous demands is my official duty.',
    category: 'funny',
  },
  {
    id: 32,
    text_hi: 'तेरी अलमारी से कपड़े चुराने के बाद कम से कम धोकर वापस रखूंगा।',
    text_en: 'When I borrow your favorite hoodie, I will actually return it clean.',
    category: 'funny',
  },
  {
    id: 33,
    text_hi: 'सोशल मीडिया पर तेरी तारीफ वाली फोटो में सबसे पहला फनी कमेंट मेरा होगा।',
    text_en: 'I will always be the first to drop the most embarrassing loving comment on your photos.',
    category: 'funny',
  },
  {
    id: 34,
    text_hi: 'शॉपिंग में तेरे सामान के भारी बैग उठाने का ठेका मेरा रहेगा।',
    text_en: 'Carrying your impossible shopping bags without grumbling is my permanent service.',
    category: 'funny',
  },
  {
    id: 35,
    text_hi: 'चाहे कितनी भी बड़ी हो जाए, मेरे लिए हमेशा मेरी छोटी/बड़ी बहना ही रहेगी।',
    text_en: 'No matter how old or accomplished you become, you are forever my cherished sibling.',
    category: 'funny',
  },
];

export const VACHAN_LIST = VACHAN_PROMISES;
