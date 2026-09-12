export const MITRE_MAPPINGS = {
  BRUTE_FORCE: {
    tacticId: 'TA0006', tacticName: 'Credential Access',
    techniqueId: 'T1110', techniqueName: 'Brute Force',
    url: 'https://attack.mitre.org/techniques/T1110/'
  },
  BEHAVIORAL_ANOMALY: {
    tacticId: 'TA0001', tacticName: 'Initial Access',
    techniqueId: 'T1078', techniqueName: 'Valid Accounts',
    url: 'https://attack.mitre.org/techniques/T1078/'
  },
  IMPOSSIBLE_TRAVEL: {
    tacticId: 'TA0001', tacticName: 'Initial Access',
    techniqueId: 'T1078.004', techniqueName: 'Valid Accounts: Cloud Accounts',
    url: 'https://attack.mitre.org/techniques/T1078/004/'
  },
  PRIVILEGE_ESCALATION: {
    tacticId: 'TA0004', tacticName: 'Privilege Escalation',
    techniqueId: 'T1548', techniqueName: 'Abuse Elevation Control Mechanism',
    url: 'https://attack.mitre.org/techniques/T1548/'
  }
};
