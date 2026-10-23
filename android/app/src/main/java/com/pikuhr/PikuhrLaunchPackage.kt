package com.pikuhr

import android.content.Context
import com.facebook.react.ReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.uimanager.ViewManager

class PikuhrLaunchPackage : ReactPackage {
  override fun createNativeModules(context: ReactApplicationContext): List<NativeModule> =
      listOf(PikuhrLaunchModule(context))

  override fun createViewManagers(context: ReactApplicationContext): List<ViewManager<*, *>> =
      emptyList()
}

class PikuhrLaunchModule(context: ReactApplicationContext) :
    ReactContextBaseJavaModule(context) {
  private val preferences = context.getSharedPreferences("pikuhr", Context.MODE_PRIVATE)

  override fun getName() = "PikuhrLaunch"

  override fun getConstants(): MutableMap<String, Any> =
      mutableMapOf("hasCompletedOnboarding" to preferences.getBoolean("onboarding_complete", false))

  @ReactMethod
  fun completeOnboarding() {
    preferences.edit().putBoolean("onboarding_complete", true).apply()
  }

  @ReactMethod
  fun hide() {
    reactApplicationContext.currentActivity?.runOnUiThread {
      (reactApplicationContext.currentActivity as? MainActivity)?.hideLaunchScreen()
    }
  }
}
