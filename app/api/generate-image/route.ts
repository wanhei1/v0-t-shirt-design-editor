import { type NextRequest, NextResponse } from "next/server"

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
}

export async function POST(request: NextRequest) {
  try {
    const { prompt, style = "realistic" } = await request.json()

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 })
    }

    const enhancedPrompt = `${prompt}, T-shirt design, clean background, high quality, ${style} style, suitable for printing`

    let imageUrl: string

    try {
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
  }
}
