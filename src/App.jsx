import React, { useState, useRef, useCallback, useEffect, useLayoutEffect, useMemo } from "react";

// ─────────────────────────────────────────────────────────────
//  CONSTANTS
// ─────────────────────────────────────────────────────────────
const MIN_AH   = -135;
const MAX_AH   = 345;
const SPAN     = MAX_AH - MIN_AH;
const BAR_H        = 15;
const BAR_GAP      = 6;
const BTN_H        = 14;
const BTN_GAP      = 6;
const SUB_H        = 12;
const ROW_H        = BAR_H + BAR_GAP;
const MASOOM_ROW_H = BAR_H + BAR_GAP + BTN_H + BTN_GAP;
const SUB_ROW_H    = SUB_H + 6;
const EVT_ZONE_H = 160; // dedicated band at top for event labels above axis
const AXIS_H    = EVT_ZONE_H; // axis line sits at bottom of event zone

const C_MASOOM    = "#E8B84B";
const C_FAMILY    = "#5EC48A";
const C_COMPANION = "#7EB8C9";
const C_DEPUTY    = "#A98EE0";

function ahLabel(n) {
  if (n == null) return "∞";
  return n <= 0 ? `${Math.abs(Math.round(n))} BH` : `${Math.round(n)} AH`;
}

