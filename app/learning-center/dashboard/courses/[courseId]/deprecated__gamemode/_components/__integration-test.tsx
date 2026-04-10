// Quick integration test to verify EliteRanksCard can be imported and used

import { EliteRanksCard } from './index'

// Test that the component is properly exported
export function TestEliteRanksCardIntegration() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">EliteRanksCard Integration Test</h1>
      
      <EliteRanksCard
        rankName="Gold"
        currentRank={7}
        totalParticipants={100}
        percentile={93}
        badgeColor="gold"
        icon="👑"
      />
    </div>
  )
}
