const Medicine = require('../models/Medicine');

/**
 * Normalizes text for comparison:
 * lowercase, trims whitespace, removes non-alphanumeric except space
 */
function normalizeText(text) {
  if (!text) return '';
  return text
    .toLowerCase()
    .replace(/[^\w\s]/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Extracts strength if present in text (e.g., "100mg", "250mg", "650mg", "0.25%", "2%")
 */
function extractStrength(text) {
  if (!text) return '';
  const match = text.match(/\b(\d+(\.\d+)?\s*(mg|mcg|g|ml|iu|%|gm))\b/i);
  return match ? match[0].trim() : '';
}

/**
 * Extracts dosage frequency / sig if present
 */
function extractSig(text) {
  if (!text) return null;
  const lower = text.toLowerCase();
  if (/1-0-1/i.test(lower)) return { frequency: 'Twice daily (1-0-1)', timing: 'After food' };
  if (/1-1-1/i.test(lower)) return { frequency: 'Thrice daily (1-1-1)', timing: 'After food' };
  if (/1-0-0/i.test(lower)) return { frequency: 'Once daily morning (1-0-0)', timing: 'After food' };
  if (/0-0-1/i.test(lower)) return { frequency: 'Once daily night (0-0-1)', timing: 'After food' };
  if (/sos\b/i.test(lower)) return { frequency: 'As needed (SOS)', timing: 'When symptomatic' };
  if (/external\s*application/i.test(lower) || /cream|oint/i.test(lower)) return { frequency: 'Apply twice daily', timing: 'External application' };
  if (/soap/i.test(lower)) return { frequency: 'Use during bath', timing: 'Bathing soap' };
  return null;
}

/**
 * Extracts core drug name by stripping clinical prefixes, dosage forms, sig, and units
 * e.g. "Tab Doxycycline 100mg (1-0-1)" -> "doxycycline"
 * e.g. "Amorolfine Cream 0.25%" -> "amorolfine"
 */
function extractCoreName(text) {
  if (!text) return '';
  let cleaned = normalizeText(text);

  // Strip clinical prefixes: tab, cap, syp, crm, oint, inj, soap, lotion, etc.
  cleaned = cleaned.replace(/\b(tabs?|tablets?|caps?|capsules?|syrup|syp|crm|cream|ointment|oint|inj|injection|soap|lotion|gel|drops)\b/gi, ' ');

  // Strip sig frequencies & timings: 1-0-1, od, bd, tds, qid, sos, after food, etc.
  cleaned = cleaned.replace(/\b(1 0 1|1 1 1|1 0 0|0 1 0|0 0 1|od|bd|tds|qid|sos|stat|prn|ac|pc|after food|before food|external application|bathing soap)\b/gi, ' ');

  // Strip strength and units: 100mg, 500 mg, 0.25%, 2%
  cleaned = cleaned.replace(/\b(\d+(\.\d+)?\s*(mg|mcg|g|ml|iu|gm|percent))\b/gi, ' ');
  cleaned = cleaned.replace(/\b\d+(\.\d+)?\s*%/g, ' ');

  // Strip standalone numbers
  cleaned = cleaned.replace(/\b\d+\b/g, ' ');

  return cleaned.replace(/\s+/g, ' ').trim();
}

/**
 * Computes Levenshtein edit distance between two strings
 */
function levenshteinDistance(a, b) {
  const an = a ? a.length : 0;
  const bn = b ? b.length : 0;
  if (an === 0) return bn;
  if (bn === 0) return an;

  const matrix = [];
  for (let i = 0; i <= bn; ++i) matrix[i] = [i];
  for (let i = 0; i <= an; ++i) matrix[0][i] = i;

  for (let i = 1; i <= bn; ++i) {
    for (let j = 1; j <= an; ++j) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }
  return matrix[bn][an];
}

/**
 * Computes similarity ratio (0.0 to 1.0) based on Levenshtein distance
 */
function stringSimilarity(str1, str2) {
  const s1 = normalizeText(str1);
  const s2 = normalizeText(str2);
  if (s1 === s2) return 1.0;
  const maxLen = Math.max(s1.length, s2.length);
  if (maxLen === 0) return 1.0;
  const distance = levenshteinDistance(s1, s2);
  return Math.max(0, 1 - distance / maxLen);
}

/**
 * Bigram / Dice coefficient for fuzzy partial matching
 */
function diceCoefficient(str1, str2) {
  const s1 = normalizeText(str1);
  const s2 = normalizeText(str2);
  if (s1 === s2) return 1.0;
  if (s1.length < 2 || s2.length < 2) return stringSimilarity(s1, s2);

  const bigrams1 = new Map();
  for (let i = 0; i < s1.length - 1; i++) {
    const bg = s1.substr(i, 2);
    bigrams1.set(bg, (bigrams1.get(bg) || 0) + 1);
  }

  let intersection = 0;
  for (let i = 0; i < s2.length - 1; i++) {
    const bg = s2.substr(i, 2);
    const count = bigrams1.get(bg) || 0;
    if (count > 0) {
      bigrams1.set(bg, count - 1);
      intersection++;
    }
  }

  return (2.0 * intersection) / (s1.length - 1 + s2.length - 1);
}

class MedicineMatchingService {
  /**
   * Matches an AI-recognized text string against the entire active medicine inventory.
   *
   * @param {string} recognizedText - The raw text recognized from the prescription (e.g. "Paracetmol 500")
   * @param {Array} inventory - Optional list of active medicines (if null, loaded from DB)
   * @returns {Object} Match result with top candidate, confidence, status, and alternatives
   */
  async matchMedicine(recognizedText, inventory = null) {
    if (!inventory) {
      inventory = await Medicine.find({ isActive: true });
    }

    if (!recognizedText || !inventory || inventory.length === 0) {
      return {
        recognizedText,
        matchedMedicine: null,
        matchedMedicineName: null,
        confidence: 0,
        matchStatus: 'LOW_CONFIDENCE',
        alternativeCandidates: [],
        uncertainReason: 'No inventory or empty recognized text',
        matchMethod: 'none',
      };
    }

    const normInput = normalizeText(recognizedText);
    const coreInput = extractCoreName(recognizedText);
    const inputStrength = extractStrength(recognizedText);

    const scoredMedicines = [];

    for (const med of inventory) {
      let maxScore = 0;
      let matchMethod = 'fuzzy';
      let reason = '';

      const medNormName = normalizeText(med.name);
      const medCoreName = extractCoreName(med.name);
      const medStrength = extractStrength(med.name);
      const genericNorm = normalizeText(med.genericName || '');
      const brandNorm = normalizeText(med.brandName || '');

      // 1. Exact Name / Generic / Brand match
      if (normInput === medNormName || normInput === genericNorm || normInput === brandNorm) {
        maxScore = 0.98;
        matchMethod = 'exact';
        reason = 'Exact name match';
      } else if (coreInput === medCoreName && coreInput.length > 2) {
        // Direct core name match on primary drug title
        maxScore = 0.96;
        matchMethod = 'exact_core';
        reason = 'Exact core medicine name match';
      }

      // 2. Alias match
      if (maxScore < 0.95 && med.aliases && med.aliases.length > 0) {
        for (const alias of med.aliases) {
          const normAlias = normalizeText(alias);
          if (normInput === normAlias || coreInput === normAlias) {
            maxScore = Math.max(maxScore, 0.93);
            matchMethod = 'alias';
            reason = `Matched known alias "${alias}"`;
            break;
          }
          const aliasSim = stringSimilarity(coreInput, normAlias);
          if (aliasSim > 0.85) {
            maxScore = Math.max(maxScore, aliasSim * 0.90);
            matchMethod = 'fuzzy_alias';
            reason = `Fuzzy match on alias "${alias}"`;
          }
        }
      }

      // 3. Common Misspelling match
      if (maxScore < 0.92 && med.commonMisspellings && med.commonMisspellings.length > 0) {
        for (const misspelling of med.commonMisspellings) {
          const normMisspelling = normalizeText(misspelling);
          if (normInput === normMisspelling || coreInput === normMisspelling) {
            maxScore = Math.max(maxScore, 0.92);
            matchMethod = 'common_misspelling';
            reason = `Matched common handwriting misspelling "${misspelling}"`;
            break;
          }
        }
      }

      // 4. Fuzzy distance matching
      if (maxScore < 0.90) {
        const simLev = stringSimilarity(normInput, medNormName);
        const simDice = diceCoefficient(normInput, medNormName);
        const coreLev = stringSimilarity(coreInput, medCoreName);
        const genericLev = genericNorm ? stringSimilarity(coreInput, genericNorm) : 0;
        const brandLev = brandNorm ? stringSimilarity(coreInput, brandNorm) : 0;

        const combinedSim = Math.max(
          simLev * 0.9,
          simDice * 0.88,
          coreLev * 0.92,
          genericLev * 0.91,
          brandLev * 0.91
        );

        if (combinedSim > maxScore) {
          maxScore = combinedSim;
          matchMethod = 'fuzzy_distance';
          reason = `Fuzzy phonetic/string similarity (${Math.round(combinedSim * 100)}%)`;
        }
      }

      // 5. Strength Alignment Adjustment
      if (maxScore >= 0.60 && inputStrength && medStrength) {
        const cleanInputStr = inputStrength.toLowerCase().replace(/\s+/g, '');
        const cleanMedStr = medStrength.toLowerCase().replace(/\s+/g, '');
        if (cleanInputStr === cleanMedStr) {
          maxScore = Math.min(0.99, maxScore + 0.03);
          reason += ` (Exact strength match: ${inputStrength})`;
        } else {
          // Penalize conflicting strength so correct formulation wins
          maxScore = Math.max(0.40, maxScore - 0.08);
          reason += ` (Strength mismatch: ${inputStrength} vs ${medStrength})`;
        }
      }

      scoredMedicines.push({
        medicine: med,
        score: Math.min(1.0, Math.round(maxScore * 100) / 100),
        matchMethod,
        reason,
      });
    }

    // Sort descending by score
    scoredMedicines.sort((a, b) => b.score - a.score);

    const topCandidate = scoredMedicines[0];
    const secondCandidate = scoredMedicines[1];

    // Filter alternatives with score >= 0.50
    const alternativeCandidates = scoredMedicines
      .slice(1, 5)
      .filter((c) => c.score >= 0.50)
      .map((c) => ({
        medicine: c.medicine._id,
        name: c.medicine.name,
        sellingPrice: c.medicine.sellingPrice,
        quantity: c.medicine.quantity,
        score: c.score,
      }));

    let finalConfidence = topCandidate ? topCandidate.score : 0;
    let matchStatus = 'LOW_CONFIDENCE';
    let uncertainReason = null;

    // Detect ambiguity between top candidates
    const isAmbiguous =
      topCandidate &&
      secondCandidate &&
      topCandidate.score < 0.92 &&
      secondCandidate.score >= 0.65 &&
      topCandidate.score - secondCandidate.score <= 0.12;

    if (isAmbiguous) {
      // Lower confidence due to ambiguity
      finalConfidence = Math.max(0.60, finalConfidence - 0.10);
      matchStatus = 'MEDIUM_CONFIDENCE';
      uncertainReason = `Handwriting is partially unclear and multiple inventory medicines have similar names ("${topCandidate.medicine.name}" vs "${secondCandidate.medicine.name}"). Pharmacist confirmation required.`;
    } else if (finalConfidence >= 0.90) {
      matchStatus = 'HIGH_CONFIDENCE';
      uncertainReason = null;
    } else if (finalConfidence >= 0.70) {
      matchStatus = 'MEDIUM_CONFIDENCE';
      uncertainReason =
        topCandidate?.reason ||
        'Moderate confidence match. Please verify strength and formulation.';
    } else {
      matchStatus = 'LOW_CONFIDENCE';
      uncertainReason =
        topCandidate && topCandidate.score > 0
          ? `Uncertain medicine name ("${topCandidate.medicine.name}" similarity only ${Math.round(topCandidate.score * 100)}%). Pharmacist review required.`
          : 'No confident medicine match found in inventory. Manual entry required.';
    }

    return {
      recognizedText,
      matchedMedicine: topCandidate && topCandidate.score >= 0.50 ? topCandidate.medicine._id : null,
      matchedMedicineName: topCandidate && topCandidate.score >= 0.50 ? topCandidate.medicine.name : null,
      confidence: Math.round(finalConfidence * 100) / 100,
      matchStatus,
      alternativeCandidates,
      uncertainReason,
      matchMethod: topCandidate ? topCandidate.matchMethod : 'none',
    };
  }

  /**
   * Matches a list of recognized medicines from AI analysis against the inventory
   */
  async matchAllMedicines(recognizedMedicinesList) {
    if (!recognizedMedicinesList || recognizedMedicinesList.length === 0) {
      return [];
    }
    const inventory = await Medicine.find({ isActive: true });
    const results = [];

    for (const item of recognizedMedicinesList) {
      const match = await this.matchMedicine(item.recognizedText, inventory);
      const sigData = extractSig(item.recognizedText);
      const strVal = item.strength || extractStrength(item.recognizedText) || (match.matchedMedicineName ? match.matchedMedicineName.match(/\d+(\.\d+)?\s*(mg|ml|g|mcg|%)/i)?.[0] : '');

      results.push({
        recognizedText: item.recognizedText,
        matchedMedicine: match.matchedMedicine,
        matchedMedicineName: match.matchedMedicineName,
        strength: strVal || '',
        dosage: item.dosage || (match.matchedMedicineName && /cream|oint|soap/i.test(match.matchedMedicineName) ? 'External application' : '1 tablet'),
        frequency: item.frequency || sigData?.frequency || 'Once daily',
        duration: item.duration || '5 days',
        quantity: item.quantity || 1,
        confidence: match.confidence,
        matchStatus: match.matchStatus,
        alternativeCandidates: match.alternativeCandidates,
        uncertainReason: match.uncertainReason,
        matchMethod: match.matchMethod,
        isHandwritten: item.isHandwritten !== false,
      });
    }

    return results;
  }
}

module.exports = new MedicineMatchingService();
