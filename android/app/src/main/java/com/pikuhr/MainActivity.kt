package com.pikuhr

import android.os.Build
import android.os.Bundle
import android.os.SystemClock
import android.view.ViewGroup
import android.view.WindowManager
import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsCompat
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate

class MainActivity : ReactActivity() {
  private var launchView: LaunchView? = null
  private var launchStarted = 0L
  private var launchHiding = false

  override fun onCreate(savedInstanceState: Bundle?) {
    setTheme(R.style.AppTheme)
    super.onCreate(savedInstanceState)
    launchStarted = SystemClock.uptimeMillis()
    launchView = LaunchView(this).also { view ->
      (window.decorView as ViewGroup).addView(view,
          ViewGroup.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT))
    }
    @Suppress("DEPRECATION")
    window.addFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN)
    WindowCompat.getInsetsController(window, window.decorView)
        .hide(WindowInsetsCompat.Type.systemBars())
  }

  override fun onWindowFocusChanged(hasFocus: Boolean) {
    super.onWindowFocusChanged(hasFocus)
    if (hasFocus && launchView != null && !launchHiding) {
      WindowCompat.getInsetsController(window, window.decorView)
          .hide(WindowInsetsCompat.Type.systemBars())
    }
  }

  fun hideLaunchScreen() {
    val view = launchView ?: return
    if (launchHiding) return
    launchHiding = true
    val remaining = (900L - (SystemClock.uptimeMillis() - launchStarted)).coerceAtLeast(0L)
    view.postDelayed({
      @Suppress("DEPRECATION")
      window.clearFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN)
      val controller = WindowCompat.getInsetsController(window, window.decorView)
      // React Native's StatusBar chooses light or dark icons for the current screen.
      controller.isAppearanceLightNavigationBars = true
      controller.show(WindowInsetsCompat.Type.systemBars())
      val animationsEnabled = Build.VERSION.SDK_INT < Build.VERSION_CODES.O ||
          android.animation.ValueAnimator.areAnimatorsEnabled()
      val duration = if (animationsEnabled) 220L else 0L
      view.animate().alpha(0f).setDuration(duration).withEndAction {
        (view.parent as? ViewGroup)?.removeView(view)
        launchView = null
      }.start()
    }, remaining)
  }

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  override fun getMainComponentName(): String = "Pikuhr"

  /**
   * Returns the instance of the [ReactActivityDelegate]. We use [DefaultReactActivityDelegate]
   * which allows you to enable New Architecture with a single boolean flags [fabricEnabled]
   */
  override fun createReactActivityDelegate(): ReactActivityDelegate =
      DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)
}
