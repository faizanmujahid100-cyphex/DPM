interface UserAvatarProps {
  name?: string | null
  photoURL?: string | null
  /** Tailwind classes for the circle container — size + gradient background */
  className?: string
  textClassName?: string
}

export default function UserAvatar({ name, photoURL, className = 'w-8 h-8', textClassName = 'text-sm' }: UserAvatarProps) {
  const initials = name?.charAt(0).toUpperCase() ?? '?'

  if (photoURL) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={photoURL}
        alt={name ?? 'User'}
        className={`${className} rounded-full object-cover shrink-0`}
      />
    )
  }

  return (
    <div className={`${className} rounded-full flex items-center justify-center text-white font-bold shrink-0 ${textClassName}`}>
      {initials}
    </div>
  )
}
