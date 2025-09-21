'use client'

import { useEffect } from 'react'

export default function GoogleTagManagerNoscript() {
  useEffect(() => {
    const noscript = document.createElement('noscript')
    const iframe = document.createElement('iframe')
    iframe.src = "https://www.googletagmanager.com/ns.html?id=GTM-5VRB6HMK"
    iframe.height = "0"
    iframe.width = "0"
    iframe.style.display = "none"
    iframe.style.visibility = "hidden"
    noscript.appendChild(iframe)
    document.body.appendChild(noscript)

    return () => {
      if (document.body.contains(noscript)) {
        document.body.removeChild(noscript)
      }
    }
  }, [])

  return null
}

