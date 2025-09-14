"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sparkles, Loader2, Download, Palette } from "lucide-react"

interface AIGeneratorProps {
  onImageGenerated: (imageUrl: string) => void
}

const promptSuggestions = [
  "A majestic dragon breathing colorful flames",
  "Minimalist geometric mountain landscape",
  "Vintage retro sunset with palm trees",
  "Abstract watercolor splash in vibrant colors",
  "Cute cartoon cat wearing sunglasses",
  "Cyberpunk neon city skyline",
  "Hand-drawn botanical flowers and leaves",
  "Space galaxy with stars and planets",
]

const styleOptions = [
  { value: "realistic", label: "Realistic", description: "Photo-realistic style" },
  { value: "cartoon", label: "Cartoon", description: "Fun cartoon style" },
  { value: "anime", label: "Anime", description: "Japanese anime style" },
  { value: "abstract", label: "Abstract", description: "Abstract art style" },
  { value: "minimalist", label: "Minimalist", description: "Clean minimal design" },
  { value: "vintage", label: "Vintage", description: "Retro vintage look" },
]

export function AIGenerator({ onImageGenerated }: AIGeneratorProps) {
  const [prompt, setPrompt] = useState("")
  const [style, setStyle] = useState("realistic")
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedImages, setGeneratedImages] = useState<Array<{ url: string; prompt: string; style: string }>>([])

  const generateImage = async () => {
    if (!prompt.trim()) return

    setIsGenerating(true)
    try {
      const response = await fetch("/api/generate-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt, style }),
      })

      const data = await response.json()

      if (data.success) {
        const newImage = { url: data.imageUrl, prompt: data.prompt, style }
        setGeneratedImages((prev) => [newImage, ...prev])
        setPrompt("")
      } else {
        console.error("Generation failed:", data.error)
      }
    } catch (error) {
      console.error("Generation error:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && e.ctrlKey) {
      generateImage()
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            AI Image Generator
          </CardTitle>
          <CardDescription>Describe your vision and let AI create it for you</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="ai-prompt">Describe your design</Label>
            <Textarea
              id="ai-prompt"
              placeholder="A cool dragon breathing fire with vibrant colors..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={handleKeyPress}
              rows={3}
              className="mt-1"
            />
            <p className="text-xs text-muted-foreground mt-1">Press Ctrl+Enter to generate</p>
          </div>

          <div>
            <Label className="flex items-center gap-2">
              <Palette className="w-4 h-4" />
              Art Style
            </Label>
            <Select value={style} onValueChange={setStyle}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {styleOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div>
                      <div className="font-medium">{option.label}</div>
                      <div className="text-xs text-muted-foreground">{option.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button onClick={generateImage} disabled={!prompt.trim() || isGenerating} className="w-full">
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Image
              </>
            )}
          </Button>

          <div>
            <Label className="text-sm">Quick Ideas:</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {promptSuggestions.slice(0, 4).map((suggestion, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="cursor-pointer hover:bg-primary hover:text-primary-foreground text-xs"
                  onClick={() => setPrompt(suggestion)}
                >
                  {suggestion}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {generatedImages.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Generated Images</CardTitle>
            <CardDescription>Click to add to your design</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {generatedImages.map((image, index) => (
                <div
                  key={index}
                  className="relative group cursor-pointer border-2 border-transparent hover:border-primary rounded-lg overflow-hidden"
                  onClick={() => onImageGenerated(image.url)}
                >
                  <img
                    src={image.url || "/placeholder.svg"}
                    alt={image.prompt}
                    className="w-full aspect-square object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Download className="w-6 h-6 text-white" />
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white p-2 text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="font-medium">{image.style}</div>
                    <div>{image.prompt.slice(0, 40)}...</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
