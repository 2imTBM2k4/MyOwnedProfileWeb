'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Monitor, Mouse, Keyboard, Headphones, Cpu, Gamepad2, Mic, ExternalLink } from 'lucide-react'
import { SocialIcon } from '@/components/SocialIcon'

type Profile = {
  username: string | null
  bio: string | null
  avatar_url: string | null
  cover_url: string | null
}

type Gear = {
  id: string
  name: string
  brand: string | null
  category: string | null
  status: 'active' | 'retired' | null
  image_url: string | null
}

type SocialLink = {
  id: string
  platform: string
  url: string
  display_name: string | null
}

type Game = {
  id: string
  title: string
  profile_url: string | null
  status: 'online' | 'offline' | null
  image_url?: string | null
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  monitor: <Monitor className="w-5 h-5" />,
  mouse: <Mouse className="w-5 h-5" />,
  keyboard: <Keyboard className="w-5 h-5" />,
  headset: <Headphones className="w-5 h-5" />,
  headphones: <Headphones className="w-5 h-5" />,
  cpu: <Cpu className="w-5 h-5" />,
  gpu: <Cpu className="w-5 h-5" />,
  microphone: <Mic className="w-5 h-5" />,
  mic: <Mic className="w-5 h-5" />,
}

const GAME_STATUS_COLORS: Record<string, string> = {
  online:       'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  offline:      'bg-slate-500/20 text-slate-400 border-slate-500/30',
  // legacy values
  playing:      'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  completed:    'bg-slate-500/20 text-slate-400 border-slate-500/30',
  plan_to_play: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
  dropped:      'bg-slate-500/20 text-slate-400 border-slate-500/30',
}

const GAME_STATUS_LABELS: Record<string, string> = {
  online:       'Online',
  offline:      'Offline',
  playing:      'Online',
  completed:    'Offline',
  plan_to_play: 'Offline',
  dropped:      'Offline',
}

const isOnline = (status: string | null) =>
  status === 'online' || status === 'playing'

type Tab = 'setup' | 'games'

