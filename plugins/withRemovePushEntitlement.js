const { createRunOncePlugin, withEntitlementsPlist } = require('expo/config-plugins');

/** Local reminders only — strip APNS so App Store profiles without push capability still build. */
function withRemovePushEntitlement(config) {
  return withEntitlementsPlist(config, (mod) => {
    delete mod.modResults['aps-environment'];
    return mod;
  });
}

module.exports = createRunOncePlugin(
  withRemovePushEntitlement,
  'looptidy-remove-push-entitlement',
  '1.0.0'
);
