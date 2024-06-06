class User {
  constructor(
    username,
    ProfileName,
    WaId,
    organization,
    postcode,
    completed_onboarding,
    opted_in
  ) {
    (this.username = username),
      (this.ProfileName = ProfileName),
      (this.WaId = WaId),
      (this.organization = organization),
      (this.postcode = postcode);
    (this.completed_onboarding = completed_onboarding),
      (this.opted_in = opted_in);
  }
}

module.exports = { User };