// ─────────────────────────────────────────────────────────────
//  MASOOMEEN (with ashaab array — top 5 per Shia tradition)
// ─────────────────────────────────────────────────────────────
const MASOOMEEN = [
  {
    id:"prophet", short:"Holy Prophet ﷺ", label:"Holy Prophet Muhammad ﷺ",
    arabic:"محمد بن عبدالله ﷺ", role:"Khatam al-Anbiya",
    birthAH:-52, birthH:"17 Rabi al-Awwal, 53 BH", birthCE:"570 CE",
    deathAH:11,  deathH:"28 Safar, 11 AH", deathCE:"632 CE",
    deathType:"martyrdom", age:63, shrine:"Al-Masjid al-Nabawi, Medina",
    detail:"The Seal of the Prophets. Received the first revelation at 40 in Cave of Hira. His 23-year mission transformed humanity. Per Shia narration he was poisoned — effects of the poisoned meat offered at Khaybar ultimately caused his passing. He left the Quran and the Ahl al-Bayt (Hadith al-Thaqalayn).",
    ashaab: [
      { id:"salman", short:"Salman al-Farsi (RA)", label:"Salman al-Farsi (RA)", arabic:"سلمان الفارسي",
        role:"'Salman is from us, the Ahl al-Bayt' — Prophet ﷺ",
        birthAH:-52, deathAH:36, deathType:"wafat", shrine:"Salman Pak, Iraq",
        detail:"Persian companion about whom the Prophet ﷺ declared 'Salman is from us, the Ahl al-Bayt.' He proposed the Trench (Khandaq) strategy. A devoted follower of Imam Ali (AS), later Governor of al-Mada'in." },
      { id:"abudharr", short:"Abu Dharr al-Ghifari (RA)", label:"Abu Dharr al-Ghifari (RA)", arabic:"أبو ذر الغفاري",
        role:"Champion of Justice · Exiled for truth",
        birthAH:-42, deathAH:32, deathType:"wafat", shrine:"Al-Rabadha, Arabia",
        detail:"One of the earliest Muslims. A fierce advocate for justice and the rights of the poor. Exiled to al-Rabadha by Uthman for speaking against wealth inequality. The Prophet ﷺ said: 'No one under the sky is more truthful than Abu Dharr.'" },
      { id:"miqdad", short:"Miqdad ibn Aswad (RA)", label:"Miqdad ibn Aswad al-Kindi (RA)", arabic:"المقداد بن الأسود",
        role:"Early Defender · One of three horsemen at Badr",
        birthAH:-37, deathAH:33, deathType:"wafat", shrine:"Medina",
        detail:"One of the earliest Muslims. At Badr, he was one of only three horsemen in the Muslim army. Among the few who remained loyal to Imam Ali (AS) after the Prophet's ﷺ passing. The Prophet ﷺ praised him as one of four whom the sky and earth love." },
      { id:"ammar", short:"Ammar ibn Yasir (RA)", label:"Ammar ibn Yasir (RA)", arabic:"عمار بن ياسر",
        role:"Martyr of Siffin · Son of First Martyrs of Islam",
        birthAH:-39, deathAH:37, deathType:"martyrdom", shrine:"Siffin, Syria/Iraq",
        detail:"Son of the first martyrs of Islam — Yasir and Sumayya. The Prophet ﷺ foretold: 'A rebellious group will kill you.' He remained faithful to Imam Ali (AS) until his martyrdom at Siffin, fulfilling the prophecy and proving Imam Ali's (AS) cause." },
      { id:"jabir_ansari", short:"Jabir ibn Abd Allah (RA)", label:"Jabir ibn Abd Allah al-Ansari (RA)", arabic:"جابر بن عبدالله الأنصاري",
        role:"Transmitter of Ziyarat Arba'een",
        birthAH:-16, deathAH:78, deathType:"wafat", shrine:"Medina",
        detail:"Devoted companion of the Prophet ﷺ who lived to serve Imam Baqir (AS) as well. He was the first pilgrim to visit Imam Husayn's (AS) grave after Karbala, on Arba'een, alongside Atiyya al-Awfi. His longevity allowed him to transmit hadith to later generations of Imams." },
    ]
  },
  {
    id:"ali", short:"Imam Ali (AS)", label:"Imam Ali ibn Abi Talib (AS)",
    arabic:"علي بن أبي طالب عليه السلام", role:"1st Imam · Amir al-Mu'minin",
    imamNo:1,
    birthAH:-22, birthH:"13 Rajab, 23 BH", birthCE:"600 CE",
    deathAH:40,  deathH:"21 Ramadan, 40 AH", deathCE:"661 CE",
    deathType:"martyrdom", age:63, shrine:"Najaf, Iraq",
    detail:"Born inside the Holy Kaaba. First male Muslim. Appointed at Ghadeer Khumm. His wisdom fills Nahj al-Balagha. Martyred by the poisoned sword of Ibn Muljam during Fajr prayer in Kufa on 19 Ramadan; passed away 21 Ramadan.",
    ashaab: [
      { id:"malik_ashtar", short:"Malik al-Ashtar (RA)", label:"Malik ibn al-Harith al-Ashtar (RA)", arabic:"مالك الأشتر النخعي",
        role:"Commander-in-Chief · 'To me as I was to the Prophet ﷺ'",
        birthAH:-15, deathAH:37, deathType:"martyrdom", shrine:"Al-Qulzum, Egypt",
        detail:"The most trusted military commander of Imam Ali (AS). Imam Ali (AS) said 'Malik was to me as I was to the Messenger of Allah ﷺ.' Appointed Governor of Egypt, he was poisoned by an agent of Muawiyah before reaching it. Nahj al-Balagha Letter 53 — addressed to him — is one of the greatest documents of governance in history." },
      { id:"kumayl", short:"Kumayl ibn Ziyad (RA)", label:"Kumayl ibn Ziyad al-Nakha'i (RA)", arabic:"كميل بن زياد النخعي",
        role:"Keeper of Du'a Kumayl",
        birthAH:5, deathAH:82, deathType:"martyrdom", shrine:"Thuwayj, Iraq",
        detail:"Received the famous Du'a Kumayl directly from Imam Ali (AS), reciting it every Thursday night. Martyred at an advanced age by the tyrant Hajjaj ibn Yusuf al-Thaqafi. When told he would be killed, he replied: 'I am an old man — take me to Ali's fire, not yours.'" },
      { id:"owais", short:"Uways al-Qarani (RA)", label:"Uways ibn Amir al-Qarani (RA)", arabic:"أويس القرني",
        role:"Martyr of Siffin · Praised by the Prophet ﷺ",
        birthAH:-7, deathAH:37, deathType:"martyrdom", shrine:"Siffin, Syria/Iraq",
        detail:"The Prophet ﷺ said about him: 'The best of the Tabi'een is a man called Uways from Yemen.' He never met the Prophet ﷺ in person but was deeply devoted. He fought under Imam Ali (AS) at Siffin and was martyred there. Shia tradition holds him in very high regard." },
      { id:"hijr", short:"Hujr ibn Adi (RA)", label:"Hujr ibn Adi al-Kindi (RA)", arabic:"حجر بن عدي الكندي",
        role:"Companion of Imams Ali & Hasan · Martyred by Muawiyah",
        birthAH:0, deathAH:51, deathType:"martyrdom", shrine:"Adhra, Syria",
        detail:"Loyal companion of both Imam Ali (AS) and Imam Hasan (AS). Refused to curse Imam Ali (AS) when Muawiyah ordered it. Muawiyah had him and several companions executed at Adhra in Syria — an act the Prophet ﷺ had foretold and condemned. Imam Husayn (AS) later cited his murder as one of Muawiyah's crimes." },
      { id:"mibnabubakar", short:"Muhammad ibn Abi Bakr (RA)", label:"Muhammad ibn Abi Bakr (RA)", arabic:"محمد بن أبي بكر",
        role:"Governor of Egypt · Devoted to Imam Ali (AS)",
        birthAH:10, deathAH:38, deathType:"martyrdom", shrine:"Egypt",
        detail:"Son of Abu Bakr, raised in the household of Imam Ali (AS) and was deeply devoted to him. Appointed Governor of Egypt by Imam Ali (AS). He was defeated by Muawiyah's forces and martyred by Amr ibn al-As's brother. Imam Ali (AS) grieved greatly at his martyrdom." },
    ]
  },
  {
    id:"fatimah", short:"J. Fatimah Zahra (AS)", label:"Sayyida Fatimah al-Zahra (AS)",
    arabic:"فاطمة الزهراء عليها السلام", role:"Sayyidatu Nisa al-Alamin",
    birthAH:-5, birthH:"20 Jamadi al-Thani, 5 BH", birthCE:"615 CE",
    deathAH:11.4, deathH:"3 Jamadi al-Thani, 11 AH", deathCE:"633 CE",
    deathType:"martyrdom", age:18, shrine:"Unknown (hidden by her own will), Medina",
    detail:"Daughter of the Holy Prophet ﷺ. Wife of Imam Ali (AS). Mother of the Imams Hasan and Husayn (AS). Her Khutba-e-Fadakiyya is a masterpiece of Islamic rhetoric. Martyred ~75–95 days after her father's passing. Her burial place is hidden per her own request.",
    ashaab: []
  },
  {
    id:"hasan", short:"Imam Hasan (AS)", label:"Imam Hasan ibn Ali (AS)",
    arabic:"الحسن بن علي عليه السلام", role:"2nd Imam · Sibt al-Akbar",
    imamNo:2,
    birthAH:3, birthH:"15 Ramadan, 3 AH", birthCE:"624 CE",
    deathAH:50, deathH:"28 Safar, 50 AH", deathCE:"670 CE",
    deathType:"martyrdom", age:47, shrine:"Jannat al-Baqi, Medina",
    detail:"Grandson of the Prophet ﷺ. 'Hasan and Husayn are the leaders of the youth of paradise.' Signed a peace treaty with Muawiyah to protect the community. Martyred by poison administered by his wife Ju'da, bribed by Muawiyah.",
    ashaab: [
      { id:"hijr_hasan", short:"Hujr ibn Adi (RA)", label:"Hujr ibn Adi al-Kindi (RA)", arabic:"حجر بن عدي الكندي",
        role:"Loyal defender, martyred by Muawiyah",
        birthAH:0, deathAH:51, deathType:"martyrdom", shrine:"Adhra, Syria",
        detail:"Loyal to Imam Hasan (AS) and refused Muawiyah's order to publicly curse Imam Ali (AS). Martyred at Adhra, Syria by Muawiyah — one of the most notorious political murders of the era, condemned by the Prophet ﷺ in prophecy." },
      { id:"sulaym", short:"Sulaym ibn Qays (RA)", label:"Sulaym ibn Qays al-Hilali (RA)", arabic:"سليم بن قيس الهلالي",
        role:"Narrator of Kitab Sulaym — earliest Shia text",
        birthAH:7, deathAH:76, deathType:"wafat", shrine:"Iraq",
        detail:"One of the most important narrators in early Shia Islam. His book — Kitab Sulaym ibn Qays — is considered the oldest existing Shia hadith compilation, narrating events from the Prophet ﷺ through to Imam Ali (AS) and Imam Hasan (AS). He spent years in hiding from Hajjaj ibn Yusuf." },
      { id:"amribhamiq", short:"Amr ibn al-Hamiq (RA)", label:"Amr ibn al-Hamiq al-Khuza'i (RA)", arabic:"عمرو بن الحمق الخزاعي",
        role:"Loyal companion of Imams Ali & Hasan",
        birthAH:-10, deathAH:51, deathType:"martyrdom", shrine:"Mosul, Iraq",
        detail:"A devoted companion of Imam Ali (AS) and Imam Hasan (AS). He prayed that Allah would grant him the ability to serve Imam Ali (AS) with his body, and he participated in all three major battles. Captured and martyred by Muawiyah's governor. The Prophet ﷺ had praised him by name." },
    ]
  },
  {
    id:"husayn", short:"Imam Husayn (AS)", label:"Imam Husayn ibn Ali (AS)",
    arabic:"الحسين بن علي عليه السلام", role:"3rd Imam · Sayyid al-Shuhada",
    imamNo:3,
    birthAH:4, birthH:"3 Sha'ban, 4 AH", birthCE:"626 CE",
    deathAH:61, deathH:"10 Muharram, 61 AH", deathCE:"680 CE",
    deathType:"martyrdom", age:57, shrine:"Karbala, Iraq",
    detail:"'Husayn is from me and I am from Husayn.' Refused allegiance to Yazid. Martyred at Karbala on Ashura with 72 companions. 'Every day is Ashura, every land is Karbala.'",
    ashaab: [
      { id:"habib", short:"Habib ibn Mazahir (RA)", label:"Habib ibn Mazahir al-Asadi (RA)", arabic:"حبيب بن مظاهر الأسدي",
        role:"Elder of Karbala · Companion of 3 Imams",
        birthAH:1, deathAH:61, deathType:"martyrdom", shrine:"Karbala, Iraq",
        detail:"Companion of Imams Ali, Hasan, and Husayn (AS). One of the most senior companions at Karbala, joining at the last moment and rallying members of the Bani Asad tribe. Among the most beloved martyrs of Karbala." },
      { id:"muslim_aqeel", short:"Muslim ibn Aqeel (RA)", label:"Muslim ibn Aqeel ibn Abi Talib (AS)", arabic:"مسلم بن عقيل",
        role:"Ambassador of Imam Husayn (AS) to Kufa",
        birthAH:18, deathAH:60, deathType:"martyrdom", shrine:"Kufa, Iraq",
        detail:"Cousin of Imam Husayn (AS) and his first emissary to Kufa. 18,000 Kufans pledged allegiance through him. When Ibn Ziyad arrived, the people abandoned him. Betrayed, captured, and martyred on 9 Dhul Hijja 60 AH — one month before Karbala." },
      { id:"hurr", short:"Hurr ibn Yazid al-Riyahi (RA)", label:"Hurr ibn Yazid al-Riyahi (RA)", arabic:"الحر بن يزيد الرياحي",
        role:"The Redeemed Commander — from oppressor to martyr",
        birthAH:20, deathAH:61, deathType:"martyrdom", shrine:"Karbala, Iraq",
        detail:"Commander in the Umayyad army sent to intercept Imam Husayn (AS). On the morning of Ashura, his conscience overcame him. He rode to Imam Husayn (AS), confessed, and asked forgiveness. The Imam accepted him. He was among the first martyred — his repentance is one of the most powerful moments of Karbala." },
      { id:"zuhayr", short:"Zuhayr ibn Qayn (RA)", label:"Zuhayr ibn Qayn al-Bajali (RA)", arabic:"زهير بن القين البجلي",
        role:"Karbala martyr · Transformed by a single meeting",
        birthAH:15, deathAH:61, deathType:"martyrdom", shrine:"Karbala, Iraq",
        detail:"Initially not a follower of Imam Husayn (AS), he met him while returning from Hajj. That single meeting transformed him. He joined the caravan to Karbala, fought valiantly on Ashura, and was martyred. He told his wife to be proud — 'I am with the grandson of the Prophet ﷺ.'" },
      { id:"burayr", short:"Burayr ibn Khudayr (RA)", label:"Burayr ibn Khudayr al-Hamdani (RA)", arabic:"بريرة بن خضير الهمداني",
        role:"Scholar and Qari of Kufa · Martyr of Karbala",
        birthAH:12, deathAH:61, deathType:"martyrdom", shrine:"Karbala, Iraq",
        detail:"A renowned Quran reciter and scholar of Kufa who came to Karbala to defend Imam Husayn (AS). He was known for his piety and knowledge. On the night before Ashura he was seen smiling and laughing, saying he was happy to meet the Prophet ﷺ the next day." },
    ]
  },
  {
    id:"sajjad", short:"Imam Sajjad (AS)", label:"Imam Ali Zayn al-Abidin (AS)",
    arabic:"علي زين العابدين عليه السلام", role:"4th Imam · Zayn al-Abidin",
    imamNo:4,
    birthAH:38, birthH:"5 Sha'ban, 38 AH", birthCE:"659 CE",
    deathAH:95, deathH:"25 Muharram, 95 AH", deathCE:"713 CE",
    deathType:"martyrdom", age:57, shrine:"Jannat al-Baqi, Medina",
    detail:"Present at Karbala, too ill to fight — his survival preserved the Imamate lineage. Al-Sahifa al-Sajjadiyya ('Psalms of the Ahl al-Bayt') is his enduring legacy. Martyred by poison on orders of Caliph al-Walid.",
    ashaab: [
      { id:"abuhamza", short:"Abu Hamza al-Thumali (RA)", label:"Abu Hamza al-Thumali (RA)", arabic:"أبو حمزة الثمالي",
        role:"Narrator of Du'a Abu Hamza al-Thumali",
        birthAH:47, deathAH:150, deathType:"wafat", shrine:"Kufa, Iraq",
        detail:"Devoted companion of Imams Sajjad, Baqir, and Sadiq (AS). Narrator of the famous Du'a Abu Hamza al-Thumali — one of the most beloved Ramadan supplications, taught to him by Imam Sajjad (AS)." },
      { id:"said_jubayr", short:"Said ibn Jubayr (RA)", label:"Said ibn Jubayr (RA)", arabic:"سعيد بن جبير",
        role:"Martyr of knowledge · Executed by Hajjaj",
        birthAH:45, deathAH:95, deathType:"martyrdom", shrine:"Wasit, Iraq",
        detail:"One of the great scholars of Medina and a devoted follower of Imam Sajjad (AS). He was captured and executed by the tyrant Hajjaj ibn Yusuf al-Thaqafi for his loyalty to the Ahl al-Bayt. His last words were a prayer against Hajjaj, who died shortly after." },
      { id:"yahya_umm", short:"Yahya ibn Umm al-Tawil (RA)", label:"Yahya ibn Umm al-Tawil (RA)", arabic:"يحيى بن أم الطويل",
        role:"Devoted companion of Imam Sajjad (AS)",
        birthAH:40, deathAH:84, deathType:"martyrdom", shrine:"Kufa, Iraq",
        detail:"A devoted companion of Imam Sajjad (AS) who openly declared his love for the Ahl al-Bayt in the hostile Umayyad era. He was arrested and martyred for his refusal to disown the Imams. Imam Sajjad (AS) praised him greatly." },
    ]
  },
  {
    id:"baqir", short:"Imam Baqir (AS)", label:"Imam Muhammad al-Baqir (AS)",
    arabic:"محمد الباقر عليه السلام", role:"5th Imam · Baqir al-Ulum",
    imamNo:5,
    birthAH:57, birthH:"1 Rajab, 57 AH", birthCE:"677 CE",
    deathAH:114, deathH:"7 Dhul Hijja, 114 AH", deathCE:"733 CE",
    deathType:"martyrdom", age:57, shrine:"Jannat al-Baqi, Medina",
    detail:"'Baqir al-Ulum' — Splitter of Knowledge — a title foretold by the Prophet ﷺ. Established a great school of Islamic sciences in Medina. Martyred by poison on orders of Caliph Hisham ibn Abd al-Malik.",
    ashaab: [
      { id:"zurarah_b", short:"Zurarah ibn A'yan (RA)", label:"Zurarah ibn A'yan (RA)", arabic:"زرارة بن أعين",
        role:"Chief jurist of the Imams · Thousands of narrations",
        birthAH:64, deathAH:150, deathType:"wafat", shrine:"Kufa, Iraq",
        detail:"One of the most prolific narrators of Shia hadith. Companion of both Imam al-Baqir (AS) and Imam al-Sadiq (AS). The Imams praised him as the foremost scholar of his time, though they occasionally criticized him publicly to protect him from Abbasid persecution." },
      { id:"muhammad_muslim", short:"Muhammad ibn Muslim (RA)", label:"Muhammad ibn Muslim al-Thaqafi (RA)", arabic:"محمد بن مسلم الثقفي",
        role:"Narrator of 30,000 hadith from Imams Baqir & Sadiq",
        birthAH:68, deathAH:150, deathType:"wafat", shrine:"Kufa, Iraq",
        detail:"One of the greatest transmitters of hadith — narrated approximately 30,000 traditions from Imam al-Baqir (AS) and Imam al-Sadiq (AS). He would sit at the door of the Imam for long periods, transmitting knowledge to the Shia community." },
      { id:"abubasir", short:"Abu Basir al-Asadi (RA)", label:"Abu Basir al-Asadi (RA)", arabic:"أبو بصير الأسدي",
        role:"Blind companion of Imams Baqir, Sadiq & Kadhim",
        birthAH:64, deathAH:150, deathType:"wafat", shrine:"Iraq",
        detail:"Despite being blind, Abu Basir was one of the most trusted companions of the Imams, transmitting hadith from Imam al-Baqir (AS) through Imam al-Kadhim (AS). The Imams relied on him to convey their teachings across the Shia community in Kufa." },
      { id:"jabir_jufi", short:"Jabir al-Ju'fi (RA)", label:"Jabir ibn Yazid al-Ju'fi (RA)", arabic:"جابر بن يزيد الجعفي",
        role:"Narrator of 70,000 hadith",
        birthAH:50, deathAH:128, deathType:"wafat", shrine:"Kufa, Iraq",
        detail:"Transmitted thousands of hadiths from Imam al-Baqir (AS). The Imam reportedly told him 70,000 traditions. To protect him from Abbasid persecution, Imam al-Baqir (AS) instructed him to feign madness. A pillar of early Shia transmission." },
      { id:"burayd", short:"Burayd ibn Muawiyah (RA)", label:"Burayd ibn Muawiyah al-Ijli (RA)", arabic:"بريد بن معاوية العجلي",
        role:"Trusted jurist of Imams Baqir & Sadiq",
        birthAH:68, deathAH:150, deathType:"wafat", shrine:"Kufa, Iraq",
        detail:"A leading jurist and trusted companion of Imam al-Baqir (AS) and Imam al-Sadiq (AS). The Imams trusted him to issue fatwas (religious rulings) independently in the absence of direct guidance — a very rare honor given to only a handful of companions." },
    ]
  },
  {
    id:"sadiq", short:"Imam Sadiq (AS)", label:"Imam Ja'far al-Sadiq (AS)",
    arabic:"جعفر الصادق عليه السلام", role:"6th Imam · al-Sadiq",
    imamNo:6,
    birthAH:83, birthH:"17 Rabi al-Awwal, 83 AH", birthCE:"702 CE",
    deathAH:148, deathH:"25 Shawwal, 148 AH", deathCE:"765 CE",
    deathType:"martyrdom", age:65, shrine:"Jannat al-Baqi, Medina",
    detail:"Over 4,000 students including Abu Hanifa and Malik ibn Anas. The Ja'fari school of jurisprudence is named after him. Contributed to chemistry, astronomy, and Islamic philosophy. Martyred by poison on orders of Caliph al-Mansur.",
    ashaab: [
      { id:"hisham_sadiq", short:"Hisham ibn al-Hakam (RA)", label:"Hisham ibn al-Hakam (RA)", arabic:"هشام بن الحكم",
        role:"Foremost theologian · 'Heart, tongue & hand support us'",
        birthAH:105, deathAH:179, deathType:"wafat", shrine:"Baghdad, Iraq",
        detail:"The greatest Shia theologian and debater of his era. Companion of Imams al-Sadiq (AS) and al-Kadhim (AS). Defended Shia theology in public debates with Mu'tazilites and Sunni scholars. Imam al-Sadiq (AS) said: 'Hisham's heart, tongue, and hand support us.'" },
      { id:"mufaddal", short:"Mufaddal ibn Umar (RA)", label:"Mufaddal ibn Umar al-Ju'fi (RA)", arabic:"المفضل بن عمر الجعفي",
        role:"'Tawhid of Mufaddal' dictated by Imam Sadiq (AS)",
        birthAH:90, deathAH:179, deathType:"wafat", shrine:"Kufa, Iraq",
        detail:"A devoted companion of Imam al-Sadiq (AS). The Imam dictated to him the famous treatise 'Tawhid al-Mufaddal' — a profound exposition of divine unity through the wonders of creation — over four sittings. He served as a trusted liaison between the Imam and the Shia community." },
      { id:"mumin_taq", short:"Mumin al-Taq (RA)", label:"Muhammad ibn Ali ibn al-Nu'man (RA)", arabic:"محمد بن علي بن النعمان — مؤمن الطاق",
        role:"Master debater of Shia theology",
        birthAH:100, deathAH:160, deathType:"wafat", shrine:"Kufa, Iraq",
        detail:"Known as 'Mumin al-Taq' and 'Sahib al-Taq' (the man of the arch, a market district of Kufa). A master debater of Shia theology who engaged and defeated prominent Mu'tazilite and Murji'i scholars. Deeply trusted by Imam al-Sadiq (AS)." },
      { id:"zurarah_s", short:"Zurarah ibn A'yan (RA)", label:"Zurarah ibn A'yan (RA)", arabic:"زرارة بن أعين",
        role:"Chief Shia jurist of his era",
        birthAH:64, deathAH:150, deathType:"wafat", shrine:"Kufa, Iraq",
        detail:"Also a leading companion of Imam al-Sadiq (AS). Imam al-Sadiq (AS) said: 'Were it not for Zurarah, the traditions of my father would have been lost.' A principal architect of Shia jurisprudence." },
      { id:"abubasir_s", short:"Abu Basir (RA)", label:"Abu Basir al-Muradi (RA)", arabic:"أبو بصير المرادي",
        role:"Trusted narrator of Imam Sadiq (AS)",
        birthAH:75, deathAH:150, deathType:"wafat", shrine:"Kufa, Iraq",
        detail:"One of the four most trusted narrators ('Ashab al-Ijma') of Imam al-Sadiq (AS). His narrations form a significant part of the Shia hadith corpus. He was blind yet served the Imam with extraordinary dedication." },
    ]
  },
  {
    id:"kadhim", short:"Imam Kadhim (AS)", label:"Imam Musa al-Kadhim (AS)",
    arabic:"موسى الكاظم عليه السلام", role:"7th Imam · Bab al-Hawayij",
    imamNo:7,
    birthAH:128, birthH:"7 Safar, 128 AH", birthCE:"745 CE",
    deathAH:183, deathH:"25 Rajab, 183 AH", deathCE:"799 CE",
    deathType:"martyrdom", age:55, shrine:"Kadhimiya, Baghdad, Iraq",
    detail:"'Al-Kadhim' — named for patience under Abbasid oppression. Spent years imprisoned under Harun al-Rashid. Martyred by poison in Baghdad. Known as Bab al-Hawayij (Gate of Needs).",
    ashaab: [
      { id:"hisham_k", short:"Hisham ibn al-Hakam (RA)", label:"Hisham ibn al-Hakam (RA)", arabic:"هشام بن الحكم",
        role:"Chief theologian of Imam Kadhim (AS)",
        birthAH:105, deathAH:179, deathType:"wafat", shrine:"Baghdad, Iraq",
        detail:"Continued his role as chief Shia theologian under Imam al-Kadhim (AS). Was eventually forced into hiding after Harun al-Rashid's persecution intensified following the imprisonment of the Imam." },
      { id:"ali_yaqtin", short:"Ali ibn Yaqtin (RA)", label:"Ali ibn Yaqtin (RA)", arabic:"علي بن يقطين",
        role:"Secret Shia minister in the Abbasid court",
        birthAH:124, deathAH:182, deathType:"wafat", shrine:"Baghdad, Iraq",
        detail:"A minister in the Abbasid court who secretly followed Imam al-Kadhim (AS). He used his position to protect Shia Muslims and channel resources to the Imam. The Imam guided him on how to navigate court life without compromising his faith." },
      { id:"safwan_k", short:"Safwan ibn Yahya (RA)", label:"Safwan ibn Yahya al-Bajali (RA)", arabic:"صفوان بن يحيى البجلي",
        role:"Most trusted agent of Imams Kadhim, Ridha & Jawad",
        birthAH:140, deathAH:210, deathType:"wafat", shrine:"Kufa, Iraq",
        detail:"Considered the most trustworthy companion of three consecutive Imams. He refused to rent his camels to Harun al-Rashid's expeditions, choosing poverty over complicity. The Imams publicly praised his trustworthiness and reliability." },
      { id:"abd_jundab", short:"Abd Allah ibn Jundab (RA)", label:"Abd Allah ibn Jundab al-Bajali (RA)", arabic:"عبدالله بن جندب",
        role:"Devoted worshipper and companion",
        birthAH:130, deathAH:200, deathType:"wafat", shrine:"Iraq",
        detail:"A companion renowned for his extreme devotion and worship. Imam al-Kadhim (AS) praised him as one of his most beloved companions. Known for his long prayers and frequent weeping in devotion to the Ahl al-Bayt." },
    ]
  },
  {
    id:"ridha", short:"Imam Ridha (AS)", label:"Imam Ali al-Ridha (AS)",
    arabic:"علي الرضا عليه السلام", role:"8th Imam · al-Ridha",
    imamNo:8,
    birthAH:148, birthH:"11 Dhul Qa'da, 148 AH", birthCE:"765 CE",
    deathAH:203, deathH:"17 Safar, 203 AH", deathCE:"818 CE",
    deathType:"martyrdom", age:55, shrine:"Mashhad, Iran",
    detail:"Forced by Caliph Ma'mun to be designated heir apparent. His shrine in Mashhad draws millions annually. Martyred by poisoned grapes by Caliph Ma'mun.",
    ashaab: [
      { id:"yunus", short:"Yunus ibn Abd al-Rahman (RA)", label:"Yunus ibn Abd al-Rahman (RA)", arabic:"يونس بن عبدالرحمن",
        role:"Chief theologian of Imam Ridha (AS)",
        birthAH:140, deathAH:208, deathType:"wafat", shrine:"Iraq",
        detail:"One of the most important Shia scholars and theologians. Imam al-Ridha (AS) compared him to Salman al-Farsi in terms of his station. He collected and organized a large body of Shia hadith and theological positions." },
      { id:"safwan_r", short:"Safwan ibn Yahya (RA)", label:"Safwan ibn Yahya (RA)", arabic:"صفوان بن يحيى",
        role:"Trustworthy agent of 3 Imams",
        birthAH:140, deathAH:210, deathType:"wafat", shrine:"Kufa, Iraq",
        detail:"The most trusted companion across three Imamates (Kadhim, Ridha, Jawad). Imam al-Ridha (AS) relied heavily on him to manage communications with the dispersed Shia community across the caliphate." },
      { id:"ibn_abi_nasr", short:"Ibn Abi Nasr al-Bazanti (RA)", label:"Ahmad ibn Muhammad al-Bazanti (RA)", arabic:"أحمد بن محمد البزنطي",
        role:"Jurist · Author of al-Jami'",
        birthAH:155, deathAH:221, deathType:"wafat", shrine:"Iraq",
        detail:"A leading jurist and close companion of Imam al-Ridha (AS) and Imam al-Jawad (AS). Author of the famous jurisprudence text 'al-Jami'. He had direct access to the Imams and transmitted their rulings on complex fiqh questions." },
      { id:"zakariyya_adam", short:"Zakariyya ibn Adam (RA)", label:"Zakariyya ibn Adam al-Qummi (RA)", arabic:"زكريا بن آدم القمي",
        role:"Trusted representative of Imam Ridha (AS) in Qum",
        birthAH:155, deathAH:220, deathType:"wafat", shrine:"Qum, Iran",
        detail:"The trusted representative of Imam al-Ridha (AS) in the city of Qum. The Imam authorized him to act as his agent and answer religious questions for the people. His presence in Qum contributed greatly to the city's development as a centre of Shia scholarship." },
    ]
  },
  {
    id:"jawad", short:"Imam Jawad (AS)", label:"Imam Muhammad al-Jawad (AS)",
    arabic:"محمد الجواد عليه السلام", role:"9th Imam · al-Taqi",
    imamNo:9,
    birthAH:195, birthH:"10 Rajab, 195 AH", birthCE:"811 CE",
    deathAH:220, deathH:"29 Dhul Qa'da, 220 AH", deathCE:"835 CE",
    deathType:"martyrdom", age:25, shrine:"Kadhimiya, Baghdad, Iraq",
    detail:"Became Imam at ~8 years old. His profound wisdom proved Imamate is divine appointment. Youngest Imam to be martyred. Poisoned by Caliph al-Mu'tasim.",
    ashaab: [
      { id:"ali_mahziyar", short:"Ali ibn Mahziyar (RA)", label:"Ali ibn Mahziyar al-Ahwazi (RA)", arabic:"علي بن مهزيار الأهوازي",
        role:"Chief agent (wakil) of Imam Jawad (AS)",
        birthAH:175, deathAH:250, deathType:"wafat", shrine:"Ahwaz, Iran",
        detail:"The most important agent (wakil) and companion of Imam al-Jawad (AS), continuing his service into the early Imamate of Imam al-Hadi (AS). He managed the Imam's financial and organizational affairs across the dispersed Shia community. A prolific narrator of hadith." },
      { id:"bazanti_j", short:"Ahmad al-Bazanti (RA)", label:"Ahmad ibn Muhammad al-Bazanti (RA)", arabic:"أحمد بن محمد البزنطي",
        role:"Jurist and trusted companion",
        birthAH:155, deathAH:221, deathType:"wafat", shrine:"Iraq",
        detail:"Continued his role as a trusted jurist under Imam al-Jawad (AS). Among the handful of companions who had direct personal contact with the young Imam and attested to his extraordinary wisdom from a very early age." },
      { id:"abd_azim", short:"Abd al-Azim al-Hasani (RA)", label:"Abd al-Azim ibn Abd Allah al-Hasani (RA)", arabic:"عبدالعظيم الحسني",
        role:"Descendant of Imam Hasan (AS) · Companion of Imams 9–10",
        birthAH:173, deathAH:252, deathType:"wafat", shrine:"Ray (Tehran), Iran",
        detail:"A descendant of Imam Hasan (AS) and a devoted companion of Imams al-Jawad (AS) and al-Hadi (AS). He fled Abbasid persecution and settled in Ray (near modern Tehran). His shrine there is a major pilgrimage site known as 'Shah Abd al-Azim'." },
    ]
  },
  {
    id:"hadi", short:"Imam Hadi (AS)", label:"Imam Ali al-Hadi (AS)",
    arabic:"علي الهادي عليه السلام", role:"10th Imam · al-Askari",
    imamNo:10,
    birthAH:212, birthH:"15 Dhul Hijja, 212 AH", birthCE:"827 CE",
    deathAH:254, deathH:"3 Rajab, 254 AH", deathCE:"868 CE",
    deathType:"martyrdom", age:42, shrine:"Samarra, Iraq",
    detail:"Forced by Caliph al-Mutawakkil to Samarra — 20+ years of house arrest. Martyred by poison. Shrine shared with his son Imam Askari (AS).",
    ashaab: [
      { id:"abd_azim_h", short:"Abd al-Azim al-Hasani (RA)", label:"Abd al-Azim al-Hasani (RA)", arabic:"عبدالعظيم الحسني",
        role:"Companion and narrator of Imam Hadi (AS)",
        birthAH:173, deathAH:252, deathType:"wafat", shrine:"Ray (Tehran), Iran",
        detail:"Continued his devotion under Imam al-Hadi (AS) after Imam al-Jawad's (AS) martyrdom. He presented his religious beliefs to the Imam who confirmed their correctness — a remarkable endorsement. Fled to Ray to escape Abbasid persecution." },
      { id:"uthman_hadi", short:"Uthman ibn Said (RA)", label:"Uthman ibn Said al-Askari (RA)", arabic:"عثمان بن سعيد العسكري",
        role:"Future 1st Deputy · Trusted agent of Imam Hadi (AS)",
        birthAH:230, deathAH:265, deathType:"wafat", shrine:"Baghdad, Iraq",
        detail:"Served Imam al-Hadi (AS) from a young age before becoming the Imam's primary agent. He went on to serve Imam al-Askari (AS) and became the first of the four deputies of Imam al-Mahdi (AJ) during the Minor Occultation." },
      { id:"ayub_nuh", short:"Ayyub ibn Nuh (RA)", label:"Ayyub ibn Nuh ibn Darraj (RA)", arabic:"أيوب بن نوح",
        role:"Trusted agent of Imams Hadi & Askari",
        birthAH:205, deathAH:260, deathType:"wafat", shrine:"Iraq",
        detail:"One of the most trusted agents of Imam al-Hadi (AS) and Imam al-Askari (AS). He managed the collection and distribution of religious dues (khums) for the Imams under extremely difficult surveillance conditions in Samarra." },
    ]
  },
  {
    id:"askari", short:"Imam Askari (AS)", label:"Imam Hasan al-Askari (AS)",
    arabic:"الحسن العسكري عليه السلام", role:"11th Imam · al-Askari",
    imamNo:11,
    birthAH:232, birthH:"8 Rabi al-Thani, 232 AH", birthCE:"846 CE",
    deathAH:260, deathH:"8 Rabi al-Awwal, 260 AH", deathCE:"874 CE",
    deathType:"martyrdom", age:28, shrine:"Samarra, Iraq",
    detail:"Kept the birth of his son (12th Imam) secret. 6-year Imamate ended with martyrdom at age 28 by Caliph al-Mu'tamid.",
    ashaab: [
      { id:"uthman_askari", short:"Uthman ibn Said (RA)", label:"Uthman ibn Said al-Askari (RA)", arabic:"عثمان بن سعيد العسكري",
        role:"Chief agent of Imam Askari (AS) · 1st Deputy of Imam Mahdi (AJ)",
        birthAH:230, deathAH:265, deathType:"wafat", shrine:"Baghdad, Iraq",
        detail:"The primary agent of Imam al-Askari (AS) and the trusted guardian of the secret of the 12th Imam's birth. Became the first deputy of Imam al-Mahdi (AJ) upon the Imam's entrance into the Minor Occultation in 260 AH." },
      { id:"abu_hashim", short:"Abu Hashim al-Ja'fari (RA)", label:"Abu Hashim Dawud al-Ja'fari (RA)", arabic:"أبو هاشم الجعفري",
        role:"Close companion of Imams Hadi & Askari",
        birthAH:200, deathAH:261, deathType:"wafat", shrine:"Iraq",
        detail:"A descendant of Imam Ja'far al-Sadiq (AS) and a devoted companion of both Imam al-Hadi (AS) and Imam al-Askari (AS). He had direct personal access to the Imams in Samarra and transmitted many hadith about their lives under Abbasid surveillance." },
      { id:"ahmad_ishaq", short:"Ahmad ibn Ishaq al-Qummi (RA)", label:"Ahmad ibn Ishaq al-Ash'ari al-Qummi (RA)", arabic:"أحمد بن إسحاق الأشعري القمي",
        role:"Representative of Imam Askari (AS) in Qum",
        birthAH:222, deathAH:260, deathType:"wafat", shrine:"Qum, Iran",
        detail:"The chief of the Shia community in Qum and representative of Imam al-Askari (AS). He is known for narrating a famous hadith in which the Imam introduced his son — the future 12th Imam — to him, confirming the continuation of the Imamate." },
    ]
  },
  {
    id:"mahdi", short:"Imam al-Mahdi (AJ)", label:"Imam Muhammad al-Mahdi (AJ)",
    arabic:"محمد المهدي عجل الله فرجه", role:"12th Imam · Sahib al-Zaman",
    imamNo:12,
    birthAH:255, birthH:"15 Sha'ban, 255 AH", birthCE:"869 CE",
    deathAH:null, deathH:"In Major Occultation — 329 AH onwards", deathCE:"941 CE –",
    deathType:"occultation", age:null, shrine:"In Occultation (عج)",
    detail:"Born secretly in Samarra. Minor Occultation (260–329 AH) via four deputies. Major Occultation began 329 AH. He is alive and will reappear (Zuhur) to fill the world with justice.",
    ashaab: [
      { id:"dep1", short:"Uthman ibn Said (1st) (RA)", label:"Uthman ibn Said al-Askari — 1st Deputy", arabic:"عثمان بن سعيد — النائب الأول",
        role:"1st of 4 Special Deputies · ~260–265 AH",
        birthAH:230, deathAH:265, deathType:"wafat", shrine:"Baghdad, Iraq",
        detail:"First of the four special deputies (Nawwab al-Arba'a). Had served Imam al-Hadi (AS) and Imam al-Askari (AS) and was trusted by the 12th Imam to be his first representative during the Minor Occultation." },
      { id:"dep2", short:"Muhammad ibn Uthman (2nd) (RA)", label:"Muhammad ibn Uthman al-Askari — 2nd Deputy", arabic:"محمد بن عثمان — النائب الثاني",
        role:"2nd Deputy · Longest tenure ~265–305 AH",
        birthAH:248, deathAH:305, deathType:"wafat", shrine:"Baghdad, Iraq",
        detail:"Son of the 1st deputy. Served approximately 40 years — the longest among the four deputies. Received letters directly from Imam al-Mahdi (AJ) and relayed them to the community." },
      { id:"dep3", short:"Husayn ibn Ruh (3rd) (RA)", label:"Husayn ibn Ruh al-Nawbakhti — 3rd Deputy", arabic:"الحسين بن روح — النائب الثالث",
        role:"3rd Deputy · ~305–326 AH",
        birthAH:260, deathAH:326, deathType:"wafat", shrine:"Baghdad, Iraq",
        detail:"Third deputy. Politically astute, maintained the Shia network in Baghdad under Abbasid pressure. Served ~21 years with great wisdom and discretion." },
      { id:"dep4", short:"Ali ibn Muhammad (4th — Final) (RA)", label:"Ali ibn Muhammad al-Samarri — 4th & Final Deputy", arabic:"علي بن محمد السمري — النائب الرابع",
        role:"4th & Final Deputy · ~326–329 AH",
        birthAH:280, deathAH:329, deathType:"wafat", shrine:"Baghdad, Iraq",
        detail:"Received a final letter from the Imam six days before his death announcing the Major Occultation. His death on 15 Sha'ban 329 AH ended the Minor Occultation and began the Ghaybat al-Kubra." },
    ]
  },
];

