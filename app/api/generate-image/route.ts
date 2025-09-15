import { type NextRequest, NextResponse } from "next/server"
import { SimpleComfyUIClient } from "@/lib/simple-comfyui-client"
import { writeFile } from "fs/promises"
import path from "path"

// 样式配置
const styleConfigs: Record<string, {
  negativePrompt: string
  steps: number
  cfg: number
  samplerName: string
  scheduler: string
}> = {
  realistic: {
    negativePrompt: "bad hands, low quality, blurry, ugly, deformed",
    steps: 25,
    cfg: 7.5,
    samplerName: "dpmpp_2m",
    scheduler: "karras"
  },
  cartoon: {
    negativePrompt: "realistic, photo, bad hands, low quality",
    steps: 20,
    cfg: 8.0,
    samplerName: "euler",
    scheduler: "normal"
  },
  anime: {
    negativePrompt: "realistic, photo, western, bad hands, low quality",
    steps: 20,
    cfg: 7.0,
    samplerName: "dpmpp_2m",
    scheduler: "karras"
  },
  abstract: {
    negativePrompt: "realistic, photo, figurative, bad quality",
    steps: 30,
    cfg: 9.0,
    samplerName: "euler_ancestral",
    scheduler: "normal"
  },
  minimalist: {
    negativePrompt: "complex, detailed, cluttered, busy, bad quality",
    steps: 15,
    cfg: 6.0,
    samplerName: "euler",
    scheduler: "normal"
  },
  vintage: {
    negativePrompt: "modern, futuristic, bad hands, low quality",
    steps: 25,
    cfg: 8.5,
    samplerName: "dpmpp_2m",
    scheduler: "karras"
  }
}

async function generateWithComfyUI(prompt: string, style: string): Promise<string> {
  const serverUrl = process.env.COMFYUI_URL ? `http://${process.env.COMFYUI_URL}` : "http://127.0.0.1:8188"
  const client = new SimpleComfyUIClient(serverUrl)

  // 检查连接
  const isConnected = await client.checkConnection()
  if (!isConnected) {
    throw new Error("无法连接到 ComfyUI 服务器")
  }

  // 构建提示词（根据风格调整）
  let enhancedPrompt = prompt
  if (style === "photorealistic") {
    enhancedPrompt = `${prompt}, photorealistic, high quality, professional photography`
  } else if (style === "artistic") {
    enhancedPrompt = `${prompt}, artistic, creative, stylized illustration`
  } else if (style === "minimalist") {
    enhancedPrompt = `${prompt}, minimalist, clean, simple design`
  }

  // 使用简化的 generateImage 方法
  const result = await client.generateImage(
    enhancedPrompt,
    "bad hands, low quality, blurry, distorted",
    {
      width: 512,
      height: 512,
      steps: 20,
      cfg: 7
    }
  )

  // 将 ArrayBuffer 转换为 Base64 URL
  const imageBuffer = result.imageBuffer
  const base64 = Buffer.from(imageBuffer).toString('base64')
  const dataUrl = `data:image/png;base64,${base64}`

  return dataUrl
}

export async function POST(request: NextRequest) {
  try {
    const { prompt, style = "realistic", width = 512, height = 512 } = await request.json()

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 })
    }

    console.log(`正在生成图像，提示词: "${prompt}", 风格: "${style}"`)

    let imageUrl: string

    try {
      imageUrl = await generateWithComfyUI(prompt, style)
      
      return NextResponse.json({
        success: true,
        imageUrl,
        prompt,
        style,
        isPlaceholder: false
      })
      
    } catch (error) {
      console.warn("ComfyUI 生成失败，使用占位符:", error)
      
      // 提供更详细的错误信息
      let errorMessage = "未知错误"
      if (error instanceof Error) {
        errorMessage = error.message
      }
      
      // 回退到占位符图像
      const fallbackUrl = `/placeholder.svg?height=${height}&width=${width}&query=${encodeURIComponent(prompt)}`
      
      return NextResponse.json({
        success: true,
        imageUrl: fallbackUrl,
        prompt: `${prompt} (占位符)`,
        isPlaceholder: true,
        error: errorMessage
      })
    }

  } catch (error) {
    console.error("AI generation error:", error)
    return NextResponse.json(
      { 
        error: "生成图像失败",
        details: error instanceof Error ? error.message : "未知错误"
      }, 
      { status: 500 }
    )
  }
}

// 添加健康检查端点
export async function GET() {
  try {
    const serverUrl = process.env.COMFYUI_URL ? `http://${process.env.COMFYUI_URL}` : "http://127.0.0.1:8188"
    const client = new SimpleComfyUIClient(serverUrl)
    const isAvailable = await client.checkConnection()

    return NextResponse.json({
      status: "ok",
      comfyUIAvailable: isAvailable,
      serverAddress: serverUrl,
      message: isAvailable ? "ComfyUI 连接正常" : "ComfyUI 不可用，使用占位符模式"
    })
  } catch (error) {
    return NextResponse.json({
      status: "error",
      comfyUIAvailable: false,
      error: error instanceof Error ? error.message : "未知错误",
      message: "ComfyUI 连接检查失败"
    })
  }
}