export default function HomePage() {
  const [tab, setTab] = useState<Tab>('setup')
  const [profile, setProfile] = useState<Profile | null>(null)
  const [gears, setGears] = useState<Gear[]>([])
  const [games, setGames] = useState<Game[]>([])
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([])

  useEffect(() => {
    fetch('/api/profile').then(r => r.json()).then(d => d && setProfile(d))
    fetch('/api/gears').then(r => r.json()).then(setGears)
    fetch('/api/games').then(r => r.json()).then(setGames)
    fetch('/api/social-links').then(r => r.json()).then(setSocialLinks)
  }, [])

  const tabs: { key: Tab; label: string }[] = [
    { key: 'setup', label: 'GAMING SETUP' },
    { key: 'games', label: 'GAMES' },
  ]

  const username = profile?.username || 'SILENTBOIZ'
  const bio = profile?.bio || 'A tech enthusiast, gamer, and maker.'
  const avatarUrl = profile?.avatar_url
  const coverUrl = profile?.cover_url

  return (
    <div className="min-h-screen relative text-white">
      {/* Background Cover - Full page */}
      <div className="fixed inset-0 z-0">
        {coverUrl ? (
          <>
            <img src={coverUrl} alt="cover" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-[#080d14]/85 to-[#080d14]" />
          </>
        ) : (
          <div className="relative w-full h-full bg-[#080d14]">
            <div className="absolute inset-0"
              style={{ backgroundImage: 'radial-gradient(ellipse at 20% 60%, #1d4ed840 0%, transparent 55%), radial-gradient(ellipse at 80% 40%, #0ea5e930 0%, transparent 55%)' }}
            />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Profile Header */}
        <div className="max-w-4xl mx-auto px-4 pt-12">
          <div className="mb-4 flex items-end gap-5">
            <div className="w-28 h-28 md:w-32 md:h-32 rounded-full border-4 border-black/30 shrink-0 shadow-2xl overflow-hidden bg-gradient-to-br from-blue-600 to-cyan-700 flex items-center justify-center text-4xl font-bold">
              {avatarUrl
                ? <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" />
                : username[0].toUpperCase()
              }
            </div>
            <div className="pb-2">
              <h1 className="text-2xl md:text-3xl font-bold tracking-wide text-white drop-shadow-lg">{username.toUpperCase()}</h1>
              <p className="text-sm text-slate-300 mt-1 max-w-md drop-shadow">{bio}</p>
            </div>
          </div>

          {/* Social quick links */}
          {socialLinks.length > 0 && (
            <div className="mb-6">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-3">Connect</h3>
              <div className="flex flex-wrap gap-2">
                {socialLinks.map(s => (
                  <Link
                    key={s.id}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/20 bg-black/30 backdrop-blur-sm text-sm text-slate-200 hover:bg-blue-500/20 hover:border-blue-400/40 hover:text-white transition-all group"
                  >
                    <SocialIcon platform={s.platform} size={16} className="group-hover:scale-110 transition-transform" />
                    <span className="font-medium">{s.display_name || s.platform}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="flex gap-0 border-b border-white/20 mb-8">
            {tabs.map(t => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`px-5 py-3 text-xs font-bold tracking-widest whitespace-nowrap transition-all border-b-2 -mb-px ${
                  tab === t.key
                    ? 'border-blue-400 text-blue-400'
                    : 'border-transparent text-slate-300 hover:text-white'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Gaming Setup */}
          {tab === 'setup' && (
            <section className="pb-16">
              {gears.length === 0 ? (
                <p className="text-slate-400 text-center py-16">No gear added yet.</p>
              ) : (() => {
                // Group gears by category
                const groupedGears = gears.reduce((acc, gear) => {
                  const category = gear.category || 'Other'
                  if (!acc[category]) acc[category] = []
                  acc[category].push(gear)
                  return acc
                }, {} as Record<string, Gear[]>)

                // Sort each category: active first, then retired
                Object.keys(groupedGears).forEach(category => {
                  groupedGears[category].sort((a, b) => {
                    if (a.status === 'active' && b.status !== 'active') return -1
                    if (a.status !== 'active' && b.status === 'active') return 1
                    return 0
                  })
                })

                // Sort categories alphabetically
                const sortedCategories = Object.keys(groupedGears).sort()

                return (
                  <div className="space-y-8">
                    {sortedCategories.map(category => (
                      <div key={category}>
                        {/* Category Header */}
                        <h3 className="text-sm font-bold uppercase tracking-widest text-blue-400/80 mb-4 flex items-center gap-2">
                          <span className="text-slate-500">{CATEGORY_ICONS[category.toLowerCase()] || <Monitor className="w-4 h-4" />}</span>
                          {category}
                          <span className="text-xs text-slate-500 font-normal">({groupedGears[category].length})</span>
                        </h3>

                        {/* Gears in this category */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          {groupedGears[category].map(gear => (
                            <div key={gear.id} className="group relative bg-black/40 backdrop-blur-sm border border-white/10 rounded-xl p-5 hover:border-blue-500/40 hover:bg-black/50 transition-all">
                              <div className="flex items-start gap-4">
                                <div className="w-16 h-16 rounded-lg bg-white/10 flex items-center justify-center shrink-0 overflow-hidden">
                                  {gear.image_url
                                    ? <img src={gear.image_url} alt={gear.name} className="w-full h-full object-contain p-1" />
                                    : <span className="text-slate-400">{CATEGORY_ICONS[gear.category?.toLowerCase() || ''] || <Gamepad2 className="w-5 h-5" />}</span>
                                  }
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-semibold text-white truncate">{gear.name}</p>
                                  {gear.brand && <p className="text-sm text-slate-300">{gear.brand}</p>}
                                  {gear.status === 'retired' && (
                                    <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded-full bg-slate-800/80 text-slate-400">Retired</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )
              })()}
            </section>
          )}

          {/* Games */}
          {tab === 'games' && (
            <section className="pb-16">
              {games.length === 0 ? (
                <p className="text-slate-400 text-center py-16">No games added yet.</p>
              ) : (() => {
                // Group games by status
                const onlineGames = games.filter(g => g.status === 'online')
                const offlineGames = games.filter(g => g.status === 'offline' || !g.status)

                return (
                  <div className="space-y-8">
                    {/* Online Games Section */}
                    {onlineGames.length > 0 && (
                      <div>
                        <h3 className="text-sm font-bold uppercase tracking-widest text-emerald-400/80 mb-4 flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                          Đang chơi
                          <span className="text-xs text-slate-500 font-normal">({onlineGames.length})</span>
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          {onlineGames.map(game => (
                            <div key={game.id} className="bg-black/40 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden hover:border-blue-500/40 transition-all">
                              <div className="h-28 bg-gradient-to-br from-blue-900/30 to-cyan-900/20 flex items-center justify-center overflow-hidden">
                                {game.image_url
                                  ? <img src={game.image_url} alt={game.title} className="w-full h-full object-cover" />
                                  : <Gamepad2 className="w-10 h-10 text-blue-500/20" />
                                }
                              </div>
                              <div className="p-4">
                                <div className="flex items-start justify-between gap-2">
                                  <h3 className="font-semibold text-white leading-tight">{game.title}</h3>
                                  <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border shrink-0 bg-emerald-500/15 text-emerald-400 border-emerald-500/25">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                    Online
                                  </span>
                                </div>
                                {game.profile_url && (
                                  <a href={game.profile_url} target="_blank" rel="noopener noreferrer"
                                    className="mt-2 flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors">
                                    <ExternalLink className="w-3 h-3" /> View Profile
                                  </a>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Offline Games Section */}
                    {offlineGames.length > 0 && (
                      <div>
                        <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400/80 mb-4 flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-slate-500" />
                          Offline
                          <span className="text-xs text-slate-500 font-normal">({offlineGames.length})</span>
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          {offlineGames.map(game => (
                            <div key={game.id} className="bg-black/40 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden hover:border-blue-500/40 transition-all">
                              <div className="h-28 bg-gradient-to-br from-blue-900/30 to-cyan-900/20 flex items-center justify-center overflow-hidden">
                                {game.image_url
                                  ? <img src={game.image_url} alt={game.title} className="w-full h-full object-cover" />
                                  : <Gamepad2 className="w-10 h-10 text-blue-500/20" />
                                }
                              </div>
                              <div className="p-4">
                                <div className="flex items-start justify-between gap-2">
                                  <h3 className="font-semibold text-white leading-tight">{game.title}</h3>
                                  <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border shrink-0 bg-slate-700/50 text-slate-400 border-white/10">
                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                                    Offline
                                  </span>
                                </div>
                                {game.profile_url && (
                                  <a href={game.profile_url} target="_blank" rel="noopener noreferrer"
                                    className="mt-2 flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors">
                                    <ExternalLink className="w-3 h-3" /> View Profile
                                  </a>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })()}
            </section>
          )}

        </div>

        <footer className="relative z-10 border-t border-white/10 py-6 text-center text-xs text-slate-500">
          silentboiz — Built with Next.js & Supabase
        </footer>
      </div>
    </div>
  )
}
