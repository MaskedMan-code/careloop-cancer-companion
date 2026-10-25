/**
 * Deterministic safety layer for CareLoop's non-clinical boundary.
 * These checks run on the server, independent of the language model, so the
 * boundary holds even if the model is wrong or manipulated by source text.
 *
 * Design bias: conservative. False positives show an informational banner or
 * drop a proposed task (the user can still add tasks manually); false negatives
 * are the risk we are trying to minimise. Patterns cover English + Hindi only.
 */

export const MESSAGES = {
  urgent:
    "CareLoop can't assess symptoms or emergencies. If you or someone else may be in danger or having a medical emergency, call your local emergency number now (112 in India) or contact your treating team right away.",
  advice:
    "CareLoop can't answer questions about diagnosis, test results, treatment or medicines. Please ask your treating doctor or care team. CareLoop only helps organize appointments, documents and tasks.",
  clinicalContent:
    "This text includes clinical details. CareLoop only organizes appointments, documents and tasks — it does not interpret medical information. Please check anything clinical with your healthcare team.",
  default:
    "Please review these suggestions. Nothing is added to your journey until you confirm it.",
  fallbackSummary: "Administrative details were extracted from the text you provided.",
} as const;

// --- input screening ------------------------------------------------------

const URGENT_EN =
  /\b(chest pain|(can'?t|cannot|can not|unable to) breathe|difficulty breathing|trouble breathing|short(ness)? of breath|heavy bleeding|bleeding (heavily|a lot|profusely)|bleeding (that )?won'?t stop|coughing (up )?blood|vomiting blood|unconscious|passed out|fainted|seizures?|having a stroke|overdos\w*|suicid\w*|(want|wanna|going) to (die|kill myself)|kill myself|end my life|severe pain|unbearable pain)\b/i;
const URGENT_HI =
  /(सीने में दर्द|सीने मे दर्द|सांस (लेने )?में (तकलीफ|दिक्कत)|साँस (लेने )?में (तकलीफ|दिक्कत)|सांस नहीं|बेहोश|खून (बह|की उल्टी)|बहुत खून|आत्महत्या|मरना चाहता|मरना चाहती|जान देना|असहनीय दर्द|दौरा पड़)/;

const ADVICE_EN: RegExp[] = [
  /\b(do i have|have i got|is (it|this|that) (cancer|malignant|benign|serious|fatal|terminal|curable|spreading)|am i (dying|sick))\b/i,
  /\b(what|which) (stage|grade)\b/i,
  /\bwhat (does|do|is|are) (my|the|this|these) (report|reports|biopsy|pathology|scan|mri|ct|pet|result|results|test|tests|blood work) ?(mean|means|say|show|shows|indicate|indicates)?\b.*\b(mean|means|say|show|shows|indicate|indicates)\b/i,
  /\b(interpret|analy[sz]e|decode) (my|the|this|these) (report|reports|biopsy|pathology|scan|result|results)\b/i,
  /\bwhat('?s| is) (my|the) (diagnosis|prognosis)\b|\bprognosis\b|\blife expectancy\b|\bhow long (do|will) i (have|live)\b|\bsurvival (rate|chance|chances)\b|\bchances of survival\b/i,
  /\b(which|what) (treatment|therapy|medicine|medication|drug|surgery|chemo\w*)\b.*\?/i,
  /\b(should|shall|can|may|must) i (take|stop|start|skip|increase|decrease|reduce|change|double|halve) (my |the |this |that |any |some )?(medicine|medicines|medication|medications|tablet|tablets|pill|pills|dose|dosage|drug|drugs|capsule|capsules|chemo\w*|injection|treatment|therapy|painkiller|painkillers|steroid|steroids)\b/i,
  /\b(should|shall) i (have|choose|opt for|go for|get|undergo|refuse|do) (the )?(surgery|operation|chemo\w*|radiation|radiotherapy|immunotherapy|treatment|biopsy)\b/i,
  /\b(chemo\w*|radiation|radiotherapy|surgery|immunotherapy)\s+(or|vs\.?|versus)\s+(chemo\w*|radiation|radiotherapy|surgery|immunotherapy)\b/i,
  /\b(is|are) (the )?(chemo\w*|radiation|surgery|treatment|this medicine) (necessary|needed|safe|worth it|right for me)\b/i,
  /\bwhat (dose|dosage)\b|\bhow (much|many) (mg|milligrams?|tablets?|pills?|capsules?|doses?|ml)\b|\b(dose|dosage)\b[^.\n]*\?|\?[^.\n]*\b(dose|dosage)\b/i,
  /\bside effects? of\b/i,
];
const ADVICE_HI =
  /(क्या मुझे (कैंसर|कैन्सर)|रिपोर्ट (का|के) मतलब|रिपोर्ट में क्या|कौन ?सी दवा|कौन[- ]?सा इलाज|दवा (बंद|बन्द|शुरू|छोड़)|खुराक कितनी|कितनी खुराक|कीमो(थेरेपी)? (लूँ|लूं|करवाऊं|करवाऊँ)|ऑपरेशन (करवाऊं|करवाऊँ)|कैंसर की स्टेज|स्टेज क्या|कितने (दिन|साल) (जिऊँगा|जिऊंगा|जीऊंगी|जिऊँगी)|क्या यह (गंभीर|जानलेवा))/;

const CONTENT_EN =
  /\b(malignan\w*|benign|carcinoma|adenocarcinoma|tumou?rs?|metasta\w*|lymph nodes?|stage\s*(0|iv|i{1,3}|[1-4][abc]?)\b|grade\s*([1-4]|i{1,3})\b|histolog\w*|positive for|negative for|diagnos(is|ed|e)\b|prognosis|chemo(therapy)?|radiotherapy|radiation therapy|immunotherapy|doses?|dosage|\d+(\.\d+)?\s?(mg|mcg|ml|iu)\b|tablets?|capsules?|medications?|(biopsy|pathology|scan|mri|ct|pet)( report| result)? (shows?|showed|reveals?|revealed|indicates?)|(her2|er|pr)[\s-]*(positive|negative)|hemoglobin|haemoglobin|platelet count|wbc)\b/i;
const CONTENT_HI =
  /(कैंसर है|घातक|ट्यूमर|मेटास्टे|स्टेज|कीमोथेरेपी|रेडियोथेरेपी|खुराक|गोली|कैप्सूल|दवा|दवाई|\d+\s?(मिग्रा|एमजी))/;


const FINDING_EN =
  /\b(malignan\w*|benign|carcinoma|adenocarcinoma|tumou?rs?|metasta\w*|lymph nodes?|stage\s*(0|iv|i{1,3}|[1-4][abc]?)\b|grade\s*([1-4]|i{1,3})\b|histolog\w*|positive for|negative for|diagnos(is|ed|e)\b|prognosis|(biopsy|pathology|scan|mri|ct|pet)( report| result)? (shows?|showed|reveals?|revealed|indicates?)|(her2|er|pr)[\s-]*(positive|negative)|hemoglobin|haemoglobin|platelet count|wbc)\b/i;
const FINDING_HI = /(कैंसर है|घातक|ट्यूमर|मेटास्टे|स्टेज)/;

const INSTRUCTION_EN =
  /(\b\d+(\.\d+)?\s?(mg|mcg|µg|ml|iu|units?)\b|\bdoses?\b|\bdosage\b|\btablets?\b|\bcapsules?\b|\bpills?\b|\bsyrup\b|\btake (your |the |this |any )?(medicine|medication|drug|pill|tablet|capsule)s?\b|\b(stop|start) (taking|the) (medicine|medication|drug|pill|tablet)s?\b|\bskip (the |your )?(dose|medicine|medication|tablet)s?\b|\bfast(ing)?\b|\bnil (by|per) mouth\b|\bnpo\b|\bempty stomach\b|\bavoid (eating|food|drinking)\b|\bdo not (eat|drink)\b|\bdiet(ary)?\b|\bchemo\w*\s+(cycle|dose)\b|\bradiation dose\b|\b(stop|start|continue|pause|discontinue|skip|change|increase|decrease) (the |your |my )?(chemo\w*|radiation|radiotherapy|immunotherapy|treatment|therapy|medicine|medication)\b)/i;
const INSTRUCTION_HI =
  /(खुराक|गोली|कैप्सूल|दवा (लें|ले लें|बंद|न लें|खाएं|खाएँ)|दवाई (लें|बंद)|उपवास|खाली पेट|कुछ (न|ना) खाएं|कुछ (न|ना) खाएँ|मिग्रा)/;

const INJECTION_EN =
  /(\b(ignore|disregard|forget|override|bypass)\b.{0,40}\b(previous|prior|above|earlier|all|any|the|your|these|system)\b.{0,40}\b(instructions?|rules?|prompt|guidelines?|constraints?)\b|\b(system|developer) (prompt|message|instruction)s?\b|\byou are now\b|\bact as (a|an|the)\b|\bpretend (to be|you)\b|\bjailbreak\b|\bdo anything now\b|\breveal (your|the) (prompt|instructions|api key|key|secret)\b|\bmark (all |every )?(tasks?|everything|items?) (as )?(complete|completed|done)\b|\b(print|show|output|send) (the |your )?(api[-_ ]?key|secret|password|token)\b|\bnew instructions?\s*:)/i;
const INJECTION_HI =
  /(निर्देश(ों)? (को )?(अनदेखा|नज़रअंदाज़|भूल)|सारे निर्देश भूल|पिछले निर्देश|सिस्टम प्रॉम्प्ट)/;

export function detectUrgent(text: string): boolean {
  return URGENT_EN.test(text) || URGENT_HI.test(text);
}
export function detectClinicalAdviceRequest(text: string): boolean {
  return ADVICE_EN.some((r) => r.test(text)) || ADVICE_HI.test(text);
}
export function detectClinicalContent(text: string): boolean {
  return CONTENT_EN.test(text) || CONTENT_HI.test(text);
}
/** Clinical FINDINGS/interpretation (results, stages, diagnoses). Never allowed in tasks/facts. */
export function detectClinicalFinding(text: string): boolean {
  return FINDING_EN.test(text) || FINDING_HI.test(text);
}
export function looksLikeClinicalInstruction(text: string): boolean {
  return INSTRUCTION_EN.test(text) || INSTRUCTION_HI.test(text);
}
export function detectInjection(text: string): boolean {
  return INJECTION_EN.test(text) || INJECTION_HI.test(text);
}
/** Output-side check: model-written prose must not contain clinical claims. */
export function containsClinicalClaim(text: string): boolean {
  return (
    detectClinicalContent(text) ||
    looksLikeClinicalInstruction(text) ||
    /\byou (have|may have|might have|probably have|should|must|need to) (cancer|a tumou?r|stage|take|stop|start|increase|decrease|undergo|choose|get)\b/i.test(text)
  );
}

// --- text hygiene ----------------------------------------------------------

export const SOURCE_START = "<<<SOURCE_TEXT_START>>>";
export const SOURCE_END = "<<<SOURCE_TEXT_END>>>";

/** Remove control/zero-width characters and any attempt to forge our delimiters. */
export function sanitizeInput(raw: string): string {
  return raw
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .replace(/[\u200B-\u200F\u202A-\u202E\u2060\uFEFF]/g, "")
    .split(SOURCE_START).join("")
    .split(SOURCE_END).join("")
    .replace(/\r\n?/g, "\n")
    .trim();
}

/** Normalisation used for grounding comparisons (both sides). */
export function normalizeForMatch(s: string): string {
  return s
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

/** Strong script evidence for language (Devanagari vs Latin letters). */
export function scriptLanguage(text: string): "hindi" | "english" | "mixed" | "unknown" {
  const dev = (text.match(/[\u0900-\u097F]/g) ?? []).length;
  const lat = (text.match(/[A-Za-z]/g) ?? []).length;
  const total = dev + lat;
  if (total < 8) return "unknown";
  const ratio = dev / total;
  if (ratio >= 0.6) return "hindi";
  if (ratio <= 0.02) return "english";
  return "mixed";
}
