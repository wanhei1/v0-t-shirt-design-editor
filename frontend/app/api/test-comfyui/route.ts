import { NextResponse } from 'next/server'

export async function GET() {
  const comfyUIUrl = process.env.COMFYUI_URL || "http://82.157.19.21:8188"
  const primaryUrl = comfyUIUrl.startsWith('http') ? comfyUIUrl : `http://${comfyUIUrl}`
  
  // 要测试的所有服务器地址
  const serversToTest = [
    primaryUrl,
    "http://127.0.0.1:8188",
    "http://localhost:8188"
  ]

  const results = []

  // 测试所有服务器
  for (const testUrl of serversToTest) {
    try {
      console.log(`Testing connection to: ${testUrl}`)
      
      const response = await fetch(`${testUrl}/queue`, {
        method: 'GET',
        headers: {
          'User-Agent': 'Vercel-ComfyUI-Test/1.0',
          'Accept': 'application/json'
        },
        signal: AbortSignal.timeout(5000)
      })

      const responseText = await response.text()
      
      results.push({
        url: testUrl,
        success: response.ok,
        status: response.status,
        statusText: response.statusText,
        responsePreview: responseText.substring(0, 200)
      })

      // 如果找到可用的服务器，优先返回它
      if (response.ok) {
        console.log(`✓ Successfully connected to: ${testUrl}`)
      }

    } catch (error) {
      console.error(`✗ Connection failed for ${testUrl}:`, error)
      
      results.push({
        url: testUrl,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }

  // 找出第一个成功的服务器
  const availableServer = results.find(r => r.success)

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    vercelRegion: process.env.VERCEL_REGION || 'unknown',
    nodeVersion: process.version,
    primaryServer: primaryUrl,
    availableServer: availableServer?.url || null,
    allResults: results,
    summary: {
      total: serversToTest.length,
      available: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length
    }
  })
}