// Example usage of EliteRanksCard component

import { EliteRanksCard } from './EliteRanksCard'

export function EliteRanksCardExamples() {
  return (
    <div className="space-y-8 p-8">
      {/* Gold League Example */}
      <div>
        <h2 className="text-lg font-bold mb-4">Gold League</h2>
        <EliteRanksCard
          rankName="Gold"
          currentRank={7}
          totalParticipants={100}
          percentile={93}
          badgeColor="gold"
          onViewLeague={() => console.log('View Gold League')}
          icon="👑"
        />
      </div>

      {/* Silver League Example */}
      <div>
        <h2 className="text-lg font-bold mb-4">Silver League</h2>
        <EliteRanksCard
          rankName="Silver"
          currentRank={42}
          totalParticipants={200}
          percentile={79}
          badgeColor="silver"
          onViewLeague={() => console.log('View Silver League')}
          icon="🥈"
        />
      </div>

      {/* Bronze League Example */}
      <div>
        <h2 className="text-lg font-bold mb-4">Bronze League</h2>
        <EliteRanksCard
          rankName="Bronze"
          currentRank={150}
          totalParticipants={500}
          percentile={70}
          badgeColor="bronze"
          onViewLeague={() => console.log('View Bronze League')}
          icon="🥉"
        />
      </div>

      {/* Platinum League Example */}
      <div>
        <h2 className="text-lg font-bold mb-4">Platinum League</h2>
        <EliteRanksCard
          rankName="Platinum"
          currentRank={3}
          totalParticipants={1000}
          percentile={99}
          badgeColor="platinum"
          onViewLeague={() => console.log('View Platinum League')}
          icon="💎"
        />
      </div>

      {/* Diamond League Example */}
      <div>
        <h2 className="text-lg font-bold mb-4">Diamond League</h2>
        <EliteRanksCard
          rankName="Diamond"
          currentRank={1}
          totalParticipants={5000}
          percentile={99.98}
          badgeColor="diamond"
          onViewLeague={() => console.log('View Diamond League')}
          icon="⭐"
        />
      </div>
    </div>
  )
}
