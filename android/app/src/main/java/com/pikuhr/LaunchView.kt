package com.pikuhr

import android.content.Context
import android.widget.ImageView

/** Full-screen startup artwork, preserving its proportions on every display. */
class LaunchView(context: Context) : ImageView(context) {
  init {
    setImageResource(R.drawable.startup_screen)
    scaleType = ScaleType.CENTER_CROP
    setBackgroundColor(android.graphics.Color.rgb(80, 134, 211))
    importantForAccessibility = IMPORTANT_FOR_ACCESSIBILITY_NO_HIDE_DESCENDANTS
    isClickable = true
  }
}
