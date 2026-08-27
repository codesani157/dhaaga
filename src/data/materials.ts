import { PaletteInfo } from '../types';

export interface DoriOption {
  id: number;
  name_hi: string;
  name_en: string;
  strands: number;
  twistPitch: number;
  colors: string[];
  description: string;
}

export const DORIS: DoriOption[] = [
  {
    id: 0,
    name_hi: 'कपास मौली (लाल + पीला)',
    name_en: 'Cotton Mauli (Red + Yellow)',
    strands: 3,
    twistPitch: 18,
    colors: ['#B4271F', '#DFA327', '#C0602A'],
    description: 'A billion wrists across India',
  },
  {
    id: 1,
    name_hi: 'रेशम ज़री (गोल्डन ट्विस्ट)',
    name_en: 'Silk Zari (Golden Twist)',
    strands: 3,
    twistPitch: 14,
    colors: ['#B5872B', '#DCC9A6', '#DFA327'],
    description: 'Fine metallic zari woven with unbleached silk',
  },
  {
    id: 2,
    name_hi: 'फुलकारी धागा (पंजाब)',
    name_en: 'Phulkari Floss (Punjab)',
    strands: 3,
    twistPitch: 22,
    colors: ['#B4271F', '#5F6E36', '#DFA327'],
    description: 'Bright untwisted silk floss from Punjab',
  },
  {
    id: 3,
    name_hi: 'कांथा सिलाई पट्टी (बंगाल)',
    name_en: 'Kantha Stitch Strip (Bengal)',
    strands: 2,
    twistPitch: 24,
    colors: ['#22364E', '#F1E3CB'],
    description: 'Hand running-stitch recycled cotton ribbon',
  },
  {
    id: 4,
    name_hi: 'पटुआ / जूट (प्राकृतिक)',
    name_en: 'Natural Jute / Patua',
    strands: 2,
    twistPitch: 16,
    colors: ['#9C5A2D', '#DCC9A6'],
    description: 'Earthy unbleached jute yarn',
  },
  {
    id: 5,
    name_hi: 'बंजारा मनके धागा',
    name_en: 'Banjara Beaded Thread',
    strands: 3,
    twistPitch: 20,
    colors: ['#7C1E13', '#DFA327', '#22364E'],
    description: 'Glass seed beads woven into cotton cord',
  },
  {
    id: 6,
    name_hi: 'रुद्राक्ष कल्प धागा',
    name_en: 'Rudraksha Cord',
    strands: 2,
    twistPitch: 18,
    colors: ['#9C5A2D', '#B4271F'],
    description: 'Brown sacred beads knotted with red silk',
  },
  {
    id: 7,
    name_hi: 'नारियाल जटा (नारली पूर्णिमा)',
    name_en: 'Coir Fibre (Narali Purnima)',
    strands: 2,
    twistPitch: 20,
    colors: ['#9C5A2D', '#7C1E13'],
    description: 'Coastal coconut coir twisted by hand',
  },
  {
    id: 8,
    name_hi: 'जनै पीला धागा (नेपाल / हिमालय)',
    name_en: 'Janai Yellow (Himalayan / Nepal)',
    strands: 2,
    twistPitch: 16,
    colors: ['#DFA327', '#FBF6EA'],
    description: 'Sacred turmeric-washed pure cotton thread',
  },
  {
    id: 9,
    name_hi: 'अजरक ब्लॉक प्रिंट पट्टी (कच्छ)',
    name_en: 'Ajrakh Block Print Strip (Kutch)',
    strands: 2,
    twistPitch: 26,
    colors: ['#22364E', '#B4271F'],
    description: 'Indigo and madder hand-block fabric',
  },
  {
    id: 10,
    name_hi: 'बंधेज / बांधनी पट्टी (गुजरात / राजस्थान)',
    name_en: 'Bandhani Tie-Dye Strip',
    strands: 3,
    twistPitch: 22,
    colors: ['#B4271F', '#DFA327', '#FBF6EA'],
    description: 'Resist-dyed micro dot georgette strip',
  },
  {
    id: 11,
    name_hi: 'हिमाचली ऊनी धागा',
    name_en: 'Himachali Woollen Plait',
    strands: 3,
    twistPitch: 28,
    colors: ['#B4271F', '#5F6E36', '#B5872B'],
    description: 'Warm thick hand-spun valley wool',
  },
];

export interface CentrepieceOption {
  id: number;
  name_hi: string;
  name_en: string;
  tradition: string;
  isSanjhi?: boolean;
  isFaith?: boolean;
}

