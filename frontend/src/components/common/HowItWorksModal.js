import React from 'react';

export default function HowItWorksModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-8 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center text-xl font-bold shadow-xs">
              💡
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900">How PharmaCare Works</h2>
              <p className="text-xs text-slate-400 mt-0.5">Simple, safe, and transparent AI-assisted pharmacy operations</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 text-lg leading-none p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* 3 Simple Steps */}
        <div className="space-y-4">
          {/* Step 1 */}
          <div className="flex gap-4 p-4 rounded-2xl bg-teal-50/50 border border-teal-100">
            <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center text-lg font-bold shrink-0 shadow-sm">
              1
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-teal-950 flex items-center gap-1.5">
                <span>📤</span> Step 1: Upload Doctor Prescription
              </h3>
              <p className="text-xs text-teal-800/80 leading-relaxed">
                The patient or dispensary staff uploads a handwritten or printed doctor prescription (JPG, PNG, or PDF). The document is safely encrypted and stored in the pharmacy database.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex gap-4 p-4 rounded-2xl bg-purple-50/50 border border-purple-100">
            <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center text-lg font-bold shrink-0 shadow-sm">
              2
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-purple-950 flex items-center gap-1.5">
                <span>⚡</span> Step 2: AI Multimodal Handwriting Vision & Inventory Matching
              </h3>
              <p className="text-xs text-purple-800/80 leading-relaxed">
                Advanced AI reads the doctor's handwriting without hallucinating or inventing missing drugs. It matches recognized names against active pharmacy stock using fuzzy algorithms, calculating confidence scores and highlighting ambiguities.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex gap-4 p-4 rounded-2xl bg-amber-50/50 border border-amber-100">
            <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center text-lg font-bold shrink-0 shadow-sm">
              3
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-amber-950 flex items-center gap-1.5">
                <span>🩺</span> Step 3: Human-in-the-Loop Pharmacist Verification & Billing
              </h3>
              <p className="text-xs text-amber-800/80 leading-relaxed">
                The AI <em>never</em> dispenses drugs autonomously. A licensed pharmacist inspects the original document side-by-side with the AI findings, verifies strength and dosage, and authorizes billing and dispensing.
              </p>
            </div>
          </div>
        </div>

        {/* Safety & Ethics Guarantee */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-2">
          <p className="font-bold text-slate-800 flex items-center gap-1.5">
            <span>⚖️</span> Safety & Fairness Guarantee:
          </p>
          <ul className="space-y-1 list-disc list-inside text-slate-600 text-[11px] pl-1">
            <li>Zero personal demographic bias: Demographic attributes (age, gender, religion, caste) are excluded from AI medicine matching.</li>
            <li>Auditable: Every AI extraction and pharmacist verification action is permanently recorded in the AI Audit log.</li>
            <li>Patient Privacy: Customers can only see their own prescriptions and purchase records.</li>
          </ul>
        </div>

        {/* Close Button */}
        <div className="text-right pt-2">
          <button
            onClick={onClose}
            className="btn-primary px-6 py-2.5 rounded-xl font-bold text-xs shadow-md"
          >
            Got it, thanks!
          </button>
        </div>
      </div>
    </div>
  );
}
