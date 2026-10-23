package com.pikuhr

import android.content.Context
import android.graphics.Color
import android.widget.ImageView

/** Show the supplied full-screen image while React Native loads. */
class LaunchView(context: Context) : ImageView(context) {
  init {
    setImageResource(R.drawable.startup_screen)
    // Fill every display without stretching the artwork or adding empty borders.
    scaleType = ScaleType.CENTER_CROP
    setBackgroundColor(Color.WHITE)
    importantForAccessibility = IMPORTANT_FOR_ACCESSIBILITY_NO_HIDE_DESCENDANTS
    isClickable = true
  }
}
