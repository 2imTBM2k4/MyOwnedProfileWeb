import { createClient } from '@/lib/supabase'

type Game = {
  title: string
  genre: string | null
  status: string | null
  hours_played: number | null
  profile_links: any | null
  notes: string | null
}

export async function generateMetadata({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data } = await supabase.from('games').select('title').eq('id', params.id).single()
  return { title: data?.title || 'Game Profile' }
}

export default async function GameProfilePage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { data, error } = await supabase.from('games').select('*').eq('id', params.id).single()

  if (error || !data) {
    return <div className="container mx-auto py-12">Game not found.</div>
  }

  const game = data as Game

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-4">{game.title}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <p><strong>Genre:</strong> {game.genre}</p>
          <p><strong>Status:</strong> {game.status}</p>
          <p><strong>Hours Played:</strong> {game.hours_played}</p>
          <p><strong>Notes:</strong> {game.notes}</p>
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-2">Profile Links</h2>
          {game.profile_links && typeof game.profile_links === 'object' ? (
            <ul className="space-y-2">
              {Object.entries(game.profile_links).map(([key, value]) => (
                <li key={key}>
                  <a href={value as string} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                    {key}
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p>No profile links available.</p>
          )}
        </div>
      </div>
    </div>
  )
}