// ─────────────────────────────────────────────────────────────
//  FAMILY (Ahl al-Bayt & household personalities)
// ─────────────────────────────────────────────────────────────
const FAMILY = [
  {
    id:"abdulmuttalib", short:"H. Abd al-Muttalib (SA)", label:"Abd al-Muttalib ibn Hashim",
    arabic:"عبد المطلب بن هاشم", role:"Grandfather & Guardian of the Holy Prophet ﷺ",
    birthAH:-126, birthH:"~126 BH (c. 496 CE)", birthCE:"~496 CE",
    deathAH:-44, deathH:"~44 BH (c. 578 CE)", deathCE:"~578 CE",
    deathType:"wafat", age:82, shrine:"Jannat al-Mu'alla, Mecca",
    detail:"Grandfather of the Holy Prophet ﷺ and chief of the Banu Hashim clan. He rediscovered the Zamzam well and was the guardian of the Kaaba. He raised the Prophet ﷺ after the passing of his parents and grandfather was the one who named him 'Muhammad.' He died when the Prophet ﷺ was about 8 years old. Shia tradition affirms he was a monotheist and was upon the religion of Ibrahim (AS).",
  },
  {
    id:"fatimabinteasad", short:"J. Fatimah binte Asad (SA)", label:"Sayyida Fatimah binte Asad (SA)",
    arabic:"فاطمة بنت أسد عليها السلام", role:"Mother of Imam Ali (AS) · Like a Mother to the Prophet ﷺ",
    birthAH:-75, birthH:"~75 BH (c. 547 CE)", birthCE:"~547 CE",
    deathAH:4, deathH:"~4 AH (c. 626 CE)", deathCE:"~626 CE",
    deathType:"wafat", age:null, shrine:"Jannat al-Baqi, Medina",
    detail:"Wife of Abu Talib and mother of Imam Ali (AS). She was like a second mother to the Holy Prophet ﷺ — she took him in after the passing of his grandfather Abd al-Muttalib and raised him alongside her own children. When she passed away, the Prophet ﷺ gave her his own shirt as a burial shroud and personally helped lower her into her grave — a unique and extraordinary honour he gave to no one else.",
  },
  {
    id:"abutalib", short:"H. Abu Talib (SA)", label:"Abu Talib ibn Abd al-Muttalib",
    arabic:"أبو طالب عليه السلام", role:"Guardian & Protector of the Prophet ﷺ · Father of Imam Ali (AS)",
    birthAH:-89, birthH:"~89 BH (c. 533 CE)", birthCE:"~533 CE",
    deathAH:-3, deathH:"~3 BH, 619 CE", deathCE:"619 CE",
    deathType:"wafat", age:86, shrine:"Jannat al-Mu'alla, Mecca",
    detail:"Uncle, guardian, and lifelong protector of the Holy Prophet ﷺ. Father of Imam Ali (AS). He shielded the Prophet ﷺ from Qurayshi persecution for decades. His passing — same year as Sayyida Khadijah (SA) — plunged the Prophet ﷺ into the Year of Sorrow. Shia scholars affirm his Islam. His support was so vital that the revelation of new hardships against Muslims was withheld during his lifetime.",
  },
  {
    id:"khadijah", short:"J. Khadijah (SA)", label:"Sayyida Khadijah al-Kubra (SA)",
    arabic:"خديجة الكبرى سلام الله عليها", role:"Umm al-Mu'minin · First Muslim",
    birthAH:-68, birthH:"~68 BH (c. 556 CE)", birthCE:"~556 CE",
    deathAH:-3,  deathH:"10 Ramadan, 10 BH", deathCE:"619 CE",
    deathType:"wafat", age:65, shrine:"Jannat al-Mu'alla, Mecca",
    detail:"First wife of the Holy Prophet ﷺ and the first person to embrace Islam. A respected businesswoman of Mecca who proposed marriage to the Prophet ﷺ. Stood by him through the most difficult years of prophethood. Her passing in the same year as Abu Talib prompted the Prophet ﷺ to name it 'Am al-Huzn' (Year of Sorrow). The Prophet ﷺ never ceased to revere her.",
  },
  {
    id:"hamza", short:"J. Hamza (SA)", label:"Hamza ibn Abd al-Muttalib (AS)",
    arabic:"حمزة بن عبد المطلب عليه السلام", role:"Sayyid al-Shuhada (of Uhud) · Lion of Allah",
    birthAH:-55, birthH:"~55 BH (c. 568 CE)", birthCE:"~568 CE",
    deathAH:3, deathH:"Shawwal, 3 AH — Battle of Uhud", deathCE:"625 CE",
    deathType:"martyrdom", age:57, shrine:"Uhud, Medina",
    detail:"Uncle of the Holy Prophet ﷺ and one of the most powerful early defenders of Islam. Known as the 'Lion of Allah' and 'Sayyid al-Shuhada' (Master of Martyrs). He was martyred at the Battle of Uhud by Wahshi ibn Harb on the order of Hind bint Utba, who mutilated his body. The Prophet ﷺ wept greatly at his martyrdom.",
  },
  {
    id:"jafar_tayyar", short:"H. Ja'far al-Tayyar (SA)", label:"Ja'far ibn Abi Talib — Ja'far al-Tayyar (AS)",
    arabic:"جعفر بن أبي طالب الطيار عليه السلام", role:"Ja'far al-Tayyar (The Flying One) · Martyr of Mu'ta",
    birthAH:-33, birthH:"~33 BH (c. 589 CE)", birthCE:"~589 CE",
    deathAH:8, deathH:"Jumadi al-Awwal, 8 AH — Battle of Mu'ta", deathCE:"629 CE",
    deathType:"martyrdom", age:41, shrine:"Mu'ta, Jordan",
    detail:"Brother of Imam Ali (AS) and cousin of the Prophet ﷺ. He led the Muslims' migration to Abyssinia where his speech to the Negus won protection for the early Muslims. Commander at the Battle of Mu'ta against the Byzantine Empire where he was martyred. The Prophet ﷺ said he had two wings of light to fly in paradise — hence 'al-Tayyar.'",
  },
  {
    id:"zaynab", short:"J. Zaynab (SA)", label:"Sayyida Zaynab binte Ali (SA)",
    arabic:"زينب بنت علي عليها السلام", role:"Heroine of Karbala · Aqeelat Bani Hashim",
    birthAH:6, birthH:"1 Sha'ban, 6 AH", birthCE:"628 CE",
    deathAH:62, deathH:"15 Rajab, 62 AH", deathCE:"682 CE",
    deathType:"wafat", age:56, shrine:"Damascus, Syria",
    detail:"Daughter of Imam Ali (AS) and Sayyida Fatimah (AS). Witnessed Karbala and was taken captive to Kufa and Damascus. Her historic khutba in the court of Yazid exposed the injustice of Karbala to the world. Called 'Aqeelat Bani Hashim' (The Wise Woman of Bani Hashim). Her eloquence preserved the message of Ashura for all of history.",
  },
  {
    id:"umm_kulthum", short:"J. Umm Kulthum (SA)", label:"Sayyida Umm Kulthum binte Ali (SA)",
    arabic:"أم كلثوم بنت علي عليها السلام", role:"Daughter of Imam Ali (AS) · Present at Karbala",
    birthAH:9, birthH:"~9 AH (c. 631 CE)", birthCE:"~631 CE",
    deathAH:68, deathH:"~68 AH (c. 688 CE)", deathCE:"After 680 CE",
    deathType:"wafat", age:null, shrine:"Cairo, Egypt (attributed)",
    detail:"Daughter of Imam Ali (AS) and Sayyida Fatimah al-Zahra (AS). Present at Karbala and taken captive alongside Sayyida Zaynab (SA). She was among the brave women who openly lamented Imam Husayn (AS) in the court of Yazid in Damascus, helping to expose the true nature of the tragedy.",
  },
  {
    id:"umm_banin", short:"J. Umm al-Banin (SA)", label:"Sayyida Umm al-Banin Fatimah al-Kilabiyya (SA)",
    arabic:"أم البنين فاطمة الكلابية سلام الله عليها", role:"Wife of Imam Ali (AS) · Mother of H. Abbas (AS)",
    birthAH:14, birthH:"~14 AH (c. 636 CE)", birthCE:"~636 CE",
    deathAH:64, deathH:"~64 AH (c. 684 CE)", deathCE:"~684 CE",
    deathType:"wafat", age:50, shrine:"Jannat al-Baqi, Medina",
    detail:"Second wife of Imam Ali (AS) after Sayyida Fatimah al-Zahra (AS). Mother of H. Abbas, H. Ja'far, H. Abdullah, and H. Uthman — all four of whom were martyred at Karbala. When she received news of Karbala, she cried out that all her sons were martyred and yet kept asking about Imam Husayn (AS). A model of devotion and sacrifice.",
  },
  {
    id:"abbas", short:"H. Abbas (SA)", label:"Hazrat Abbas ibn Ali al-Akbar (AS)",
    arabic:"العباس بن علي عليه السلام", role:"Qamar Bani Hashim · Standard-Bearer of Karbala",
    birthAH:26, birthH:"4 Sha'ban, 26 AH", birthCE:"647 CE",
    deathAH:61, deathH:"10 Muharram, 61 AH", deathCE:"680 CE",
    deathType:"martyrdom", age:34, shrine:"Karbala, Iraq",
    detail:"Son of Imam Ali (AS) and Umm al-Banin (SA). 'Qamar Bani Hashim' (Moon of Bani Hashim). Standard-bearer at Karbala. Fetched water for the children of Imam Husayn (AS) at the cost of both his arms before his martyrdom on the banks of the Euphrates. A timeless symbol of loyalty and sacrifice.",
  },
  {
    id:"aliakbar", short:"H. Ali Akbar (SA)", label:"Hazrat Ali Akbar ibn Husayn (AS)",
    arabic:"علي الأكبر بن الحسين عليه السلام", role:"Martyr of Karbala · Image of the Prophet ﷺ",
    birthAH:33, birthH:"11 Sha'ban, 33 AH", birthCE:"654 CE",
    deathAH:61, deathH:"10 Muharram, 61 AH", deathCE:"680 CE",
    deathType:"martyrdom", age:27, shrine:"Karbala, Iraq",
    detail:"Eldest son of Imam Husayn (AS). Narrations state he most resembled the Holy Prophet ﷺ in appearance, character, and speech. First among the Bani Hashim to be martyred at Karbala. Imam Husayn's (AS) grief at his son's martyrdom — crying 'O Allah, witness that I have surrendered to You a youth who resembled Your Prophet' — is among the most heart-rending moments of Ashura.",
  },
  {
    id:"qasim_hasan", short:"H. Qasim (SA)", label:"Qasim ibn Hasan ibn Ali (AS)",
    arabic:"القاسم بن الحسن عليه السلام", role:"Martyr of Karbala · 'Beauty of youth'",
    birthAH:47, birthH:"~47 AH (c. 667 CE)", birthCE:"~667 CE",
    deathAH:61, deathH:"10 Muharram, 61 AH", deathCE:"680 CE",
    deathType:"martyrdom", age:13, shrine:"Karbala, Iraq",
    detail:"Son of Imam Hasan (AS) and nephew of Imam Husayn (AS). Martyred at Karbala at a very young age (~13–14 years). When he sought permission to fight, Imam Husayn (AS) embraced him weeping. His youth and beauty at the time of martyrdom made his loss one of the most heart-rending at Karbala.",
  },
];

