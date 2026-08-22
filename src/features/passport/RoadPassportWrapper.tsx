import { useParams } from 'react-router-dom'
import { RoadPassportPage } from '@/features/passport/RoadPassportPage'

export function CitizenRoadPassportWrapper() {
  const { roadId } = useParams<{ roadId: string }>()
  return <RoadPassportPage roadId={roadId!} />
}

export function GovernmentRoadPassportWrapper() {
  const { roadId } = useParams<{ roadId: string }>()
  return <RoadPassportPage roadId={roadId!} />
}