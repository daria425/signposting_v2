class User {
  constructor(
    name,
    WaId,
    organization,
    postcode,
    completed_onboarding,
    opted_in,
    language
  ) {
    (this.name = name),
      (this.WaId = WaId),
      (this.organization = organization),
      (this.postcode = postcode);
    (this.completed_onboarding = completed_onboarding),
      (this.opted_in = opted_in);
    this.language = language;
  }
}

module.exports = { User };
