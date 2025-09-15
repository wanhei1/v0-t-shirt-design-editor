import { type NextRequest, NextResponse } from "next/server"
<<<<<<< HEAD

interface ComfyUIWorkflow {
  "3": {
    inputs: {
      seed: number
      steps: number
      cfg: number
      sampler_name: string
      scheduler: string
      denoise: number
      model: string[]
      positive: string[]
      negative: string[]
      latent_image: string[]
    }
    class_type: string
  }
  "4": {
    inputs: {
      ckpt_name: string
    }
    class_type: string
  }
  "6": {
    inputs: {
      text: string
      clip: string[]
    }
    class_type: string
  }
  "7": {
    inputs: {
      text: string
      clip: string[]
    }
    class_type: string
  }
  "5": {
    inputs: {
      width: number
      height: number
      batch_size: number
    }
    class_type: string
  }
  "8": {
    inputs: {
      samples: string[]
      vae: string[]
    }
    class_type: string
  }
  "9": {
    inputs: {
      filename_prefix: string
      images: string[]
    }
    class_type: string
  }
}

async function generateWithComfyUI(prompt: string): Promise<string> {
  const COMFYUI_URL = process.env.COMFYUI_URL || "http://localhost:8188"

  // ComfyUI workflow for text-to-image generation
  const workflow: ComfyUIWorkflow = {
    "3": {
      inputs: {
        seed: Math.floor(Math.random() * 1000000),
        steps: 20,
        cfg: 8,
        sampler_name: "euler",
        scheduler: "normal",
        denoise: 1,
        model: ["4", 0],
        positive: ["6", 0],
        negative: ["7", 0],
        latent_image: ["5", 0],
      },
      class_type: "KSampler",
    },
    "4": {
      inputs: {
        ckpt_name: "sd_xl_base_1.0.safetensors",
      },
      class_type: "CheckpointLoaderSimple",
    },
    "6": {
      inputs: {
        text: prompt,
        clip: ["4", 1],
      },
      class_type: "CLIPTextEncode",
    },
    "7": {
      inputs: {
        text: "text, watermark, low quality, blurry",
        clip: ["4", 1],
      },
      class_type: "CLIPTextEncode",
    },
    "5": {
      inputs: {
        width: 512,
        height: 512,
        batch_size: 1,
      },
      class_type: "EmptyLatentImage",
    },
    "8": {
      inputs: {
        samples: ["3", 0],
        vae: ["4", 2],
      },
      class_type: "VAEDecode",
    },
    "9": {
      inputs: {
        filename_prefix: "tshirt_design",
        images: ["8", 0],
      },
      class_type: "SaveImage",
    },
  }

  try {
    // Queue the prompt
    const queueResponse = await fetch(`${COMFYUI_URL}/prompt`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: workflow,
        client_id: "tshirt-designer",
      }),
    })

    if (!queueResponse.ok) {
      throw new Error(`ComfyUI queue failed: ${queueResponse.statusText}`)
    }

    const queueData = await queueResponse.json()
    const promptId = queueData.prompt_id

    // Poll for completion
    let completed = false
    let attempts = 0
    const maxAttempts = 60 // 60 seconds timeout

    while (!completed && attempts < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const historyResponse = await fetch(`${COMFYUI_URL}/history/${promptId}`)
      const historyData = await historyResponse.json()

      if (historyData[promptId] && historyData[promptId].status?.completed) {
        completed = true

        // Get the generated image
        const outputs = historyData[promptId].outputs
        if (outputs["9"] && outputs["9"].images && outputs["9"].images.length > 0) {
          const imageName = outputs["9"].images[0].filename
          return `${COMFYUI_URL}/view?filename=${imageName}&type=output`
        }
      }

      attempts++
    }

    throw new Error("Generation timeout")
  } catch (error) {
    console.error("ComfyUI generation error:", error)
    throw error
  }
=======
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
>>>>>>> 0954e09 (初始化项目或更新项目)
}

export async function POST(request: NextRequest) {
  try {
<<<<<<< HEAD
    const { prompt, style = "realistic" } = await request.json()
=======
    const { prompt, style = "realistic", width = 512, height = 512 } = await request.json()
>>>>>>> 0954e09 (初始化项目或更新项目)

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 })
    }

<<<<<<< HEAD
    const enhancedPrompt = `${prompt}, T-shirt design, clean background, high quality, ${style} style, suitable for printing`
=======
    console.log(`正在生成图像，提示词: "${prompt}", 风格: "${style}"`)
>>>>>>> 0954e09 (初始化项目或更新项目)

    let imageUrl: string

    try {
<<<<<<< HEAD
      imageUrl = await generateWithComfyUI(enhancedPrompt)
    } catch (error) {
      console.warn("ComfyUI not available, using fallback:", error)
      // Fallback to placeholder with enhanced styling
      imageUrl = `/placeholder.svg?height=512&width=512&query=${encodeURIComponent(enhancedPrompt)}`
    }

    return NextResponse.json({
      success: true,
      imageUrl,
      prompt: enhancedPrompt,
    })
  } catch (error) {
    console.error("AI generation error:", error)
    return NextResponse.json({ error: "Failed to generate image" }, { status: 500 })
=======
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
>>>>>>> 0954e09 (初始化项目或更新项目)
  }
}