// ─────────────────────────────────────────────────────────────
//  EVENTS
// ─────────────────────────────────────────────────────────────
const EVENTS = [
  { id:"mabath",    ah:-12,  label:"Mab'ath ★",              hdate:"27 Rajab, 13 BH",       ce:"610 CE", color:"#F7E070", pri:3, row:0, arabic:"المبعث النبوي",
    detail:"The Holy Prophet ﷺ received the first Quranic revelation in Cave of Hira. Beginning of the 23-year prophetic mission." },
  { id:"huzn",      ah:-3,   label:"Year of Sorrow",          hdate:"3 BH",                  ce:"619 CE", color:"#9B84B0", pri:2, row:1, arabic:"عام الحزن",
    detail:"Sayyida Khadijah (SA) and Abu Talib both passed in the same year. The Prophet ﷺ named it Am al-Huzn." },
  { id:"miraj",     ah:-1,   label:"Isra wal Miraj ★",        hdate:"27 Rajab, 1 BH",        ce:"621 CE", color:"#F7E070", pri:3, row:2, arabic:"الإسراء والمعراج",
    detail:"The Prophet ﷺ was taken from Mecca to Jerusalem then ascended through the heavens." },
  { id:"laylat",    ah:1,    label:"Laylat al-Mabit",         hdate:"1 AH",                  ce:"622 CE", color:"#5EC48A", pri:1, row:3, arabic:"ليلة المبيت",
    detail:"Imam Ali (AS) slept in the Prophet’s bed to enable his migration, risking his own life." },
  { id:"hijra",     ah:1,    label:"Hijra ❖",                 hdate:"1 Muharram, 1 AH",      ce:"622 CE", color:"#7EB8C9", pri:3, row:1, arabic:"الهجرة النبوية",
    detail:"The Prophet ﷺ migrated from Mecca to Medina, beginning of the Hijri calendar." },
  { id:"badr",      ah:2,    label:"Badr",                    hdate:"17 Ramadan, 2 AH",      ce:"624 CE", color:"#E07B54", pri:1, row:1, arabic:"غزوة بدر",
    detail:"313 Muslims faced 1,000 Quraysh. Divine assistance and Imam Ali’s (AS) valor secured victory." },
  { id:"uhud",      ah:3,    label:"Uhud",                    hdate:"Shawwal, 3 AH",         ce:"625 CE", color:"#E07B54", pri:1, row:2, arabic:"غزوة أحد",
    detail:"Battle near Medina. H. Hamza (AS) was martyred. The Prophet ﷺ was injured." },
  { id:"khandaq",   ah:5,    label:"Khandaq",                 hdate:"5 AH",                  ce:"627 CE", color:"#E07B54", pri:1, row:3, arabic:"غزوة الخندق",
    detail:"Salman al-Farsi’s (RA) trench strategy repelled the confederate coalition." },
  { id:"hudayb",    ah:6,    label:"Hudaybiyyah",             hdate:"6 AH",                  ce:"628 CE", color:"#9B84B0", pri:1, row:0, arabic:"صلح الحديبية",
    detail:"Strategic peace treaty with Quraysh enabling Muslim expansion." },
  { id:"khaybar",   ah:7,    label:"Khaybar",                 hdate:"7 AH",                  ce:"629 CE", color:"#E07B54", pri:2, row:1, arabic:"فتح خيبر",
    detail:"Imam Ali (AS) conquered the fortress of Khaybar, fulfilling the prophetic declaration." },
  { id:"muta",      ah:8,    label:"Mu’ta",                   hdate:"8 AH",                  ce:"629 CE", color:"#E07B54", pri:1, row:2, arabic:"غزوة مؤتة",
    detail:"H. Ja’far al-Tayyar (AS) was martyred commanding the Muslim forces against the Byzantines." },
  { id:"fath",      ah:8.5,  label:"Fath Makkah",             hdate:"20 Ramadan, 8 AH",      ce:"630 CE", color:"#F7D060", pri:2, row:3, arabic:"فتح مكة",
    detail:"Near-bloodless conquest of Mecca. The Kaaba was purified of 360 idols." },
  { id:"hajjwada",  ah:10,   label:"Hajjat al-Wada",          hdate:"10 AH",                 ce:"632 CE", color:"#9B84B0", pri:2, row:1, arabic:"حجة الوداع",
    detail:"The Prophet’s final pilgrimage, attended by over 100,000 believers." },
  { id:"ghadeer",   ah:10,   label:"GHADEER ★",               hdate:"18 Dhul Hijja, 10 AH",  ce:"632 CE", color:"#F5C518", pri:3, row:3, arabic:"يوم الغدير",
    detail:"Man kuntu mawlahu fa-Aliyyun mawlahu. Explicit appointment of Imam Ali (AS) before 120,000 pilgrims." },
  { id:"saqifa",    ah:11,   label:"Saqifa",                  hdate:"11 AH",                 ce:"632 CE", color:"#C87878", pri:2, row:2, arabic:"سقيفة بني ساعدة",
    detail:"The gathering at Saqifa where Abu Bakr was selected as caliph while Imam Ali (AS) prepared the Prophet’s burial." },
  { id:"fadak",     ah:11,   label:"Fadak",                   hdate:"11 AH",                 ce:"632 CE", color:"#9B84B0", pri:2, row:3, arabic:"فدك",
    detail:"Sayyida Fatimah Zahra (AS) delivered her famous Fadakiyya sermon demanding the return of Fadak." },
  { id:"shura",     ah:23,   label:"Shura / Uthman",          hdate:"23 AH",                 ce:"644 CE", color:"#9B84B0", pri:1, row:0, arabic:"الشورى",
    detail:"The six-member shura committee selected Uthman, bypassing Imam Ali (AS) a second time." },
  { id:"uthman",    ah:35,   label:"Uthman Killed",           hdate:"35 AH",                 ce:"656 CE", color:"#C87878", pri:1, row:1, arabic:"مقتل عثمان",
    detail:"Uthman ibn Affan was killed. Imam Ali (AS) became caliph with massive popular support." },
  { id:"jamal",     ah:36,   label:"Jamal",                   hdate:"36 AH",                 ce:"656 CE", color:"#E07B54", pri:1, row:2, arabic:"وقعة الجمل",
    detail:"Battle near Basra. Imam Ali (AS) was victorious against Aisha, Talha and Zubayr." },
  { id:"siffin",    ah:37,   label:"Siffin",                  hdate:"Safar, 37 AH",          ce:"657 CE", color:"#E07B54", pri:1, row:3, arabic:"وقعة صفين",
    detail:"Imam Ali (AS) vs. Muawiyah. Qurans raised on spears to force arbitration." },
  { id:"nahrawan",  ah:38,   label:"Nahrawan",                hdate:"38 AH",                 ce:"658 CE", color:"#E07B54", pri:1, row:0, arabic:"معركة النهروان",
    detail:"Imam Ali (AS) defeated the Khawarij at Nahrawan." },
  { id:"treaty",    ah:41,   label:"Treaty of Hasan",         hdate:"41 AH",                 ce:"661 CE", color:"#9B84B0", pri:2, row:1, arabic:"صلح الإمام الحسن",
    detail:"Imam Hasan (AS) signed a peace treaty with Muawiyah to preserve Muslim lives." },
  { id:"hujr",      ah:51,   label:"Hujr ibn Adi",            hdate:"51 AH",                 ce:"671 CE", color:"#C87878", pri:1, row:2, arabic:"شهادة حجر بن عدي",
    detail:"Hujr ibn Adi (RA) and companions martyred by Muawiyah for refusing to curse Imam Ali (AS)." },
  { id:"yazid",     ah:60,   label:"Yazid Demands Bay'ah",    hdate:"60 AH",                 ce:"680 CE", color:"#C87878", pri:2, row:3, arabic:"مطالبة يزيد بالبيعة",
    detail:"Yazid demanded allegiance from Imam Husayn (AS). The Imam refused." },
  { id:"karbala",   ah:61,   label:"KARBALA ★★",              hdate:"10 Muharram, 61 AH",    ce:"680 CE", color:"#E63946", pri:3, row:0, arabic:"عاشوراء كربلاء",
    detail:"Imam Husayn (AS) and 72 companions martyred at Karbala. Women and children taken captive." },
  { id:"captives",  ah:62,   label:"Return of Captives",      hdate:"62 AH",                 ce:"681 CE", color:"#9B84B0", pri:1, row:1, arabic:"عودة السبايا",
    detail:"Sayyida Zaynab (AS) delivered her historic sermon in Kufa and Damascus." },
  { id:"harrah",    ah:63,   label:"Massacre of Harrah",      hdate:"63 AH",                 ce:"683 CE", color:"#C87878", pri:1, row:2, arabic:"وقعة الحرة",
    detail:"Yazid’s forces massacred the people of Medina for three days." },
  { id:"tawwabeen", ah:65,   label:"Tawwabeen",               hdate:"65 AH",                 ce:"684 CE", color:"#7EB8C9", pri:1, row:3, arabic:"حركة التوابين",
    detail:"The Penitents rose seeking redemption for abandoning Imam Husayn (AS)." },
  { id:"mukhtar",   ah:66,   label:"Mukhtar Uprising",        hdate:"66 AH",                 ce:"685 CE", color:"#7EB8C9", pri:2, row:0, arabic:"ثورة المختار",
    detail:"Mukhtar al-Thaqafi executed those responsible for Karbala." },
  { id:"zayd",      ah:122,  label:"Zayd ibn Ali Uprising",   hdate:"122 AH",                ce:"740 CE", color:"#7EB8C9", pri:1, row:1, arabic:"ثورة زيد بن علي",
    detail:"Zayd ibn Ali, son of Imam Sajjad (AS), rose against the Umayyads and was martyred." },
  { id:"yahya",     ah:125,  label:"Yahya ibn Zayd",          hdate:"125 AH",                ce:"743 CE", color:"#7EB8C9", pri:1, row:2, arabic:"استشهاد يحيى بن زيد",
    detail:"Yahya ibn Zayd continued his father’s uprising; his death accelerated Umayyad collapse." },
  { id:"umayyad",   ah:132,  label:"Fall of Umayyads",        hdate:"132 AH",                ce:"750 CE", color:"#F7D060", pri:2, row:3, arabic:"سقوط الدولة الأموية",
    detail:"The Abbasid Revolution ended Umayyad rule." },
  { id:"nafs",      ah:145,  label:"Nafs al-Zakiyya",         hdate:"145 AH",                ce:"762 CE", color:"#7EB8C9", pri:1, row:0, arabic:"ثورة النفس الزكية",
    detail:"Muhammad ibn Abd Allah al-Nafs al-Zakiyya rose against the Abbasids and was martyred." },
  { id:"kadhimimp", ah:179,  label:"Imam Kadhim Imprisoned",  hdate:"179 AH",                ce:"795 CE", color:"#C87878", pri:1, row:1, arabic:"سجن الإمام الكاظم",
    detail:"Imam Kadhim (AS) was imprisoned by Harun al-Rashid and martyred in prison in 183 AH." },
  { id:"ridhacp",   ah:201,  label:"Imam Ridha Crown Prince", hdate:"201 AH",                ce:"816 CE", color:"#9B84B0", pri:2, row:2, arabic:"ولاية عهد الإمام الرضا",
    detail:"Al-Mamun appointed Imam Ridha (AS) as crown prince under duress." },
  { id:"masuma",    ah:201,  label:"Sayyida Masuma in Qum",   hdate:"201 AH",                ce:"816 CE", color:"#5EC48A", pri:1, row:3, arabic:"وفاة السيدة المعصومة",
    detail:"Sayyida Fatimah al-Masuma (SA) passed away in Qum while journeying to Khorasan." },
  { id:"mutawakkil",ah:237,  label:"Mutawakkil Persecutes",   hdate:"237 AH",                ce:"851 CE", color:"#C87878", pri:1, row:0, arabic:"اضطهاد المتوكل",
    detail:"Mutawakkil demolished the shrine of Imam Husayn (AS) and persecuted Shia." },
  { id:"samarra",   ah:243,  label:"Imam Hadi to Samarra",    hdate:"243 AH",                ce:"857 CE", color:"#C87878", pri:1, row:1, arabic:"نقل الإمام الهادي",
    detail:"Mutawakkil forced Imam Hadi (AS) to relocate to Samarra for surveillance." },
  { id:"sughra",    ah:260,  label:"Minor Occultation",       hdate:"260 AH",                ce:"874 CE", color:"#9B7BC4", pri:2, row:2, arabic:"الغيبة الصغرى",
    detail:"Upon Imam al-Askari’s (AS) martyrdom, the 12th Imam entered the Minor Occultation." },
  { id:"kubra",     ah:329,  label:"MAJOR OCCULTATION ★",     hdate:"329 AH",                ce:"941 CE", color:"#7B5BC4", pri:3, row:3, arabic:"الغيبة الكبرى",
    detail:"Ali ibn Muhammad al-Samarri’s death ended the Minor Occultation. The Imam is hidden until the Zuhur." },
]

