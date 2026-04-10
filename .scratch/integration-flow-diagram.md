# Gamification Integration Flow Diagram

## Material Completion Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          Client Action                                   │
│         User clicks "Tandai sebagai selesai" (Mark Complete)            │
└──────────────────────────┬──────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                 markMaterialCompleted Action                             │
│                                                                          │
│  1. Verify session (authorization)                                      │
│  2. Validate input (schema validation)                                   │
│  3. Check user ownership (userId match)                                  │
└──────────────────────────┬──────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────────────┐
│             ProgressService.markMaterialCompleted()                      │
│                                                                          │
│  • Mark material as complete in database                                │
│  • Update completion timestamp                                          │
│  • Update course progress                                               │
└──────────────────────────┬──────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────────────┐
│              triggerGamificationFlow() - ERROR SAFE                     │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────┐       │
│  │                                                              │       │
│  │  Try:                                                        │       │
│  │  ┌────────────────────────────────────────────────────────┐ │       │
│  │  │ 1. awardPointsForCompletion(userId, materialId)       │ │       │
│  │  │    → pointsAwarded: 10                                 │ │       │
│  │  │    → totalPoints: calculated                           │ │       │
│  │  │    → experience: awarded                               │ │       │
│  │  └────────────────────────────────────────────────────────┘ │       │
│  │                     │                                        │       │
│  │                     ▼                                        │       │
│  │  ┌────────────────────────────────────────────────────────┐ │       │
│  │  │ 2. checkAndIssueBadges(userId)                        │ │       │
│  │  │    → Check completion % (25%, 50%, 75%, 100%)        │ │       │
│  │  │    → Check streak milestones (3, 7, 30, 100 days)   │ │       │
│  │  │    → Check performance thresholds (80%, 90%, 95%)    │ │       │
│  │  │    → Return: badgeIds: string[]                      │ │       │
│  │  └────────────────────────────────────────────────────────┘ │       │
│  │                     │                                        │       │
│  │                     ▼                                        │       │
│  │  ┌────────────────────────────────────────────────────────┐ │       │
│  │  │ 3. updateUserStreak(userId)                           │ │       │
│  │  │    → Check if activity within 24h grace period       │ │       │
│  │  │    → Increment or reset current streak               │ │       │
│  │  │    → Update longest streak if necessary              │ │       │
│  │  │    → Return: currentStreak, longestStreak            │ │       │
│  │  └────────────────────────────────────────────────────────┘ │       │
│  │                     │                                        │       │
│  │                     ▼                                        │       │
│  │         ┌─ Combine Results ──────┐                          │       │
│  │         │ • pointsAwarded        │                          │       │
│  │         │ • totalPoints          │                          │       │
│  │         │ • badgeIds[]           │                          │       │
│  │         │ • currentStreak        │                          │       │
│  │         │ • longestStreak        │                          │       │
│  │         └────────────────────────┘                          │       │
│  │                     │                                        │       │
│  │  Catch Error:       ▼                                        │       │
│  │  ┌────────────────────────────────────────────────────────┐ │       │
│  │  │ console.error(                                         │ │       │
│  │  │   "Gamification flow error for userId=X materialId=Y" │ │       │
│  │  │ )                                                      │ │       │
│  │  │ Return empty result:                                  │ │       │
│  │  │ {                                                      │ │       │
│  │  │   pointsAwarded: 0, totalPoints: 0,                  │ │       │
│  │  │   badgeIds: [], currentStreak: 0,                    │ │       │
│  │  │   longestStreak: 0                                    │ │       │
│  │  │ }                                                      │ │       │
│  │  └────────────────────────────────────────────────────────┘ │       │
│  │                                                              │       │
│  └──────────────────────────────────────────────────────────────┘       │
└──────────────────────────┬──────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────────────┐
│               Cache Invalidation (5 caches)                              │
│                                                                          │
│  • revalidateTag("courseProgress")                                      │
│  • revalidateTag("progress")                                            │
│  • revalidateTag("userRank")          ◄── NEW                          │
│  • revalidateTag("globalLeaderboard") ◄── NEW                          │
│  • revalidateTag("userBadges")        ◄── NEW                          │
└──────────────────────────┬──────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      Return to Client                                    │
│                                                                          │
│  {                                                                       │
│    gamification: {                                                       │
│      pointsAwarded: 10,                                                  │
│      totalPoints: 45,                                                    │
│      badgeIds: ["completion_25"],                                        │
│      currentStreak: 5,                                                   │
│      longestStreak: 10                                                   │
│    }                                                                      │
│  }                                                                       │
└──────────────────────────┬──────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                     Client Updates UI                                    │
│                                                                          │
│  • Toast notification: "Sudah ditandai selesai"                        │
│  • Refresh page to show updated progress                               │
│  • Display gamification rewards (points, badges, streak)               │
│  • Update leaderboard if visible                                       │
└─────────────────────────────────────────────────────────────────────────┘
```

## Quiz Completion Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          Client Action                                   │
│              User submits quiz answers for validation                    │
└──────────────────────────┬──────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────────────┐
│           validateQuizAndComplete Action                                 │
│                                                                          │
│  1. Verify session (authorization)                                      │
│  2. Validate input (schema validation)                                   │
│  3. Check user ownership (userId match)                                  │
└──────────────────────────┬──────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────────────┐
│         ProgressService.validateQuizAndComplete()                        │
│                                                                          │
│  • Validate each answer against expected values                         │
│  • Calculate correctness percentage                                     │
│  • Mark material as complete (if all correct)                           │
│  • Return results with correct flag                                     │
└──────────────────────────┬──────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    Decision: Quiz Passed?                                │
└──────────┬──────────────────────────────────────────────────────┬────────┘
           │ YES (correct: true)                                  │ NO
           │                                                       │
           ▼                                                       ▼
    ┌──────────────────┐                                   ┌─────────────────┐
    │ Trigger          │                                   │ Return results  │
    │ Gamification     │                                   │ without rewards │
    │ Flow             │                                   └─────────────────┘
    │ (same as above)  │
    └──────┬───────────┘
           │
           ▼
    ┌──────────────────────────────────┐
    │ Invalidate caches                │
    │ • courseProgress                 │
    │ • progress                       │
    │ • userRank                       │
    │ • globalLeaderboard              │
    │ • userBadges                     │
    └──────┬───────────────────────────┘
           │
           ▼
    ┌──────────────────────────────────┐
    │ Return results with gamification │
    │ {                                │
    │   correct: true,                 │
    │   results: [...],                │
    │   gamification: {...}            │
    │ }                                │
    └─────────────────────────────────┘
```

