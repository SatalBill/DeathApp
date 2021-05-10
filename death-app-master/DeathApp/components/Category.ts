export enum Category {
  onboarding = 'ONBOARDING',
  firstSteps = 'FIRST_STEPS',
  griefAndSelfCare = 'GRIEF_AND_SELF_CARE',
  funeralAndCeremonies = 'FUNERAL_AND_CEREMONIES',
  legalAndFinancial = 'LEGAL_AND_FINANCIAL',
  admin = 'LIFE_ADMIN',
}


export const categoryToDisplayText = (category: Category): string => {
  switch(category) {
    case Category.onboarding:
      return "Onboarding";
    case Category.firstSteps: 
      return "First steps";
    case Category.griefAndSelfCare:
      return "Grief & Self Care";
    case Category.funeralAndCeremonies:
      return "Funeral & Ceremonies";
    case Category.legalAndFinancial:
      return "Legal & Financial";
    case Category.admin:
      return "Life Admin";
    default:
      console.warn(`Unsupported category ${category}`);
      return "";
  }
}