export const CENTREPIECES: CentrepieceOption[] = [
  { id: 0, name_hi: 'सांझी जाली पेपर-कट', name_en: 'Sanjhi Jaali Paper-Cut', tradition: 'Mathura, UP', isSanjhi: true },
  { id: 1, name_hi: 'कोलम / रंगोली लूप', name_en: 'Kolam Continuous Loop', tradition: 'Tamil Nadu' },
  { id: 2, name_hi: 'चक्र आरी रेखा', name_en: 'Ashoka Chakra Spoke Geometry', tradition: 'Classic' },
  { id: 3, name_hi: 'बांधनी बिंदु गुच्छ', name_en: 'Bandhani Dot Cluster', tradition: 'Rajasthan / Kutch' },
  { id: 4, name_hi: 'शीशा / मिरर-वर्क', name_en: 'Shisha Mirror-Work', tradition: 'Gujarat' },
  { id: 5, name_hi: 'ज़रदोज़ी कुंडली', name_en: 'Zardozi Metallic Coil', tradition: 'Lucknow' },
  { id: 6, name_hi: 'वारली युगल आकृति', name_en: 'Warli Stick Pair', tradition: 'Maharashtra' },
  { id: 7, name_hi: 'मधुबनी मछली', name_en: 'Madhubani Twin Fish', tradition: 'Mithila, Bihar' },
  { id: 8, name_hi: 'मधुबनी मयूर (रेखाचित्र)', name_en: 'Madhubani Peacock Line', tradition: 'Mithila, Bihar' },
  { id: 9, name_hi: 'पंचमुखी रुद्राक्ष', name_en: 'Rudraksha Bead Centre', tradition: 'Himalayan' },
  { id: 10, name_hi: 'कौड़ी शैल / सीप', name_en: 'Cowrie Shell & Bead', tradition: 'Banjara / Coastal' },
  { id: 11, name_hi: 'नज़र बट्टू / बुरी नज़र ढाल', name_en: 'Nazar Protection Ward', tradition: 'Folk' },
  { id: 12, name_hi: 'गेंदा (मैरीगोल्ड) चक्र', name_en: 'Genda (Marigold) Rosette', tradition: 'Festive' },
  { id: 13, name_hi: 'कमल दल', name_en: 'Kamal (Sacred Lotus)', tradition: 'Classical' },
  { id: 14, name_hi: 'आस्था प्रतीक (सर्वधर्म आदर)', name_en: 'Faith Mark (Inclusive)', tradition: 'Multi-Faith', isFaith: true },
  { id: 15, name_hi: 'सादा अनमोल गांठ', name_en: 'Pure Knot (Bare Thread)', tradition: 'Minimal' },
];

export const FAITH_MARKS = [
  { id: 'none', label: 'कोई नहीं (None)' },
  { id: 'om', label: 'ॐ (Om)' },
  { id: 'swastik', label: 'स्वस्तिक (Indic Shubh)' },
  { id: 'ekonkar', label: 'ੴ (Ek Onkar)' },
  { id: 'crescent', label: 'चांद-सितारा (Hilal)' },
  { id: 'cross', label: 'क्रॉस (Cross)' },
  { id: 'khanda', label: 'ਖੰਡਾ (Khanda)' },
  { id: 'ahimsa', label: 'अहिंसा हस्त (Jain Hand)' },
  { id: 'dharmachakra', label: 'धर्मचक्र (Dharmachakra)' },
];

export const PALETTES: PaletteInfo[] = [
  {
    id: 0,
    name: 'Kumkum-Haldi',
    name_hi: 'कुमकुम-हल्दी',
    colors: ['#B4271F', '#DFA327', '#C0602A', '#FBF6EA'],
  },
  {
    id: 1,
    name: 'Neel-Chandi',
    name_hi: 'नील-चांदी',
    colors: ['#22364E', '#C7C3BA', '#DCC9A6', '#FBF6EA'],
  },
  {
    id: 2,
    name: 'Mehendi-Sona',
    name_hi: 'मेहंदी-सोना',
    colors: ['#5F6E36', '#B5872B', '#DFA327', '#F1E3CB'],
  },
  {
    id: 3,
    name: 'Gerua-Kaath',
    name_hi: 'गेरुआ-काठ',
    colors: ['#C0602A', '#9C5A2D', '#DCC9A6', '#F1E3CB'],
  },
  {
    id: 4,
    name: 'Lac-Moti',
    name_hi: 'लाख-मोती',
    colors: ['#7C1E13', '#B4271F', '#C7C3BA', '#FBF6EA'],
  },
  {
    id: 5,
    name: 'Kesar-Safed',
    name_hi: 'केसर-सफेद',
    colors: ['#DFA327', '#C0602A', '#DCC9A6', '#FBF6EA'],
  },
  {
    id: 6,
    name: 'Kaali Mitti',
    name_hi: 'काली मिट्टी व पीतल',
    colors: ['#231C17', '#B5872B', '#9C5A2D', '#DCC9A6'],
  },
  {
    id: 7,
    name: 'Baarish (Monsoon)',
    name_hi: 'बारिश व सावन',
    colors: ['#22364E', '#5F6E36', '#C7C3BA', '#F1E3CB'],
  },
];

