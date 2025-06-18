export interface StreakRecord {
    recordedAt: Date | null
}
export interface Streak {
    id: string
    title: string
    description?: string
    records: StreakRecord[]
    createdAt: Date
    updatedAt: Date
}