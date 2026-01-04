"use client"

import Notification from "@/components/notification/notification"
import "./globals.css"
import { Provider } from "jotai"
import Head from "next/head"
import Script from "next/script"

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  let isKakaoBrowser = false
  if (global.location) {
    var useragt = navigator.userAgent.toLowerCase()
    if (useragt.includes("kakao")) {
      global.location.href =
        "kakaotalk://web/openExternal?url=" +
        encodeURIComponent(
          `https://nuon.iubns.net${global.location?.pathname}${global.location?.search}`
        )
      isKakaoBrowser = true
    }
  }
  var title = "새벽이슬"
  if (global.location?.pathname.includes("retreat")) {
    title = "2026 겨울 수련회"
  }

  return (
    <html lang="en">
      <title>{title}</title>
      <meta name="referrer" content="same-origin" />
      <meta
        httpEquiv="Content-Security-Policy"
        content="upgrade-insecure-requests"
      />
      <meta
        name="viewport"
        content="initial-scale=1.0,user-scalable=no,maximum-scale=1,width=device-width,viewport-fit=cover"
      />

      <meta name="title" property="og:title" content={title} />
      <meta name="description" property="og:description" content="" />
      <meta
        name="image"
        property="og:image"
        content="/retreat/retreat_bg.jpeg"
      />
      <meta name="url" property="og:url" content="/retreat/retreat_bg.jpeg" />
      <meta name="format-detection" content="telephone=no" />
      <Provider>
        <body>
          <Script
            src="https://developers.kakao.com/sdk/js/kakao.js"
            strategy="beforeInteractive"
          />
          <Notification />
          {isKakaoBrowser ? (
            <div>카카오톡 브라우저에서는 사용할 수 없습니다.</div>
          ) : (
            children
          )}
        </body>
      </Provider>
    </html>
  )
}