export const LATKANS = [
  { id: 0, name_hi: 'पीतल घुंघरू', name_en: 'Brass Ghungroo', icon: 'bell' },
  { id: 1, name_hi: 'प्राकृतिक मोती', name_en: 'Pearl Bead', icon: 'circle' },
  { id: 2, name_hi: 'रेशम फुंदना (टसल)', name_en: 'Silk Tassel', icon: 'feather' },
  { id: 3, name_hi: 'कौड़ी सीप', name_en: 'Cowrie Shell', icon: 'shell' },
  { id: 4, name_hi: 'छोटी मंदिर घंटी', name_en: 'Tiny Temple Bell', icon: 'bell' },
  { id: 5, name_hi: 'रंगीन पोम-पोम', name_en: 'Coloured Pom-Pom', icon: 'sparkle' },
];

export const SOUND_VOICES = [
  { id: 0, name_hi: 'चुप (शांत)', name_en: 'Silence (Default)' },
  { id: 1, name_hi: 'घुंघरू की खनक', name_en: 'Ghungroo Jingle (Brass)' },
  { id: 2, name_hi: 'मंदिर महाघंटी', name_en: 'Mandir Temple Bell (Bronze)' },
  { id: 3, name_hi: 'पवित्र शंख नाद', name_en: 'Sacred Shankh Resonance' },
  { id: 4, name_hi: 'सितार राग यमन झंकार', name_en: 'Sitar Raag Yaman Pluck' },
  { id: 5, name_hi: 'तानपुरा स्वर ध्यान', name_en: 'Tanpura Meditative Drone' },
  { id: 6, name_hi: 'अक्षत व पुष्प वर्षा', name_en: 'Akshat & Flower Shower' },
];

export const SKIN_TONES = [
  { id: 0, name: 'चंदन (Chandan)', hex: '#EED9BA' },
  { id: 1, name: 'गेहुआं (Gehua)', hex: '#DEC19B' },
  { id: 2, name: 'काठ (Kaath)', hex: '#D2AF84' },
  { id: 3, name: 'खजूर (Khajoor)', hex: '#C29A6E' },
  { id: 4, name: 'तिल (Til)', hex: '#B2875C' },
  { id: 5, name: 'तांबा (Tamba)', hex: '#A3764E' },
  { id: 6, name: 'मिट्टी (Mitti)', hex: '#8F633E' },
  { id: 7, name: 'बादाम (Badam)', hex: '#7A5030' },
  { id: 8, name: 'कनक (Kanak)', hex: '#633E24' },
  { id: 9, name: 'काजल (Kohl)', hex: '#4B2D19' },
];

export const SLEEVE_STYLES = [
  { id: 0, name_hi: 'सादा कलाई (Bare Wrist)', name_en: 'Bare Wrist' },
  { id: 1, name_hi: 'कुर्ता कफ (Kurta Cuff)', name_en: 'Kurta Cuff' },
  { id: 2, name_hi: 'शर्ट कफ व बटन', name_en: 'Shirt Cuff with Button' },
  { id: 3, name_hi: 'ऊनी स्वेटर (Sweater)', name_en: 'Woollen Sweater' },
  { id: 4, name_hi: 'फौजी वर्दी (Olive Uniform)', name_en: 'Soldier Olive Uniform' },
  { id: 5, name_hi: 'डॉक्टर कोट (Doctor Coat)', name_en: 'Doctor’s White Coat' },
  { id: 6, name_hi: 'कांच की चूड़ियां (Bangles)', name_en: 'Glass Bangles' },
  { id: 7, name_hi: 'सिख / लोहे का कड़ा (Kada)', name_en: 'Steel Kada' },
  { id: 8, name_hi: 'पुराना रक्षा धागा', name_en: 'Old Sacred Thread Already There' },
  { id: 9, name_hi: 'घड़ी (Wrist Watch)', name_en: 'Classic Wrist Watch' },
];
