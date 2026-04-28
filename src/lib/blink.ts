import { createClient } from '@blinkdotnew/sdk'

export const blink = createClient({
  projectId: import.meta.env.VITE_BLINK_PROJECT_ID || 'ai-agency-suite-63belpak',
  publishableKey: import.meta.env.VITE_BLINK_PUBLISHABLE_KEY || 'blnk_pk_ypt-GPGIT5WuC7PRVSpueegRddKu11Mc',
  auth: { mode: 'managed' },
})
