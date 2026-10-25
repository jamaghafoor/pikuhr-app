package com.pikuhr

import android.app.Activity
import android.content.Context
import android.content.Intent
import android.content.ContentValues
import android.os.Build
import android.os.Environment
import android.provider.MediaStore
import com.facebook.react.ReactPackage
import com.facebook.react.bridge.*
import com.facebook.react.uimanager.ViewManager
import org.json.JSONObject
import java.io.File
import java.util.concurrent.Executors

class PikuhrDevicePackage : ReactPackage {
  override fun createNativeModules(context: ReactApplicationContext): List<NativeModule> = listOf(PikuhrDeviceModule(context))
  override fun createViewManagers(context: ReactApplicationContext): List<ViewManager<*, *>> = emptyList()
}

class PikuhrDeviceModule(private val context: ReactApplicationContext) : ReactContextBaseJavaModule(context) {
  private val preferences = context.getSharedPreferences("pikuhr_employee", Context.MODE_PRIVATE)
  private val executor = Executors.newSingleThreadExecutor()
  private data class Pending(val file: File, val name: String, val promise: Promise)
  @Volatile private var pending: Pending? = null
  private val requestCode = 4817
  private val listener = object : BaseActivityEventListener() {
    override fun onActivityResult(activity: Activity, request: Int, result: Int, data: Intent?) {
      if (request != requestCode) return
      val export = pending ?: return
      val uri = data?.data
      if (result != Activity.RESULT_OK || uri == null) {
        export.file.delete()
        pending = null
        export.promise.resolve(Arguments.createMap().apply { putBoolean("cancelled", true) })
        return
      }
      executor.execute {
        try {
          val output = context.contentResolver.openOutputStream(uri, "wt") ?: throw IllegalStateException("The selected location could not be opened.")
          output.use { stream -> export.file.inputStream().use { it.copyTo(stream) } }
          export.promise.resolve(Arguments.createMap().apply {
            putBoolean("cancelled", false)
            putString("filename", export.name)
            putString("uri", uri.toString())
          })
        } catch (error: Exception) {
          export.promise.reject("EXPORT_FAILED", "The PDF could not be saved. Please choose another location.", error)
        } finally {
          export.file.delete()
          pending = null
        }
      }
    }
  }

  init { context.addActivityEventListener(listener) }
  override fun getName() = "PikuhrDevice"

  @ReactMethod fun getProfile(promise: Promise) { promise.resolve(preferences.getString("profile", null)) }
  @ReactMethod fun saveProfile(json: String, promise: Promise) {
    try {
      JSONObject(json)
      if (!preferences.edit().putString("profile", json).commit()) throw IllegalStateException("Profile storage is unavailable.")
      promise.resolve(true)
    } catch (error: Exception) { promise.reject("PROFILE_SAVE_FAILED", "The profile could not be saved.", error) }
  }

  @ReactMethod fun exportPdf(filename: String, json: String, promise: Promise) {
    context.runOnUiQueueThread {
      if (pending != null) {
        promise.reject("EXPORT_BUSY", "Finish the current download first.")
        return@runOnUiQueueThread
      }
      val activity = context.currentActivity
      if (activity == null) {
        promise.reject("NO_ACTIVITY", "Open the app before downloading a PDF.")
        return@runOnUiQueueThread
      }
      var file: File? = null
      try {
        val name = File(filename).name.take(120).let { if (it.endsWith(".pdf", true)) it else "$it.pdf" }
        file = File.createTempFile("pikuhr-report-", ".pdf", context.cacheDir)
        ReportPdf.write(file, JSONObject(json))
        val export = Pending(file, name, promise)
        pending = export
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
          executor.execute { saveToDownloads(export) }
          return@runOnUiQueueThread
        }
        val intent = Intent(Intent.ACTION_CREATE_DOCUMENT).apply {
          addCategory(Intent.CATEGORY_OPENABLE)
          type = "application/pdf"
          putExtra(Intent.EXTRA_TITLE, name)
        }
        activity.startActivityForResult(intent, requestCode)
      } catch (error: Exception) {
        file?.delete()
        pending = null
        promise.reject("EXPORT_FAILED", "The PDF could not be created or the file picker could not be opened.", error)
      }
    }
  }

  @android.annotation.TargetApi(29)
  private fun saveToDownloads(export: Pending) {
    var uri: android.net.Uri? = null
    try {
      val values = ContentValues().apply {
        put(MediaStore.MediaColumns.DISPLAY_NAME, export.name)
        put(MediaStore.MediaColumns.MIME_TYPE, "application/pdf")
        put(MediaStore.MediaColumns.RELATIVE_PATH, "${Environment.DIRECTORY_DOWNLOADS}/Pikuhr")
        put(MediaStore.MediaColumns.IS_PENDING, 1)
      }
      val destination = context.contentResolver.insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, values)
          ?: throw IllegalStateException("Downloads is unavailable.")
      uri = destination
      val output = context.contentResolver.openOutputStream(destination, "w")
          ?: throw IllegalStateException("The PDF destination could not be opened.")
      output.use { stream -> export.file.inputStream().use { it.copyTo(stream) } }
      values.clear()
      values.put(MediaStore.MediaColumns.IS_PENDING, 0)
      if (context.contentResolver.update(destination, values, null, null) == 0) {
        throw IllegalStateException("The PDF could not be published to Downloads.")
      }
      var actualName = export.name
      context.contentResolver.query(destination, arrayOf(MediaStore.MediaColumns.DISPLAY_NAME), null, null, null)?.use {
        if (it.moveToFirst()) actualName = it.getString(0)
      }
      export.promise.resolve(Arguments.createMap().apply {
        putBoolean("cancelled", false)
        putString("filename", actualName)
        putString("uri", destination.toString())
        putString("location", "Downloads/Pikuhr")
      })
    } catch (error: Exception) {
      uri?.let { try { context.contentResolver.delete(it, null, null) } catch (_: Exception) {} }
      export.promise.reject("EXPORT_FAILED", "The PDF could not be saved to Downloads. Check available storage and try again.", error)
    } finally {
      export.file.delete()
      pending = null
    }
  }

  override fun invalidate() {
    context.removeActivityEventListener(listener)
    pending?.let { it.file.delete(); it.promise.reject("EXPORT_CANCELLED", "The app was closed before the export finished.") }
    pending = null
    executor.shutdown()
    super.invalidate()
  }
}
