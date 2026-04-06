'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Plus, Edit, Trash2, Save, Image as ImageIcon, Gamepad2, Monitor, Link as LinkIcon, Upload, Camera } from 'lucide-react'
import { SocialIcon } from '@/components/SocialIcon'
import ImageCropper from '@/components/ImageCropper'

type Profile = { username: string; bio: string; avatar_url: string; cover_url: string }
type Gear = { id: string; name: string; brand: string | null; category: string | null; status: 'active' | 'retired' | null; image_url: string | null }
type Game = { id: string; title: string; profile_url: string | null; status: 'online' | 'offline' | null; image_url: string | null }
type SocialLink = { id: string; platform: string; url: string; display_name: string | null; display_order: number | null }
type Tab = 'profile' | 'gears' | 'games' | 'social'

const GAME_STATUS_LABELS: Record<string, string> = {
  online: 'Online', offline: 'Offline',
  playing: 'Online', completed: 'Offline', plan_to_play: 'Offline', dropped: 'Offline',
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-slate-400 text-xs uppercase tracking-wider">{label}</Label>
      {children}
    </div>
  )
}

function SI(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <Input {...props} className="bg-[#0a1220] border-white/10 focus:border-blue-500/50 text-white placeholder:text-slate-600 h-9" />
}

function SS({ value, onChange, children }: { value: string; onChange: (v: string) => void; children: React.ReactNode }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)}
      className="w-full bg-[#0a1220] border border-white/10 rounded-md px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-500/50">
      {children}
    </select>
  )
}

// Upload image to Supabase storage via API
async function uploadImage(file: File, bucket: string): Promise<string | null> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('bucket', bucket)
  const res = await fetch('/api/upload', { method: 'POST', body: formData })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    console.error('Upload error:', err)
    return null
  }
  const { url } = await res.json()
  return url
}

// Extract username from social media URL
function extractUsernameFromUrl(url: string): string | null {
  try {
    const urlObj = new URL(url)
    const pathname = urlObj.pathname
    
    // Remove leading/trailing slashes and get the first segment
    const segments = pathname.split('/').filter(s => s.length > 0)
    
    // Common patterns:
    // twitter.com/username
    // twitch.tv/username
    // youtube.com/@username or youtube.com/c/username or youtube.com/user/username
    // instagram.com/username
    // facebook.com/username
    // github.com/username
    // etc.
    
    if (segments.length === 0) return null
    
    // Handle YouTube special cases
    if (urlObj.hostname.includes('youtube.com')) {
      if (segments[0] === '@' || segments[0].startsWith('@')) {
        return segments[0]
      }
      if (segments[0] === 'c' || segments[0] === 'user' || segments[0] === 'channel') {
        return segments[1] || null
      }
    }
    
    // For most platforms, username is the first path segment
    let username = segments[0]
    
    // Remove @ prefix if exists
    if (username.startsWith('@')) {
      username = username.substring(1)
    }
    
    return username
  } catch {
    return null
  }
}

