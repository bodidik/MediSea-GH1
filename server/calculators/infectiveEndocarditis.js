// FILE: server/calculators/infectiveEndocarditis.js
export function calculateDukeCriteria(input) {
  const {
    positiveBloodCulture = false,
    echoEvidence = false,
    vascularPhenomena = false,
    immunologicPhenomena = false,
    predisposingHeartCondition = false,
    fever = false,
    minorEchoFindings = false,
    microbiologicalEvidence = false,
  } = input;

  // Major criteria
  let major = 0;
  if (positiveBloodCulture) major++;
  if (echoEvidence) major++;

  // Minor criteria
  let minor = 0;
  if (predisposingHeartCondition) minor++;
  if (fever) minor++;
  if (vascularPhenomena) minor++;
  if (immunologicPhenomena) minor++;
  if (minorEchoFindings) minor++;
  if (microbiologicalEvidence) minor++;

  let diagnosis = "Rejected";
  if (major >= 2 || (major === 1 && minor >= 3) || minor >= 5) {
    diagnosis = "Definite IE";
  } else if ((major === 1 && minor >= 1) || minor >= 3) {
    diagnosis = "Possible IE";
  }

  const perc = Math.min(100, Math.round(((major * 2 + minor) / 7) * 100));

  return { major, minor, diagnosis, perc };
}