// ─────────────────────────────────────────────────────────────
//  MAIN COMPONENT
// ─────────────────────────────────────────────────────────────
export default function ShiaTimeline() {
  const vpRef    = useRef(null);
  const outerRef = useRef(null); // scrollable viewport
  const innerRef = useRef(null); // scaled inner canvas during pinch
  const [vpW, setVpW]         = useState(900);
  const [zoom, setZoom]       = useState(1);
  const [offset, setOffset]   = useState(0);
  const [sel, setSel]         = useState(null);
  const [expanded, setExpanded] = useState(new Set());
  const [filter, setFilter]   = useState("all");
  const drag   = useRef({ active:false, x0:0, y0:0, prevY:0, off0:0, dir:null });
  const pinch  = useRef({ active:false, d0:0, z0:1, pivot:0 });
  const handRef = useRef({}); // always-current state snapshot for imperative handlers
  const vel    = useRef({ vx:0, t:0, x:0, raf:null }); // momentum tracking
  const pendingScrollRef = useRef(null); // desired scrollLeft to apply after zoom re-render

  useEffect(()=>{
    // Use window.innerWidth (not vpRef DOM width) — the DOM width expands with content
    // and creates a circular measurement. window.innerWidth is always the true viewport.
    const m=()=>{
      const outerPad = 24; // mainLayout padding: 12px each side
      setVpW(Math.max(296, Math.min(window.innerWidth, 1280) - outerPad));
    };
    m(); window.addEventListener("resize",m);
    return ()=>window.removeEventListener("resize",m);
  },[]);

  const tlW   = vpW * zoom;
  const maxOff= Math.max(0, tlW - vpW);
  const clamp = useCallback(v=>Math.max(0,Math.min(v,maxOff)),[maxOff]);
  const xOf   = useCallback(ah=>((ah-MIN_AH)/SPAN)*tlW,[tlW]);
  // Keep handRef always current so imperative listeners always read latest values
  handRef.current = { offset, zoom, clamp, vpW };

  // After zoom renders (new tlW), apply the pending scroll position
  useLayoutEffect(()=>{
    if(pendingScrollRef.current!==null && outerRef.current){
      const sl=pendingScrollRef.current;
      outerRef.current.scrollLeft=sl;
      setOffset(sl);
      pendingScrollRef.current=null;
    }
  },[zoom]);

  // Zoom buttons
  function doZoom(dir, pivot){
    const p = pivot ?? vpW/2;
    const currSL = outerRef.current ? outerRef.current.scrollLeft : offset;
    setZoom(z=>{
      const nz = dir==="in" ? Math.min(z*1.6,14) : Math.max(z/1.6,1);
      const nMaxOff=Math.max(0,vpW*nz-vpW);
      pendingScrollRef.current=Math.max(0,Math.min(nMaxOff,(currSL+p)*(nz/z)-p));
      return nz;
    });
  }

  // Imperative wheel + touch listeners — registered ONCE, read current values via handRef
  // Horizontal panning sets el.scrollLeft directly (no React re-renders during gesture).
  // onScroll on the outer div keeps offset state in sync for rendering (evtLayout, labels).
  // Vertical scroll: touchAction:"pan-y" lets the browser handle it natively.
  useEffect(()=>{
    const el = outerRef.current;
    if(!el) return;

    const onWheel = e=>{
      const { zoom:z, vpW:w } = handRef.current;
      if(e.ctrlKey||e.metaKey){
        e.preventDefault();
        const pivot = e.clientX - el.getBoundingClientRect().left;
        const nz=e.deltaY<0?Math.min(z*1.6,14):Math.max(z/1.6,1);
        const nMaxOff=Math.max(0,w*nz-w);
        pendingScrollRef.current=Math.max(0,Math.min(nMaxOff,(el.scrollLeft+pivot)*(nz/z)-pivot));
        setZoom(nz);
      } else if(Math.abs(e.deltaX)>Math.abs(e.deltaY)*0.4){
        e.preventDefault();
        el.scrollLeft+=e.deltaX;
      }
    };

    const onTouchStart = e=>{
      cancelAnimationFrame(vel.current.raf); vel.current.vx=0;
      drag.current.active=false; pinch.current.active=false;
      if(e.touches.length===1){
        const t=e.touches[0];
        vel.current.x=t.clientX; vel.current.t=Date.now();
        drag.current={active:true,x0:t.clientX,y0:t.clientY,sl0:el.scrollLeft,dir:null};
      } else if(e.touches.length>=2){
        e.preventDefault();
        const t0=e.touches[0],t1=e.touches[1];
        const dx=t0.clientX-t1.clientX,dy=t0.clientY-t1.clientY;
        const d=Math.sqrt(dx*dx+dy*dy);
        const midX=(t0.clientX+t1.clientX)/2-el.getBoundingClientRect().left;
        pinch.current={active:true,d0:d,z0:handRef.current.zoom,pivot:midX,sl0:el.scrollLeft};
      }
    };

    const onTouchMove = e=>{
      if(e.touches.length>=2&&pinch.current.active){
        e.preventDefault();
        const t0=e.touches[0],t1=e.touches[1];
        const dx=t0.clientX-t1.clientX,dy=t0.clientY-t1.clientY;
        const d=Math.sqrt(dx*dx+dy*dy);
        const {vpW:w}=handRef.current;
        const nz=Math.max(1,Math.min(14,pinch.current.z0*(d/pinch.current.d0)));
        const pivot=pinch.current.pivot;
        const nMaxOff=Math.max(0,w*nz-w);
        pendingScrollRef.current=Math.max(0,Math.min(nMaxOff,(pinch.current.sl0+pivot)*(nz/pinch.current.z0)-pivot));
        setZoom(nz);
        return;
      }
      if(!drag.current.active||e.touches.length!==1) return;
      const t=e.touches[0];
      const dx=t.clientX-drag.current.x0, dy=t.clientY-drag.current.y0;
      if(!drag.current.dir){
        if(Math.abs(dx)<5&&Math.abs(dy)<5) return;
        drag.current.dir=Math.abs(dx)>Math.abs(dy)*1.2?"h":"v";
      }
      if(drag.current.dir==="h"){
        e.preventDefault();
        const now=Date.now(); const dt=Math.max(1,now-vel.current.t);
        vel.current.vx=(vel.current.x-t.clientX)/dt*14;
        vel.current.x=t.clientX; vel.current.t=now;
        // Direct DOM — no React setState, no re-render during gesture
        el.scrollLeft=drag.current.sl0+drag.current.x0-t.clientX;
      } else if(drag.current.dir==="v"){
        // touchAction:"none" means we must scroll the page manually
        const deltaY=drag.current.y0-t.clientY;
        drag.current.y0=t.clientY; // track per-frame delta, not total
        window.scrollBy(0,deltaY);
      }
    };

    const onTouchEnd = e=>{
      if(e.touches.length===0){
        if(drag.current.dir==="h"){
          let vx=vel.current.vx;
          const decay=()=>{
            if(Math.abs(vx)<0.5){vel.current.raf=null;return;}
            el.scrollLeft+=vx; vx*=0.88;
            vel.current.raf=requestAnimationFrame(decay);
          };
          vel.current.raf=requestAnimationFrame(decay);
        }
        drag.current.active=false; drag.current.dir=null; pinch.current.active=false;
      } else if(e.touches.length===1&&pinch.current.active){
        pinch.current.active=false;
        const t=e.touches[0];
        vel.current.x=t.clientX; vel.current.t=Date.now();
        drag.current={active:true,x0:t.clientX,y0:t.clientY,sl0:el.scrollLeft,dir:null};
      }
    };

    el.addEventListener("wheel",      onWheel,      {passive:false});
    el.addEventListener("touchstart",  onTouchStart, {passive:false});
    el.addEventListener("touchmove",   onTouchMove,  {passive:false});
    el.addEventListener("touchend",    onTouchEnd);
    return ()=>{
      el.removeEventListener("wheel",     onWheel);
      el.removeEventListener("touchstart",onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend",  onTouchEnd);
    };
  }, []); // register once; handlers always read latest values via handRef

  function toggleExpand(id){
    setExpanded(prev=>{
      const next=new Set(prev);
      next.has(id)?next.delete(id):next.add(id);
      return next;
    });
  }

  // ── Build dynamic row list — lane-packed (non-overlapping items share a row) ──
  const rows = useMemo(()=>{
    const list=[];
    const compMode   = filter==="companions";
    const showMasoom = filter==="all"||filter==="masoomeen"||compMode;
    const showFamily = filter==="all"||filter==="family";

    // Build separate entry lists for Masoomeen and Family
    const masoomPrimary = [];
    const familyPrimary = [];
    if(showMasoom){
      for(const m of MASOOMEEN){
        masoomPrimary.push({ type:"masoom", data:m, color:C_MASOOM, h:(m.ashaab&&m.ashaab.length>0?MASOOM_ROW_H:ROW_H) });
      }
    }
    if(showFamily){
      for(const f of FAMILY){
        familyPrimary.push({ type:"family", data:f, color:C_FAMILY, h:ROW_H });
      }
    }
    masoomPrimary.sort((a,b)=>a.data.birthAH - b.data.birthAH);
    familyPrimary.sort((a,b)=>a.data.birthAH - b.data.birthAH);

    // Greedy lane packing: assign items to first lane where last item ended >3 AH ago
    function packLanes(items){
      const lanes=[], laneEnds=[];
      for(const item of items){
        const startAH = item.data.birthAH;
        const endAH   = item.data.deathAH ?? MAX_AH;
        let found=-1;
        for(let i=0;i<lanes.length;i++){
          if(laneEnds[i]+3 < startAH){ found=i; break; }
        }
        if(found===-1){ found=lanes.length; lanes.push([]); laneEnds.push(-Infinity); }
        lanes[found].push(item);
        laneEnds[found]=endAH;
      }
      return lanes;
    }

    // Masoomeen lanes first (closest to axis = golden bars nearest timeline),
    // then Family lanes below them
    const allLanes = [...packLanes(masoomPrimary), ...packLanes(familyPrimary)];

    // Build flat rows: one lane row per packed lane, companion sub-rows inserted after
    for(const laneItems of allLanes){
      const h=Math.max(...laneItems.map(item=>item.h));
      list.push({ type:"lane", laneItems, h });
      for(const item of laneItems){
        if(item.type==="masoom"){
          const m=item.data;
          const showSubs=m.ashaab&&m.ashaab.length>0&&(compMode||(filter==="all"&&expanded.has(m.id)));
          if(showSubs){
            for(const a of m.ashaab){
              list.push({ type:"companion", data:a, color:C_COMPANION, h:SUB_ROW_H, parentId:m.id });
            }
          }
        }
      }
    }
    return list;
  },[filter, expanded]);

  // Compute y positions
  const rowYs = useMemo(()=>{
    const ys=[]; let y=AXIS_H+24; // extra gap for tick labels that now sit below the axis
    for(const r of rows){ ys.push(y); y+=r.h; }
    return ys;
  },[rows]);

  const totalRowsH = rowYs.length>0 ? rowYs[rowYs.length-1]+(rows[rows.length-1]?.h||0) : AXIS_H;
  const canvasH = totalRowsH + 20;

  // Ticks
  const tickStep=zoom>=6?5:zoom>=3?10:zoom>=1.8?25:zoom>=1.2?50:100;
  const ticks=[];
  for(let y=Math.ceil(MIN_AH/tickStep)*tickStep;y<=MAX_AH;y+=tickStep) ticks.push(y);

  // Event label stagger: row:0-3 within EVT_ZONE_H (160px)
  // Priority-based interval scheduling: high-priority events claim label space first,
  // so no two labels ever overlap regardless of priority level.
  const evtLayout = (() => {
    const ROW_TOP = [6, 44, 82, 120];
    const mapped = EVENTS.map(ev => {
      const visible = ev.pri===3 || (ev.pri===2 && zoom>=1.5) || zoom>=2.8;
      const labelY = ROW_TOP[ev.row ?? 0];
      return { ...ev, labelY, _vis: visible };
    });
    // Sort visible events: high priority first; within same priority, left-to-right
    const visOrder = mapped.filter(e=>e._vis)
      .sort((a,b)=> b.pri===a.pri ? a.ah-b.ah : b.pri-a.pri);
    // Claimed label intervals per row [left_px, right_px]
    const rowIntervals = [[],[],[],[]];
    const showSet = new Set();
    for(const ev of visOrder){
      const px = ((ev.ah - MIN_AH) / SPAN) * tlW;
      const r  = ev.row ?? 0;
      const lw = ev.pri===3 ? 95 : 78; // label width
      const l=px-lw/2-5, rr=px+lw/2+5;
      if(!rowIntervals[r].some(([a,b])=>l<b&&rr>a)){
        showSet.add(ev.id);
        rowIntervals[r].push([l, rr]);
      }
    }
    return mapped.map(ev=>({ ...ev, showLabel: ev._vis && showSet.has(ev.id) }));
  })();

  const showEvents = filter==="all"||filter==="events";

  return (
    <div style={{ minHeight:"100vh", background:"radial-gradient(ellipse at 20% 10%,#0D1228 0%,#060810 65%)", fontFamily:"'Palatino Linotype','Book Antiqua',Georgia,serif", color:"#D8CCBA", display:"flex", flexDirection:"column", overflowX:"hidden", overflowY:"auto", WebkitOverflowScrolling:"touch" }}>

      {/* Header */}
      <div style={{ textAlign:"center", padding:"16px 16px 6px" }}>
        <div style={{ color:"#B08840", fontSize:11, letterSpacing:"0.45em", textTransform:"uppercase", marginBottom:4 }}>٭  A Sacred Chronology  ٭</div>
        <h1 style={{ margin:0, fontWeight:400, fontSize:"clamp(16px,2.5vw,28px)", color:"#F5C842", letterSpacing:"0.06em", textShadow:"0 0 50px rgba(245,200,66,0.3)" }}>
          Masoomeen · Ahl al-Bayt · Companions (عليهم السلام)
        </h1>
        <div style={{ fontSize:11, color:"#8A9CAA", marginTop:3 }}>
          100 BH – 329 AH · One unified timeline · Drag/swipe to scroll · Pinch or Ctrl+Scroll to zoom · ± buttons to zoom · Click any bar · ▶ expand companions
        </div>
      </div>

      {/* Controls */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:6, padding:"5px 16px 7px", flexWrap:"wrap" }}>
        {[
          ["all","#C9A96E","All"],
          ["masoomeen",C_MASOOM,"Masoomeen (AS)"],
          ["family",C_FAMILY,"Family"],
          ["companions",C_COMPANION,"Companions"],
          ["events","#9B7BC4","Events Only"],
        ].map(([k,c,lbl])=>(
          <button key={k} onClick={()=>setFilter(k)} style={{
            background:filter===k?c:"rgba(255,255,255,0.04)",
            border:`1px solid ${filter===k?c:"rgba(255,255,255,0.1)"}`,
            color:filter===k?"#06080F":c, padding:"4px 13px", borderRadius:20,
            fontSize:12, cursor:"pointer", fontWeight:filter===k?700:400,
            letterSpacing:"0.04em", transition:"all 0.2s", WebkitTapHighlightColor:"transparent"
          }}>{lbl}</button>
        ))}
        <div style={{ display:"flex", gap:4, marginLeft:4 }}>
          {[["−","out"],["＋","in"]].map(([s,d])=>(
            <button key={d} onClick={()=>doZoom(d)} style={{ width:32,height:32,borderRadius:7,fontSize:18, background:"rgba(184,146,74,0.12)",border:"1px solid rgba(184,146,74,0.28)",color:"#C9A06A",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer" }}>{s}</button>
          ))}
          <span style={{ padding:"0 8px",height:32,lineHeight:"32px",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:7,fontSize:12,color:"#9AAABB" }}>{Math.round(zoom*100)}%</span>
        </div>
      </div>

      {/* Legend */}
      <div style={{ display:"flex", justifyContent:"center", gap:12, flexWrap:"wrap", padding:"0 16px 7px" }}>
        {[
          [C_MASOOM,"━","Masoomeen (AS)"],
          [C_FAMILY,"━","Family"],
          [C_COMPANION,"━","Companions"],
          ["#5EC48A","●","Birth"],
          ["#E63946","◆","Martyrdom"],
          ["#D4A843","◆","Wafat"],
          ["#9B7BC4","◉","Occultation"],
          ["#aaa","▶","Tap bar to expand companions"],
        ].map(([c,sym,lbl])=>(
          <span key={lbl} style={{ display:"flex",alignItems:"center",gap:4,fontSize:11,color:"#8A9CAA" }}>
            <span style={{ color:c,fontSize:13 }}>{sym}</span>{lbl}
          </span>
        ))}
      </div>

      {/* Main layout: sidebar + canvas */}
      <div style={{ display:"flex", flex:"0 0 auto", padding:"0 12px 8px" }}>

        {/* ── SCROLLABLE CANVAS ── */}

        <div ref={vpRef} style={{ flex:1, minWidth:0 }}>
          <div
            ref={outerRef}
            className="tl-canvas"
            onScroll={e=>setOffset(Math.round(e.currentTarget.scrollLeft))}
            onMouseDown={e=>{ drag.current={active:true,x0:e.clientX,sl0:outerRef.current.scrollLeft}; }}
            onMouseMove={e=>{ if(drag.current.active&&outerRef.current) outerRef.current.scrollLeft=drag.current.sl0+drag.current.x0-e.clientX; }}
            onMouseUp={()=>{ drag.current.active=false; }}
            onMouseLeave={()=>{ drag.current.active=false; }}
            style={{ overflowX:"scroll", overflowY:"hidden", scrollbarWidth:"none", msOverflowStyle:"none", WebkitOverflowScrolling:"touch", position:"relative", border:"1px solid rgba(184,146,74,0.12)", borderLeft:"none", borderRadius:"0 10px 10px 0", background:"rgba(255,255,255,0.007)", cursor:drag.current.active?"grabbing":"grab", userSelect:"none", touchAction:"none", height:canvasH, width:vpW, maxWidth:"100%" }}
          >
            <div style={{ width:tlW, height:canvasH, position:"relative" }}>

              {/* Reference lines */}
              {[{ah:1,c:"rgba(126,184,201,0.08)"},{ah:61,c:"rgba(230,57,70,0.09)"},{ah:10,c:"rgba(245,197,24,0.06)"}].map(({ah,c})=>(
                <div key={ah} style={{ position:"absolute",left:xOf(ah),top:0,bottom:0,width:1,background:c,pointerEvents:"none" }}/>
              ))}

              {/* Axis */}
              <div style={{ position:"absolute",top:AXIS_H-1,left:0,right:0,height:1,background:"rgba(184,146,74,0.35)" }}/>
              {ticks.map(y=>{
                const x=xOf(y),isMajor=y%100===0||y===1,isMid=y%50===0&&!isMajor;
                return (
                  <div key={y} style={{ position:"absolute",left:x,top:AXIS_H-1 }}>
                    <div style={{ position:"absolute",bottom:0,left:0,width:1,height:isMajor?14:isMid?9:5,background:isMajor?"rgba(184,146,74,0.8)":"rgba(184,146,74,0.3)" }}/>
                    {(isMajor||isMid||zoom>2)&&(
                      /* Tick labels sit BELOW the axis so they never overlap event labels above */
                      <div style={{ position:"absolute",top:4,left:y===1?-26:y<0?-14:2,fontSize:isMajor?11:9,color:y===1?"#7EB8C9":isMajor?"rgba(184,146,74,0.95)":"rgba(184,146,74,0.65)",whiteSpace:"nowrap",fontWeight:y===1?700:400,letterSpacing:"0.04em" }}>
                        {y===1?"1 AH · Hijra ✦":ahLabel(y)}
                      </div>
                    )}

                  </div>
                );
              })}

              {/* Person bars */}
              {rows.map((row,i)=>{
                const top=rowYs[i];
                if(top==null) return null;
                const itemsToRender = row.type==="lane" ? row.laneItems : [row];
                return (
                  <React.Fragment key={`row-${i}`}>
                    {itemsToRender.map(item=>{
                      const d=item.data, color=item.color;
                      const bx=xOf(d.birthAH);
                      const endAH=d.deathAH!=null?d.deathAH:MAX_AH-4;
                      const barW=Math.max(xOf(endAH)-bx, 3);
                      const bh=item.type==="companion"?SUB_H:BAR_H;
                      const midY=top+bh/2;
                      const isComp=item.type==="companion";
                      const visLeft=Math.max(0,offset-bx);
                      const stickyLeft=Math.min(Math.max(visLeft+6,6),Math.max(barW-120,6));
                      return (
                        <div key={d.id+"-bar"}>
                          {/* Thin connector from bar up to the axis — only for rows below the first */}
                          {!isComp&&top>(AXIS_H+24)&&(
                            <div style={{ position:"absolute",left:bx+barW/2,top:AXIS_H+24,width:1,height:top-(AXIS_H+24),background:`${color}12`,pointerEvents:"none" }}/>
                          )}
                          {/* Indent line for companion */}
                          {isComp&&(
                            <div style={{ position:"absolute",left:bx-8,top:midY,width:8,height:1,background:`${color}44`,pointerEvents:"none" }}/>
                          )}
                          {/* Bar */}
                          <div
                            onClick={()=>setSel({...d,_type:"person",group:item.type,color})}
                            title={d.label}
                            style={{ position:"absolute",left:bx,top,width:barW,height:bh,borderRadius:bh/2,
                              background:`linear-gradient(90deg,${color}15,${color}45 30%,${color}25)`,
                              border:`1px solid ${color}${isComp?"40":"50"}`,
                              cursor:"pointer",transition:"filter 0.15s",zIndex:3,
                              opacity:isComp?0.85:1,overflow:"hidden"
                            }}
                            onMouseEnter={e=>{ e.currentTarget.style.filter="brightness(2)";e.currentTarget.style.zIndex="20"; }}
                            onMouseLeave={e=>{ e.currentTarget.style.filter="brightness(1)";e.currentTarget.style.zIndex="3"; }}
                          >
                            {barW>14&&(
                              <div style={{ position:"absolute",left:stickyLeft,top:0,bottom:0,display:"flex",alignItems:"center",gap:3,
                                fontSize:isComp?9:zoom>2?11:10,color:`${color}ee`,whiteSpace:"nowrap",letterSpacing:"0.02em",transition:"left 0.04s linear"
                              }}>
                                {item.type==="masoom"&&d.ashaab&&d.ashaab.length>0&&filter==="all"&&(
                                  <span onClick={e=>{e.stopPropagation();toggleExpand(d.id);}}
                                    style={{fontSize:9,color:`${color}ee`,cursor:"pointer",
                                      pointerEvents:"all",userSelect:"none",
                                      WebkitTapHighlightColor:"transparent",paddingRight:2}}>
                                    {expanded.has(d.id)?"▼":"▶"}
                                  </span>
                                )}
                                {barW>60
                                  ? <>{d.imamNo?`I${d.imamNo}·`:""}{d.short}</>
                                  : <>{d.imamNo?`I${d.imamNo}`:d.short?.slice(0,6)}</>
                                }
                              </div>
                            )}
                          </div>
                          {/* Birth dot */}
                          <div onClick={()=>setSel({...d,_type:"person",group:item.type,color})} style={{
                            position:"absolute",left:bx-4,top:midY-4,width:isComp?7:9,height:isComp?7:9,borderRadius:"50%",
                            background:"#1A5C38",border:`${isComp?1:2}px solid #5EC48A`,boxShadow:`0 0 ${isComp?4:7}px #5EC48A88`,cursor:"pointer",zIndex:6
                          }}/>
                          {/* Death marker */}
                          {(d.deathType==="martyrdom"||d.deathType==="wafat")&&d.deathAH!=null&&(
                            <div onClick={()=>setSel({...d,_type:"person",group:item.type,color})} style={{
                              position:"absolute",left:xOf(d.deathAH)-(isComp?4:5),top:midY-(isComp?4:5),
                              width:isComp?8:10,height:isComp?8:10,transform:"rotate(45deg)",
                              background:d.deathType==="martyrdom"?"#4A0808":"#3A2A08",
                              border:`${isComp?1:2}px solid ${d.deathType==="martyrdom"?"#E63946":"#D4A843"}`,
                              boxShadow:`0 0 ${isComp?5:9}px ${d.deathType==="martyrdom"?"#E6394870":"#D4A84370"}`,
                              cursor:"pointer",zIndex:6
                            }}/>
                          )}
                          {d.deathType==="occultation"&&(
                            <div onClick={()=>setSel({...d,_type:"person",group:item.type,color})} style={{
                              position:"absolute",left:xOf(d.birthAH)+barW-6,top:midY-6,
                              width:12,height:12,borderRadius:"50%",background:"rgba(123,91,196,0.22)",border:"2px solid #9B7BC4",
                              boxShadow:"0 0 10px #9B7BC480",cursor:"pointer",zIndex:6,
                              display:"flex",alignItems:"center",justifyContent:"center",fontSize:7,color:"#9B7BC4"
                            }}>◉</div>
                          )}
                          {/* Companion expand/collapse button */}
                          {item.type==="masoom"&&d.ashaab&&d.ashaab.length>0&&filter==="all"&&(
                            <div
                              onClick={e=>{e.stopPropagation();toggleExpand(d.id);}}
                              style={{
                                position:"absolute", left:bx, top:top+BAR_H+BAR_GAP,
                                width:Math.min(barW,130), height:BTN_H,
                                display:"flex", alignItems:"center", justifyContent:"center", gap:4,
                                background:expanded.has(d.id)?`${color}28`:`${color}16`,
                                borderRadius:"0 0 6px 6px",
                                border:`1px solid ${color}${expanded.has(d.id)?"55":"30"}`,
                                borderTop:"none",
                                cursor:"pointer", WebkitTapHighlightColor:"transparent",
                                userSelect:"none", zIndex:4,
                              }}
                            >
                              <span style={{fontSize:9,color:`${color}${expanded.has(d.id)?"dd":"aa"}`,letterSpacing:"0.05em"}}>
                                {expanded.has(d.id)?"▲ hide companions":`▼ ${d.ashaab.length} companions`}
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </React.Fragment>
                );
              })}

              {/* Events */}
              {showEvents&&evtLayout.map(ev=>{
                const ex=xOf(ev.ah),isHigh=ev.pri===3;
                const showLabel=ev.showLabel??false;
                const dotY=AXIS_H-5;
                return (
                  <div key={ev.id}>
                    {isHigh&&<div style={{ position:"absolute",left:ex,top:0,bottom:0,width:1,background:`${ev.color}18`,pointerEvents:"none" }}/>}
                    {showLabel&&<div style={{ position:"absolute",left:ex,top:ev.labelY+13,width:1,height:Math.max(0,dotY-(ev.labelY+13)),background:`${ev.color}35`,pointerEvents:"none" }}/>}
                    <div onClick={()=>setSel({...ev,_type:"event"})}
                      style={{ position:"absolute",left:ex-4,top:dotY,width:9,height:9,borderRadius:"50%",background:ev.color,border:`1px solid ${ev.color}`,boxShadow:`0 0 ${isHigh?13:6}px ${ev.color}99`,cursor:"pointer",zIndex:8,transition:"transform 0.15s" }}
                      onMouseEnter={e=>e.currentTarget.style.transform="scale(1.7)"}
                      onMouseLeave={e=>e.currentTarget.style.transform="scale(1)"}
                    />
                    {showLabel&&(
                      <div onClick={()=>setSel({...ev,_type:"event"})} style={{
                        position:"absolute",left:ex,top:ev.labelY,transform:"translateX(-50%)",
                        width:isHigh?105:88,textAlign:"center",fontSize:isHigh?11:9.5,
                        color:isHigh?ev.color:`${ev.color}DD`,lineHeight:1.3,cursor:"pointer",
                        fontWeight:isHigh?700:500,zIndex:7,letterSpacing:"0.02em"
                      }}>
                        {ev.label}
                        {zoom>=2.5&&<div style={{ fontSize:9,color:`${ev.color}99`,marginTop:1 }}>{ev.hdate}</div>}
                      </div>
                    )}
                  </div>
                );
              })}

            </div>
          </div>

          {/* Scrollbar */}
          <div style={{ height:3,background:"rgba(255,255,255,0.05)",borderRadius:2,marginTop:4 }}>
            <div style={{ height:"100%",borderRadius:2,background:"rgba(184,146,74,0.4)",width:`${Math.min((vpW/tlW)*100,100)}%`,marginLeft:`${(offset/Math.max(tlW,1))*100}%`,transition:"width 0.2s" }}/>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display:"flex",justifyContent:"center",gap:18,padding:"4px 16px 12px",flexWrap:"wrap" }}>
        {[["14","Masoomeen (AS)"],["12","Family Personalities"],["52","Companions & Deputies"],["40","Historical Events"]].map(([n,l])=>(
          <div key={l} style={{ textAlign:"center" }}>
            <div style={{ fontSize:17,color:"#F5C842" }}>{n}</div>
            <div style={{ fontSize:10,color:"#8A9CAA",textTransform:"uppercase",letterSpacing:"0.07em" }}>{l}</div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {sel&&(
        <div onClick={()=>setSel(null)} style={{ position:"fixed",inset:0,zIndex:50,background:"rgba(0,0,0,0.78)",backdropFilter:"blur(6px)",display:"flex",alignItems:"center",justifyContent:"center",padding:20 }}>
          <div onClick={e=>e.stopPropagation()} style={{ background:"linear-gradient(145deg,#0E1120 0%,#08090F 100%)",border:`1px solid ${(sel.color||"#C9A96E")}44`,borderRadius:16,padding:26,maxWidth:520,width:"100%",boxShadow:`0 32px 90px rgba(0,0,0,0.8), 0 0 50px ${(sel.color||"#C9A96E")}0A`,maxHeight:"88vh",overflowY:"auto" }}>
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:12,marginBottom:12 }}>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:11,letterSpacing:"0.3em",textTransform:"uppercase",color:sel.color||"#C9A96E",marginBottom:4 }}>
                  {sel._type==="event"?"Historical Event"
                    :sel.group==="masoom"?(sel.imamNo?`Imam ${sel.imamNo} of 12`:sel.id==="prophet"?"The Holy Prophet ﷺ":"Masoomah (AS)")
                    :sel.group==="family"?"Ahl al-Bayt Family"
                    :"Companion (Sahaabi)"}
                </div>
                <h2 style={{ margin:0,fontSize:20,fontWeight:400,color:"#EEE4D2",lineHeight:1.3 }}>{sel.label||sel.full}</h2>
                {sel.role&&<div style={{ fontSize:13,color:`${sel.color||"#C9A96E"}CC`,marginTop:4 }}>{sel.role}</div>}
              </div>
              <button onClick={()=>setSel(null)} style={{ width:36,height:36,flexShrink:0,borderRadius:8,background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.15)",color:"#AABBC8",cursor:"pointer",fontSize:16 }}>✕</button>
            </div>
            {sel.arabic&&<div style={{ textAlign:"right",direction:"rtl",fontSize:17,color:`${sel.color||"#C9A96E"}AA`,fontFamily:"serif",marginBottom:12,paddingBottom:10,borderBottom:"1px solid rgba(255,255,255,0.1)" }}>{sel.arabic}</div>}
            <div style={{ display:"flex",gap:8,flexWrap:"wrap",marginBottom:12 }}>
              {sel._type==="person"?(<>
                {(sel.birthH||sel.birthAH!=null)&&<div style={{ padding:"7px 12px",background:"rgba(94,196,138,0.09)",border:"1px solid rgba(94,196,138,0.28)",borderRadius:8,fontSize:13 }}>
                  <div style={{ color:"#5EC48A",fontSize:10,marginBottom:3 }}>BIRTH</div>
                  <span style={{ color:"#E8DCCC" }}>{sel.birthH||ahLabel(sel.birthAH)}</span>
                  {sel.birthCE&&!sel.birthH?.includes("CE")&&<span style={{ color:"#7A8A98",marginLeft:6 }}>{sel.birthCE}</span>}
                </div>}
                {(sel.deathH||sel.deathAH!=null)&&sel.deathType!=="occultation"&&<div style={{ padding:"7px 12px",background:`rgba(${sel.deathType==="martyrdom"?"230,57,70":"212,168,67"},0.09)`,border:`1px solid rgba(${sel.deathType==="martyrdom"?"230,57,70":"212,168,67"},0.28)`,borderRadius:8,fontSize:13 }}>
                  <div style={{ color:sel.deathType==="martyrdom"?"#E63946":"#D4A843",fontSize:10,marginBottom:3 }}>
                    {sel.deathType==="martyrdom"?"SHAHADAT":"WAFAT"}
                  </div>
                  <span style={{ color:"#E8DCCC" }}>{sel.deathH||ahLabel(sel.deathAH)}</span>
                </div>}
                {sel.age&&<div style={{ padding:"7px 12px",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:8,fontSize:13 }}>
                  <div style={{ color:"#8A9CAA",fontSize:10,marginBottom:3 }}>AGE</div>
                  <span style={{ color:"#E8DCCC" }}>~{sel.age} years</span>
                </div>}
              </>):(<>
                <div style={{ padding:"7px 12px",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:8,fontSize:13 }}>
                  <div style={{ color:"#8A9CAA",fontSize:10,marginBottom:3 }}>HIJRI DATE</div>
                  <span style={{ color:"#E8DCCC" }}>{sel.hdate}</span>
                </div>
                <div style={{ padding:"7px 12px",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:8,fontSize:13 }}>
                  <div style={{ color:"#8A9CAA",fontSize:10,marginBottom:3 }}>CE DATE</div>
                  <span style={{ color:"#E8DCCC" }}>{sel.ce}</span>
                </div>
              </>)}
            </div>
            <p style={{ fontSize:15,lineHeight:1.9,color:"#C8D8E2",margin:0 }}>{sel.detail}</p>
            {sel.shrine&&!sel.shrine.includes("Occultation")&&(
              <div style={{ marginTop:14,padding:"9px 13px",background:"rgba(184,146,74,0.08)",border:"1px solid rgba(184,146,74,0.25)",borderRadius:8,fontSize:13,color:"#D4B07A" }}>⬡ Shrine: {sel.shrine}</div>
            )}
            {sel.deathType==="occultation"&&(
              <div style={{ marginTop:12,padding:"9px 13px",background:"rgba(123,91,196,0.08)",border:"1px solid rgba(123,91,196,0.25)",borderRadius:8,fontSize:13,color:"#B09BE0" }}>◉ Imam al-Mahdi (AJ) is alive, in occultation, and will reappear (Zuhur) to fill the earth with justice.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