function ImageUpload({ label, value, bucket, onChange }: {
  label: string
  value: string
  bucket: string
  onChange: (url: string) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const url = await uploadImage(file, bucket)
    if (url) onChange(url)
    setUploading(false)
  }

  return (
    <div className="space-y-2">
      <Label className="text-slate-400 text-xs uppercase tracking-wider">{label}</Label>
      <div
        onClick={() => !uploading && inputRef.current?.click()}
        className="relative cursor-pointer group border-2 border-dashed border-white/10 rounded-xl overflow-hidden hover:border-blue-500/40 transition-all"
        style={{ minHeight: bucket === 'covers' ? 140 : 100 }}
      >
        {value ? (
          <img src={value} alt="preview" className="w-full h-full object-cover" style={{ minHeight: bucket === 'covers' ? 140 : 100 }} />
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 py-8 text-slate-600">
            <Upload className="w-6 h-6" />
            <span className="text-xs">Click để chọn ảnh</span>
          </div>
        )}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-2 text-white text-sm font-medium">
          <Upload className="w-4 h-4" />
          {uploading ? 'Đang upload...' : 'Đổi ảnh'}
        </div>
        {uploading && (
          <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>
      <input ref={inputRef} type="file" accept="image/*,.gif" className="hidden" onChange={handleFile} />
    </div>
  )
}

// Small inline upload for gear/game image in dialog
function InlineImageUpload({ value, bucket, onChange }: { value: string; bucket: string; onChange: (url: string) => void }) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const url = await uploadImage(file, bucket)
    if (url) onChange(url)
    setUploading(false)
  }

  return (
    <div className="flex items-center gap-3">
      <div
        onClick={() => !uploading && inputRef.current?.click()}
        className="w-16 h-16 rounded-lg border border-white/10 bg-[#0a1220] flex items-center justify-center cursor-pointer hover:border-blue-500/40 overflow-hidden shrink-0 transition-all"
      >
        {uploading ? (
          <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
        ) : value ? (
          <img src={value} alt="preview" className="w-full h-full object-contain p-1" />
        ) : (
          <ImageIcon className="w-5 h-5 text-slate-600" />
        )}
      </div>
      <div className="flex-1">
        <SI
          placeholder="hoặc dán URL ảnh..."
          value={value}
          onChange={e => onChange(e.target.value)}
        />
        <p className="text-xs text-slate-600 mt-1">Click ô vuông để upload từ máy</p>
      </div>
      <input ref={inputRef} type="file" accept="image/*,.gif" className="hidden" onChange={handleFile} />
    </div>
  )
}