## Error Handling Flow

```
┌──────────────────────────────────────────────────────────────┐
│            triggerGamificationFlow() called                   │
└───────────────────┬──────────────────────────────────────────┘
                    │
                    ▼
         ┌──────────────────────┐
         │  Try to execute:     │
         │  - Award points      │
         │  - Check badges      │
         │  - Update streak     │
         └──────────┬───────────┘
                    │
        ┌───────────┴───────────┐
        │ Any error occurs?     │
        └───┬─────────────────┬─┘
            │YES              │NO
            │                 │
            ▼                 ▼
    ┌──────────────────┐  ┌────────────────────┐
    │ Catch error      │  │ Return complete    │
    │                  │  │ gamification       │
    │ 1. Log to console│  │ result with:       │
    │    with context: │  │ - pointsAwarded    │
    │    userId        │  │ - totalPoints      │
    │    materialId    │  │ - badgeIds         │
    │    error message │  │ - currentStreak    │
    │                  │  │ - longestStreak    │
    │ 2. Return empty: │  └────────────────────┘
    │    {             │
    │      points: 0,  │
    │      total: 0,   │
    │      badges: [],  │
    │      streak: 0,  │
    │      longest: 0  │
    │    }             │
    └──────────────────┘
            │
            ▼
    ┌──────────────────────────────────┐
    │ Material completion continues    │
    │ successfully without rewards     │
    │ (graceful degradation)           │
    └──────────────────────────────────┘
```

## Cache Invalidation Strategy

```
User Action: markMaterialCompleted
                │
                ▼
    ┌───────────────────────────┐
    │ Material Completion       │
    │ Progress Updated          │
    └───────────┬───────────────┘
                │
                ├─► revalidateTag("courseProgress")
                │   → Refresh course progress
                │
                ├─► revalidateTag("progress") 
                │   → Refresh specific material progress
                │
                ├─► revalidateTag("userRank")
                │   → Refresh leaderboard position
                │
                ├─► revalidateTag("globalLeaderboard")
                │   → Refresh global rankings
                │
                └─► revalidateTag("userBadges")
                    → Refresh user's badge list
```

## Key Features

### 1. **Atomic Gamification**
All gamification updates happen together or not at all (within a transaction).

### 2. **Graceful Degradation**
Even if gamification fails, material completion succeeds with empty rewards.

### 3. **Error Context**
All errors logged with userId and materialId for easy debugging and monitoring.

### 4. **Cache Invalidation**
All affected caches invalidated to ensure fresh data across the application.

### 5. **Type Safety**
Strong TypeScript types ensure compile-time error detection.

### 6. **Authorization**
User ownership verified at every step to prevent unauthorized access.
