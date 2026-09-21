const mongoose = require('mongoose');
require('dotenv').config();
const Medicine = require('../models/Medicine');

const classifications = [
  // Schedule H / Prescription Required Drugs
  {
    filter: /doxycycline/i,
    updates: {
      requiresPrescription: true,
      scheduleType: 'SCHEDULE_H',
      therapeuticClass: 'Tetracycline Antibiotic',
      dosageInstructions: 'Take 1 capsule twice daily after meals with a full glass of water.',
      sideEffects: 'Mild nausea, sun sensitivity, stomach upset.',
      description: 'Broad-spectrum tetracycline antibiotic used to treat bacterial infections, respiratory tract infections, and acne.',
    },
  },
  {
    filter: /griseofulvin/i,
    updates: {
      requiresPrescription: true,
      scheduleType: 'SCHEDULE_H',
      therapeuticClass: 'Systemic Antifungal',
      dosageInstructions: 'Take 1 tablet daily with fatty foods/milk for optimal absorption.',
      sideEffects: 'Headache, GI discomfort, skin rash.',
      description: 'Prescription-only oral antifungal medication used for ringworm, fungal nail infections, and tinea cruris.',
    },
  },
  {
    filter: /amoxicillin 250/i,
    updates: {
      requiresPrescription: true,
      scheduleType: 'SCHEDULE_H',
      therapeuticClass: 'Penicillin Antibiotic',
      dosageInstructions: 'Take 1 capsule every 8 hours as prescribed by physician.',
      sideEffects: 'Diarrhea, mild nausea, rash.',
      description: 'Potent penicillin-class antibiotic for ear, nose, throat, skin, and urinary tract infections.',
    },
  },
  {
    filter: /amoxicillin 500/i,
    updates: {
      requiresPrescription: true,
      scheduleType: 'SCHEDULE_H',
      therapeuticClass: 'Penicillin Antibiotic',
      dosageInstructions: 'Take 1 capsule every 8 to 12 hours as prescribed by physician.',
      sideEffects: 'Diarrhea, mild nausea, rash.',
      description: 'High-strength penicillin antibiotic for moderate to severe respiratory and systemic infections.',
    },
  },
  {
    filter: /azithromycin/i,
    updates: {
      requiresPrescription: true,
      scheduleType: 'SCHEDULE_H',
      therapeuticClass: 'Macrolide Antibiotic',
      dosageInstructions: 'Take 1 tablet once daily 1 hour before or 2 hours after meals for 3-5 days.',
      sideEffects: 'Loose stools, stomach cramps, nausea.',
      description: 'Macrolide antibiotic active against respiratory infections, pneumonia, and strep throat.',
    },
  },
  {
    filter: /pantoprazole/i,
    updates: {
      requiresPrescription: true,
      scheduleType: 'SCHEDULE_H',
      therapeuticClass: 'Proton Pump Inhibitor (Gastro)',
      dosageInstructions: 'Take 1 tablet in the morning 30 minutes before breakfast.',
      sideEffects: 'Mild headache, abdominal pain, flatulence.',
      description: 'Proton pump inhibitor that reduces stomach acid production, treating GERD, acidity, and gastric ulcers.',
    },
  },
  {
    filter: /metformin/i,
    updates: {
      requiresPrescription: true,
      scheduleType: 'SCHEDULE_H',
      therapeuticClass: 'Oral Antidiabetic (Biguanide)',
      dosageInstructions: 'Take 1 tablet with or after evening meal as directed by endocrinologist.',
      sideEffects: 'Gastrointestinal disturbance, metallic taste.',
      description: 'First-line prescription medication for glycemic control and type 2 diabetes mellitus.',
    },
  },

  // Over The Counter (OTC) - Direct Purchase Without Prescription
  {
    filter: /paracetamol 500/i,
    updates: {
      requiresPrescription: false,
      scheduleType: 'OTC',
      therapeuticClass: 'Antipyretic & Analgesic',
      dosageInstructions: 'Take 1 tablet every 4 to 6 hours as needed for fever or pain (max 4g/day).',
      sideEffects: 'Generally very well tolerated. Rare allergic rash.',
      description: 'Everyday over-the-counter painkiller and fever reducer for headaches, aches, and viral fevers.',
    },
  },
  {
    filter: /dolo 650/i,
    updates: {
      requiresPrescription: false,
      scheduleType: 'OTC',
      therapeuticClass: 'Antipyretic & Analgesic',
      dosageInstructions: 'Take 1 tablet up to 3 times daily after meals for high fever or acute body aches.',
      sideEffects: 'Extremely safe within recommended dosages.',
      description: 'Doctor-recommended 650mg paracetamol formula for fast relief from high fever, headaches, and flu aches.',
    },
  },
  {
    filter: /cetirizine/i,
    updates: {
      requiresPrescription: false,
      scheduleType: 'OTC',
      therapeuticClass: 'Antihistamine / Anti-Allergy',
      dosageInstructions: 'Take 1 tablet at bedtime for seasonal allergies, hives, or runny nose.',
      sideEffects: 'Mild daytime drowsiness, dry mouth.',
      description: 'Fast-acting non-sedating antihistamine for sneezing, runny nose, allergic rhinitis, and itchy skin hives.',
    },
  },
  {
    filter: /ibuprofen/i,
    updates: {
      requiresPrescription: false,
      scheduleType: 'OTC',
      therapeuticClass: 'NSAID Pain & Inflammation',
      dosageInstructions: 'Take 1 tablet with food or milk every 6-8 hours as required for pain.',
      sideEffects: 'Stomach irritation if taken without food.',
      description: 'Non-steroidal anti-inflammatory drug providing rapid relief from toothaches, joint pain, and sprains.',
    },
  },
  {
    filter: /cough syrup/i,
    updates: {
      requiresPrescription: false,
      scheduleType: 'OTC',
      therapeuticClass: 'Cough & Cold Expectorant',
      dosageInstructions: '10ml (2 teaspoons) three times daily after food. Shake well before use.',
      sideEffects: 'Mild sleepiness.',
      description: 'Soothing relief for dry, irritating coughs, chest congestion, and throat tickles.',
    },
  },
  {
    filter: /amorolfine/i,
    updates: {
      requiresPrescription: false,
      scheduleType: 'OTC',
      therapeuticClass: 'Topical Antifungal Cream',
      dosageInstructions: 'Apply a thin layer to affected skin area once daily at night. Wash hands after use.',
      sideEffects: 'Mild temporary skin irritation or redness at site.',
      description: 'External antifungal cream for athlete’s foot, fungal skin patches, and localized dermatomycosis.',
    },
  },
  {
    filter: /ketoconazole soap/i,
    updates: {
      requiresPrescription: false,
      scheduleType: 'OTC',
      therapeuticClass: 'Medicated Antifungal Cleanser',
      dosageInstructions: 'Work into a rich lather on body and scalp, leave for 2-3 minutes, then rinse thoroughly.',
      sideEffects: 'Mild dryness or irritation.',
      description: 'Medicated bathing bar enriched with 2% Ketoconazole for dandruff, pityriasis versicolor, and body fungal hygiene.',
    },
  },
];

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB Atlas for medicine classification...');

    for (const item of classifications) {
      const result = await Medicine.updateMany(
        { name: item.filter },
        { $set: item.updates }
      );
      console.log(`Updated for ${item.filter}: matched ${result.matchedCount}, modified ${result.modifiedCount}`);
    }

    // Verify all
    const all = await Medicine.find({}).select('name requiresPrescription scheduleType therapeuticClass');
    console.log('\n--- Current Medicine Classifications ---');
    all.forEach((m) => {
      console.log(`${m.requiresPrescription ? '🔴 [Rx REQUIRED]' : '🟢 [OTC DIRECT]'} [${m.scheduleType}] ${m.name} (${m.therapeuticClass})`);
    });

    await mongoose.disconnect();
    console.log('\nClassification successfully updated in Atlas!');
  } catch (err) {
    console.error('Classification error:', err);
    process.exit(1);
  }
}

run();
