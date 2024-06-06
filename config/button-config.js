const level1Options = {
  english: [
    "Budget, Debt & Benefits",
    "Housing & Bills",
    "Food, Clothes & Home",
    "Families, Youth & Elders",
    "Employment",
    "Health",
    "Local Community Hubs",
    "Vulnerable Situations",
    "Specific groups",
    "Other",
  ],
  french: [
    "Budget, dette et allocations",
    "Logement et factures",
    "Alimentation, vêtements et maison",
    "Familles, jeunes et personnes agées",
    "Emploi",
    "Santé",
    "Centres sociaux",
    "Situations vulnérables",
    "Spécifique (par exemple, ex-armée)",
    "Autre",
  ],
};

const locationOptions = ["Local Only", "National Only", "Local And National"];
const supportedLanguages = ["english", "french", "spanish"];
const seeMoreOptionsValues = ["see-more", "no-more"];
module.exports = {
  level1Options,
  locationOptions,
  seeMoreOptionsValues,
  supportedLanguages,
};
