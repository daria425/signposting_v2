class User {
  constructor(
    name,
    waId,
    organization,
    postcode,
    completed_onboarding,
    opted_in
  ) {
    (this.name = name),
      (this.waId = waId),
      (this.organization = organization),
      (this.postcode = postcode);
    (this.completed_onboarding = completed_onboarding),
      (this.opted_in = opted_in);
  }
}

module.exports = User;
