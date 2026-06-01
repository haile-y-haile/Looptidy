const { withEntitlementsPlist } = require('expo/config-plugins');

/** Local reminders only — strip APNS so App Store profiles without push capability still build. */
module.exports function withRemovePushEntitlement(config) {
  return withEntitlementsPlist(config, (mod) => {
    delete mod.modResults['aps-environment'];
    return mod;
  });
}