export default function AdminPage() {
  const [tab, setTab] = useState<Tab>('profile')

  const [profile, setProfile] = useState<Profile>({ username: '', bio: '', avatar_url: '', cover_url: '' })
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileSaved, setProfileSaved] = useState(false)
  const [cropSrc, setCropSrc] = useState<string | null>(null)

  const [gears, setGears] = useState<Gear[]>([])
  const [gearsLoading, setGearsLoading] = useState(true)
  const [gearOpen, setGearOpen] = useState(false)
  const [gearEditId, setGearEditId] = useState<string | null>(null)
  const [gearForm, setGearForm] = useState({ name: '', brand: '', category: '', status: 'active' as 'active' | 'retired', image_url: '' })

  const [games, setGames] = useState<Game[]>([])
  const [gamesLoading, setGamesLoading] = useState(true)
  const [gameOpen, setGameOpen] = useState(false)
  const [gameEditId, setGameEditId] = useState<string | null>(null)
  const [gameForm, setGameForm] = useState({ title: '', profile_url: '', status: 'online' as Game['status'], image_url: '' })

  const [socials, setSocials] = useState<SocialLink[]>([])
  const [socialsLoading, setSocialsLoading] = useState(true)
  const [socialOpen, setSocialOpen] = useState(false)
  const [socialEditId, setSocialEditId] = useState<string | null>(null)
  const [socialForm, setSocialForm] = useState({ platform: '', url: '', display_name: '', display_order: '' })

  const fetchProfile = async () => {
    const d = await fetch('/api/profile').then(r => r.json())
    if (d) setProfile({ username: d.username || '', bio: d.bio || '', avatar_url: d.avatar_url || '', cover_url: d.cover_url || '' })
  }
  const fetchGears = async () => { setGearsLoading(true); setGears(await fetch('/api/gears').then(r => r.json())); setGearsLoading(false) }
  const fetchGames = async () => { setGamesLoading(true); setGames(await fetch('/api/games').then(r => r.json())); setGamesLoading(false) }
  const fetchSocials = async () => { setSocialsLoading(true); setSocials(await fetch('/api/social-links').then(r => r.json())); setSocialsLoading(false) }

  useEffect(() => { fetchProfile(); fetchGears(); fetchGames(); fetchSocials() }, [])

  const saveProfile = async () => {
    setProfileSaving(true)
    await fetch('/api/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: profile.username || null, bio: profile.bio || null, avatar_url: profile.avatar_url || null, cover_url: profile.cover_url || null }),
    })
    setProfileSaving(false); setProfileSaved(true)
    setTimeout(() => setProfileSaved(false), 2500)
  }

  const handleGearSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const body = JSON.stringify({ ...gearForm, image_url: gearForm.image_url || null })
    gearEditId ? await fetch(`/api/gears/${gearEditId}`, { method: 'PATCH', body }) : await fetch('/api/gears', { method: 'POST', body })
    setGearOpen(false); setGearEditId(null); setGearForm({ name: '', brand: '', category: '', status: 'active', image_url: '' }); fetchGears()
  }
  const openAddGear = () => { setGearEditId(null); setGearForm({ name: '', brand: '', category: '', status: 'active', image_url: '' }); setGearOpen(true) }
  const editGear = (g: Gear) => { setGearEditId(g.id); setGearForm({ name: g.name, brand: g.brand || '', category: g.category || '', status: g.status || 'active', image_url: g.image_url || '' }); setGearOpen(true) }
  const deleteGear = async (id: string) => { if (!confirm('Delete this gear?')) return; await fetch(`/api/gears/${id}`, { method: 'DELETE' }); fetchGears() }

  const handleGameSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const body = JSON.stringify({ ...gameForm, image_url: gameForm.image_url || null, profile_url: gameForm.profile_url || null })
    gameEditId ? await fetch(`/api/games/${gameEditId}`, { method: 'PATCH', body }) : await fetch('/api/games', { method: 'POST', body })
    setGameOpen(false); setGameEditId(null); setGameForm({ title: '', profile_url: '', status: 'online', image_url: '' }); fetchGames()
  }
  const openAddGame = () => { setGameEditId(null); setGameForm({ title: '', profile_url: '', status: 'online', image_url: '' }); setGameOpen(true) }
  const editGame = (g: Game) => { setGameEditId(g.id); setGameForm({ title: g.title, profile_url: g.profile_url || '', status: g.status || 'online', image_url: g.image_url || '' }); setGameOpen(true) }
  const deleteGame = async (id: string) => { if (!confirm('Delete this game?')) return; await fetch(`/api/games/${id}`, { method: 'DELETE' }); fetchGames() }

  const handleSocialSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const body = JSON.stringify({ ...socialForm, display_name: socialForm.display_name || null, display_order: socialForm.display_order ? Number(socialForm.display_order) : null })
    socialEditId ? await fetch(`/api/social-links/${socialEditId}`, { method: 'PATCH', body }) : await fetch('/api/social-links', { method: 'POST', body })
    setSocialOpen(false); setSocialEditId(null); setSocialForm({ platform: '', url: '', display_name: '', display_order: '' }); fetchSocials()
  }
  const openAddSocial = () => { setSocialEditId(null); setSocialForm({ platform: '', url: '', display_name: '', display_order: '' }); setSocialOpen(true) }
  const editSocial = (s: SocialLink) => { setSocialEditId(s.id); setSocialForm({ platform: s.platform, url: s.url, display_name: s.display_name || '', display_order: s.display_order?.toString() || '' }); setSocialOpen(true) }
  const deleteSocial = async (id: string) => { if (!confirm('Delete this link?')) return; await fetch(`/api/social-links/${id}`, { method: 'DELETE' }); fetchSocials() }

  const navTabs = [
    { key: 'profile' as Tab, label: 'Profile', icon: <Camera className="w-4 h-4" /> },
    { key: 'gears' as Tab, label: 'Gears', icon: <Monitor className="w-4 h-4" /> },
    { key: 'games' as Tab, label: 'Games', icon: <Gamepad2 className="w-4 h-4" /> },
    { key: 'social' as Tab, label: 'Social Links', icon: <LinkIcon className="w-4 h-4" /> },
  ]

  return (
    <div className="min-h-screen bg-[#080d14] text-white">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

        {/* Tabs */}
        <div className="flex border-b border-white/10 mb-8">
          {navTabs.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 -mb-px transition-all ${
                tab === t.key ? 'border-blue-400 text-blue-400' : 'border-transparent text-slate-500 hover:text-slate-300'
              }`}>
              {t.icon}{t.label}
            </button>
          ))}
        </div>

        {/* ── PROFILE ── */}
        {tab === 'profile' && (
          <div className="space-y-6 max-w-2xl">
            {/* Cover with crop */}
            <div className="space-y-2">
              <Label className="text-slate-400 text-xs uppercase tracking-wider">Cover Image / GIF</Label>
              <div
                className="relative cursor-pointer group border-2 border-dashed border-white/10 rounded-xl overflow-hidden hover:border-blue-500/40 transition-all"
                style={{ height: 160 }}
                onClick={() => document.getElementById('cover-input')?.click()}
              >
                {profile.cover_url ? (
                  <img src={profile.cover_url} alt="cover" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full gap-2 text-slate-600">
                    <Upload className="w-6 h-6" />
                    <span className="text-xs">Click để chọn ảnh cover</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-2 text-white text-sm font-medium">
                  <Upload className="w-4 h-4" /> Đổi cover
                </div>
              </div>
              <input id="cover-input" type="file" accept="image/*" className="hidden" onChange={e => {
                const file = e.target.files?.[0]
                if (!file) return
                // GIF: skip crop, upload directly
                if (file.type === 'image/gif') {
                  uploadImage(file, 'covers').then(url => {
                    if (url) setProfile(p => ({ ...p, cover_url: url }))
                  })
                } else {
                  const url = URL.createObjectURL(file)
                  setCropSrc(url)
                }
                e.target.value = ''
              }} />
              <p className="text-xs text-slate-600">Sau khi chọn ảnh, bạn có thể crop vùng hiển thị. GIF sẽ được upload thẳng (không crop)</p>
            </div>

            {/* Cropper modal */}
            {cropSrc && (
              <ImageCropper
                imageSrc={cropSrc}
                aspect={3 / 1}
                onCancel={() => { setCropSrc(null); URL.revokeObjectURL(cropSrc) }}
                onDone={async blob => {
                  setCropSrc(null)
                  const file = new File([blob], `cover-${Date.now()}.jpg`, { type: 'image/jpeg' })
                  const url = await uploadImage(file, 'covers')
                  if (url) setProfile(p => ({ ...p, cover_url: url }))
                }}
              />
            )}

            <div className="flex items-end gap-6">
              <div className="shrink-0">
                <Label className="text-slate-400 text-xs uppercase tracking-wider block mb-2">Avatar</Label>
                <div className="relative w-20 h-20">
                  <div className="w-20 h-20 rounded-full overflow-hidden bg-gradient-to-br from-blue-600 to-cyan-700 flex items-center justify-center text-2xl font-bold border-2 border-white/10">
                    {profile.avatar_url
                      ? <img src={profile.avatar_url} alt="avatar" className="w-full h-full object-cover" />
                      : (profile.username?.[0] || 'S').toUpperCase()
                    }
                  </div>
                  <label className="absolute inset-0 rounded-full cursor-pointer flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition-all">
                    <Upload className="w-5 h-5 text-white" />
                    <input type="file" accept="image/*,.gif" className="hidden" onChange={async e => {
                      const file = e.target.files?.[0]; if (!file) return
                      const url = await uploadImage(file, 'avatars')
                      if (url) setProfile({ ...profile, avatar_url: url })
                    }} />
                  </label>
                </div>
              </div>
              <p className="text-xs text-slate-500 pb-2">Hỗ trợ JPG, PNG, GIF động</p>
            </div>

            <Field label="Username">
              <SI placeholder="silentboiz" value={profile.username} onChange={e => setProfile({ ...profile, username: e.target.value })} />
            </Field>

            <Field label="Bio / Mô tả">
              <textarea rows={3} placeholder="Giới thiệu bản thân..."
                value={profile.bio} onChange={e => setProfile({ ...profile, bio: e.target.value })}
                className="w-full bg-[#0a1220] border border-white/10 rounded-md px-3 py-2 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 resize-none" />
            </Field>

            <Button onClick={saveProfile} disabled={profileSaving} className="bg-blue-600 hover:bg-blue-500 text-white px-6">
              <Save className="w-4 h-4 mr-2" />
              {profileSaving ? 'Đang lưu...' : profileSaved ? '✓ Đã lưu' : 'Lưu Profile'}
            </Button>
          </div>
        )}

        {/* ── GEARS ── */}
        {tab === 'gears' && (
          <>
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-lg font-semibold text-white">Gears <span className="text-slate-500 text-sm font-normal">({gears.length})</span></h2>
              <Button onClick={openAddGear} className="bg-blue-600 hover:bg-blue-500 text-white">
                <Plus className="mr-2 h-4 w-4" /> Add Gear
              </Button>
            </div>

            <div className="rounded-xl border border-white/8 overflow-hidden bg-[#0a1220]">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/8 hover:bg-transparent">
                    <TableHead className="text-slate-500 font-medium">Name</TableHead>
                    <TableHead className="text-slate-500 font-medium">Brand</TableHead>
                    <TableHead className="text-slate-500 font-medium">Category</TableHead>
                    <TableHead className="text-slate-500 font-medium">Status</TableHead>
                    <TableHead className="text-slate-500 font-medium text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {gearsLoading ? (
                    <TableRow><TableCell colSpan={5} className="text-center text-slate-500 py-10">Loading...</TableCell></TableRow>
                  ) : gears.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="py-12">
                        <div className="flex flex-col items-center gap-3 text-slate-600">
                          <Monitor className="w-8 h-8" />
                          <p className="text-sm">Chưa có gear nào. Nhấn "Add Gear" để thêm.</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : gears.map(g => (
                    <TableRow key={g.id} className="border-white/5 hover:bg-white/3">
                      <TableCell className="font-medium text-white">{g.name}</TableCell>
                      <TableCell className="text-slate-400">{g.brand || '—'}</TableCell>
                      <TableCell className="text-slate-400">{g.category || '—'}</TableCell>
                      <TableCell>
                        <Badge className={g.status === 'active' ? 'bg-blue-500/15 text-blue-400 border border-blue-500/25' : 'bg-slate-700/50 text-slate-400 border border-white/10'}>
                          {g.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right space-x-1">
                        <Button variant="ghost" size="icon" onClick={() => editGear(g)} className="h-8 w-8 hover:text-blue-400 hover:bg-blue-500/10"><Edit className="h-3.5 w-3.5" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => deleteGear(g.id)} className="h-8 w-8 hover:text-red-400 hover:bg-red-500/10"><Trash2 className="h-3.5 w-3.5" /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <Dialog open={gearOpen} onOpenChange={setGearOpen}>
              <DialogContent className="bg-[#0d1825] border-white/10 text-white">
                <DialogHeader><DialogTitle className="text-white">{gearEditId ? 'Edit Gear' : 'Add Gear'}</DialogTitle></DialogHeader>
                <form onSubmit={handleGearSubmit} className="space-y-4 pt-1">
                  <Field label="Name"><SI value={gearForm.name} onChange={e => setGearForm({ ...gearForm, name: e.target.value })} required /></Field>
                  <Field label="Brand"><SI value={gearForm.brand} onChange={e => setGearForm({ ...gearForm, brand: e.target.value })} /></Field>
                  <Field label="Category"><SI placeholder="mouse, keyboard, monitor, headset, cpu, gpu..." value={gearForm.category} onChange={e => setGearForm({ ...gearForm, category: e.target.value })} /></Field>
                  <Field label="Ảnh">
                    <InlineImageUpload value={gearForm.image_url} bucket="gears" onChange={url => setGearForm({ ...gearForm, image_url: url })} />
                  </Field>
                  <Field label="Status">
                    <SS value={gearForm.status} onChange={v => setGearForm({ ...gearForm, status: v as any })}>
                      <option value="active">Active</option>
                      <option value="retired">Retired</option>
                    </SS>
                  </Field>
                  <DialogFooter>
                    <Button type="button" variant="ghost" onClick={() => setGearOpen(false)} className="text-slate-400">Cancel</Button>
                    <Button type="submit" className="bg-blue-600 hover:bg-blue-500">{gearEditId ? 'Update' : 'Create'}</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </>
        )}

        {/* ── GAMES ── */}
        {tab === 'games' && (
          <>
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-lg font-semibold text-white">Games <span className="text-slate-500 text-sm font-normal">({games.length})</span></h2>
              <Button onClick={openAddGame} className="bg-blue-600 hover:bg-blue-500 text-white">
                <Plus className="mr-2 h-4 w-4" /> Add Game
              </Button>
            </div>

            <div className="rounded-xl border border-white/8 overflow-hidden bg-[#0a1220]">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/8 hover:bg-transparent">
                    <TableHead className="text-slate-500 font-medium">Title</TableHead>
                    <TableHead className="text-slate-500 font-medium">Profile Link</TableHead>
                    <TableHead className="text-slate-500 font-medium">Status</TableHead>
                    <TableHead className="text-slate-500 font-medium text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {gamesLoading ? (
                    <TableRow><TableCell colSpan={4} className="text-center text-slate-500 py-10">Loading...</TableCell></TableRow>
                  ) : games.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="py-12">
                        <div className="flex flex-col items-center gap-3 text-slate-600">
                          <Gamepad2 className="w-8 h-8" />
                          <p className="text-sm">Chưa có game nào. Nhấn "Add Game" để thêm.</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : games.map(g => (
                    <TableRow key={g.id} className="border-white/5 hover:bg-white/3">
                      <TableCell className="font-medium text-white">{g.title}</TableCell>
                      <TableCell className="text-slate-400 max-w-[160px] truncate">
                        {g.profile_url ? <a href={g.profile_url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline truncate block">{g.profile_url}</a> : '—'}
                      </TableCell>
                      <TableCell>
                        <Badge className={g.status === 'online' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25' : 'bg-slate-700/50 text-slate-400 border border-white/10'}>
                          <span className={`w-1.5 h-1.5 rounded-full mr-1.5 inline-block ${g.status === 'online' ? 'bg-emerald-400' : 'bg-slate-500'}`} />
                          {GAME_STATUS_LABELS[g.status || ''] || g.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right space-x-1">
                        <Button variant="ghost" size="icon" onClick={() => editGame(g)} className="h-8 w-8 hover:text-blue-400 hover:bg-blue-500/10"><Edit className="h-3.5 w-3.5" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => deleteGame(g.id)} className="h-8 w-8 hover:text-red-400 hover:bg-red-500/10"><Trash2 className="h-3.5 w-3.5" /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <Dialog open={gameOpen} onOpenChange={setGameOpen}>
              <DialogContent className="bg-[#0d1825] border-white/10 text-white">
                <DialogHeader><DialogTitle className="text-white">{gameEditId ? 'Edit Game' : 'Add Game'}</DialogTitle></DialogHeader>
                <form onSubmit={handleGameSubmit} className="space-y-4 pt-1">
                  <Field label="Title"><SI value={gameForm.title} onChange={e => setGameForm({ ...gameForm, title: e.target.value })} required /></Field>
                  <Field label="Profile Link (tùy chọn)"><SI placeholder="https://steamcommunity.com/..." value={gameForm.profile_url} onChange={e => setGameForm({ ...gameForm, profile_url: e.target.value })} /></Field>
                  <Field label="Ảnh bìa">
                    <InlineImageUpload value={gameForm.image_url} bucket="games" onChange={url => setGameForm({ ...gameForm, image_url: url })} />
                  </Field>
                  <Field label="Status">
                    <SS value={gameForm.status || 'online'} onChange={v => setGameForm({ ...gameForm, status: v as Game['status'] })}>
                      <option value="online">Online</option>
                      <option value="offline">Offline</option>
                    </SS>
                  </Field>
                  <DialogFooter>
                    <Button type="button" variant="ghost" onClick={() => setGameOpen(false)} className="text-slate-400">Cancel</Button>
                    <Button type="submit" className="bg-blue-600 hover:bg-blue-500">{gameEditId ? 'Update' : 'Create'}</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </>
        )}

        {/* ── SOCIAL ── */}
        {tab === 'social' && (
          <>
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-lg font-semibold text-white">Social Links <span className="text-slate-500 text-sm font-normal">({socials.length})</span></h2>
              <Button onClick={openAddSocial} className="bg-blue-600 hover:bg-blue-500 text-white">
                <Plus className="mr-2 h-4 w-4" /> Add Link
              </Button>
            </div>

            <div className="rounded-xl border border-white/8 overflow-hidden bg-[#0a1220]">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/8 hover:bg-transparent">
                    <TableHead className="text-slate-500 font-medium">Platform</TableHead>
                    <TableHead className="text-slate-500 font-medium">URL</TableHead>
                    <TableHead className="text-slate-500 font-medium text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {socialsLoading ? (
                    <TableRow><TableCell colSpan={4} className="text-center text-slate-500 py-10">Loading...</TableCell></TableRow>
                  ) : socials.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="py-12">
                        <div className="flex flex-col items-center gap-3 text-slate-600">
                          <LinkIcon className="w-8 h-8" />
                          <p className="text-sm">Chưa có link nào. Nhấn "Add Link" để thêm.</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : socials.map(s => (
                    <TableRow key={s.id} className="border-white/5 hover:bg-white/3">                      <TableCell className="font-medium text-white">
                        <div className="flex items-center gap-2">
                          <SocialIcon platform={s.platform} size={16} className="text-slate-400 shrink-0" />
                          {s.platform}
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-400 max-w-xs truncate">{s.url}</TableCell>
                      <TableCell className="text-right space-x-1">
                        <Button variant="ghost" size="icon" onClick={() => editSocial(s)} className="h-8 w-8 hover:text-blue-400 hover:bg-blue-500/10"><Edit className="h-3.5 w-3.5" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => deleteSocial(s.id)} className="h-8 w-8 hover:text-red-400 hover:bg-red-500/10"><Trash2 className="h-3.5 w-3.5" /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <Dialog open={socialOpen} onOpenChange={setSocialOpen}>
              <DialogContent className="bg-[#0d1825] border-white/10 text-white">
                <DialogHeader><DialogTitle className="text-white">{socialEditId ? 'Edit Link' : 'Add Social Link'}</DialogTitle></DialogHeader>
                <form onSubmit={handleSocialSubmit} className="space-y-4 pt-1">
                  <Field label="Platform"><SI placeholder="Twitter, Twitch, YouTube, Discord..." value={socialForm.platform} onChange={e => setSocialForm({ ...socialForm, platform: e.target.value })} required /></Field>
                  <Field label="Tên hiển thị"><SI placeholder="vd: minh, silentboiz..." value={socialForm.display_name} onChange={e => setSocialForm({ ...socialForm, display_name: e.target.value })} /></Field>
                  <Field label="URL">
                    <SI placeholder="https://..." value={socialForm.url} onChange={e => {
                      const url = e.target.value
                      setSocialForm({ ...socialForm, url })
                      // Auto-extract username from URL if display_name is empty
                      if (url && !socialForm.display_name) {
                        const username = extractUsernameFromUrl(url)
                        if (username) setSocialForm(prev => ({ ...prev, display_name: username }))
                      }
                    }} required />
                    <p className="text-xs text-slate-600 mt-1">Tên hiển thị sẽ tự động được trích xuất từ URL</p>
                  </Field>
                  <DialogFooter>
                    <Button type="button" variant="ghost" onClick={() => setSocialOpen(false)} className="text-slate-400">Cancel</Button>
                    <Button type="submit" className="bg-blue-600 hover:bg-blue-500">{socialEditId ? 'Update' : 'Create'}</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </>
        )}
      </div>
    </div>
  )
}
