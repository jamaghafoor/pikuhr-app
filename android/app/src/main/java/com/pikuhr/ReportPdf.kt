package com.pikuhr

import android.graphics.*
import android.graphics.pdf.PdfDocument
import org.json.JSONObject
import java.io.File
import kotlin.math.max

/** Draw actual PDF text and vector shapes; no WebView or screenshot capture. */
internal object ReportPdf {
  fun write(file: File, report: JSONObject) {
    val document = PdfDocument()
    val paint = Paint(Paint.ANTI_ALIAS_FLAG)
    var page: PdfDocument.Page? = null
    var canvas: Canvas? = null
    var pageNumber = 0
    var y = 0f
    fun text(value: String, x: Float, baseline: Float, size: Float, color: Int, bold: Boolean = false) {
      paint.shader = null
      paint.color = color
      paint.textSize = size
      paint.typeface = Typeface.create("sans-serif", if (bold) Typeface.BOLD else Typeface.NORMAL)
      canvas!!.drawText(value, x, baseline, paint)
    }
    fun finishPage() {
      if (page == null) return
      text("Pikuhr | Demo report", 32f, 818f, 9f, Color.GRAY)
      text("Page $pageNumber", 515f, 818f, 9f, Color.GRAY)
      document.finishPage(page)
    }
    fun startPage() {
      finishPage()
      pageNumber++
      page = document.startPage(PdfDocument.PageInfo.Builder(595, 842, pageNumber).create())
      canvas = page!!.canvas
      paint.shader = LinearGradient(0f, 0f, 595f, 0f, Color.rgb(76, 138, 215), Color.rgb(83, 215, 218), Shader.TileMode.CLAMP)
      canvas!!.drawRect(0f, 0f, 595f, 93f, paint)
      text(report.optString("title"), 32f, 39f, 24f, Color.WHITE, true)
      text(report.optString("subtitle"), 32f, 65f, 13f, Color.WHITE)
      y = 116f
    }
    fun ensureSpace(height: Float) { if (y + height > 790f) startPage() }
    fun wrap(value: String, maxWidth: Float, size: Float, bold: Boolean = false): List<String> {
      paint.textSize = size
      paint.typeface = Typeface.create("sans-serif", if (bold) Typeface.BOLD else Typeface.NORMAL)
      return value.split('\n').flatMap { paragraph ->
        val lines = mutableListOf<String>()
        var remaining = paragraph
        while (remaining.isNotEmpty()) {
          var count = paint.breakText(remaining, true, maxWidth, null).coerceAtLeast(1)
          if (count < remaining.length) { val space = remaining.lastIndexOf(' ', count - 1); if (space > 0) count = space }
          lines.add(remaining.take(count))
          remaining = remaining.drop(count).trimStart()
        }
        lines.ifEmpty { listOf("") }
      }
    }
    try {
      startPage()
      for (line in wrap(report.optString("employee"), 530f, 12f)) {
        ensureSpace(18f)
        text(line, 32f, y, 12f, Color.rgb(45, 45, 45), true)
        y += 18f
      }
      y += 12f
      val sections = report.getJSONArray("sections")
      for (index in 0 until sections.length()) {
        val section = sections.getJSONObject(index)
        ensureSpace(65f)
        paint.color = Color.rgb(76, 138, 215)
        canvas!!.drawRoundRect(32f, y - 12f, 563f, y + 18f, 5f, 5f, paint)
        text(section.getString("title"), 44f, y + 8f, 12f, Color.WHITE, true)
        y += 38f
        val rows = section.getJSONArray("rows")
        for (rowIndex in 0 until rows.length()) {
          val row = rows.getJSONObject(rowIndex)
          val labels = wrap(row.getString("label"), 300f, 11f)
          val values = wrap(row.getString("value"), 190f, 11f, true)
          val height = max(labels.size, values.size) * 15f + 12f
          ensureSpace(height)
          labels.forEachIndexed { lineIndex, line -> text(line, 42f, y + lineIndex * 15f, 11f, Color.DKGRAY) }
          values.forEachIndexed { lineIndex, line ->
            paint.textSize = 11f
            paint.typeface = Typeface.create("sans-serif", Typeface.BOLD)
            val right = 551f - paint.measureText(line)
            text(line, right, y + lineIndex * 15f, 11f, Color.BLACK, true)
          }
          y += height
          paint.color = Color.rgb(230, 230, 230)
          canvas!!.drawLine(42f, y - 10f, 551f, y - 10f, paint)
        }
        y += 15f
      }
      for (line in wrap(report.optString("note"), 520f, 9f)) {
        ensureSpace(14f)
        text(line, 32f, y, 9f, Color.GRAY)
        y += 14f
      }
      finishPage()
      file.outputStream().use { document.writeTo(it) }
    } finally { document.close() }
  }
}
