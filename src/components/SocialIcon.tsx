'use client'

import * as si from 'simple-icons'

// Map platform name -> simple-icons key
const PLATFORM_MAP: Record<string, string> = {
  twitter:   'siX',
  x:         'siX',
  twitch:    'siTwitch',
  youtube:   'siYoutube',
  instagram: 'siInstagram',
  discord:   'siDiscord',
  tiktok:    'siTiktok',
  facebook:  'siFacebook',
  steam:     'siSteam',
  github:    'siGithub',
  linkedin:  'siLinkedin',
  reddit:    'siReddit',
  spotify:   'siSpotify',
  patreon:   'siPatreon',
  kick:      'siKick',
  bluesky:   'siBluesky',
}

export function SocialIcon({ platform, size = 16, className = '' }: {
  platform: string
  size?: number
  className?: string
}) {
  const key = PLATFORM_MAP[platform.toLowerCase().trim()]
  const icon = key ? (si as Record<string, { path: string }>)[key] : null

  if (!icon) {
    return (
      <span className={`flex items-center justify-center font-bold text-xs ${className}`}
        style={{ width: size, height: size }}>
        {platform[0]?.toUpperCase()}
      </span>
    )
  }

  return (
    <svg
      role="img"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="currentColor"
      className={className}
      aria-label={platform}
    >
      <path d={icon.path} />
    </svg>
  )
}
