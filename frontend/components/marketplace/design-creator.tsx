'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { apiClient } from '@/lib/api-client';
import { useAuth } from '@/contexts/auth-context';

interface CreateDesignData {
  title: string;
  description: string;
  image_url: string;
}

export function DesignCreator() {
  const { user } = useAuth();
  const [formData, setFormData] = useState<CreateDesignData>({
    title: '',
    description: '',
    image_url: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const url = event.target?.result as string;
        setFormData((prev) => ({ ...prev, image_url: url }));
        setPreviewUrl(url);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent, isPublish: boolean = false) => {
    e.preventDefault();
    
    if (!user) {
      setError('Please log in first');
      return;
    }

    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }

    if (!formData.image_url.trim()) {
      setError('Image is required');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      await apiClient.createDesign({
        ...formData,
        is_published: isPublish,
      });

      setSuccess(
        isPublish
          ? 'Design created and published successfully!'
          : 'Design saved as draft. You can publish it later.'
      );

      // 重置表单
      setFormData({
        title: '',
        description: '',
        image_url: '',
      });
      setPreviewUrl('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create design');
      console.error('Error creating design:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 mb-4">Please log in to create designs</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Create New Design</CardTitle>
          <CardDescription>Upload your T-shirt design to the marketplace</CardDescription>
        </CardHeader>

        <CardContent>
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded text-red-800 text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded text-green-800 text-sm">
              {success}
            </div>
          )}

          <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-6">
            {/* 设计标题 */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Design Title
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., Minimalist Summer Style"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="mt-1 text-xs text-gray-500">Create an attractive title for your design</p>
            </div>

            {/* 设计描述 */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe your design, themes, inspiration..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="mt-1 text-xs text-gray-500">Help other users understand your design concept</p>
            </div>

            {/* 图片上传 */}
            <div>
              <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-1">
                Design Image
              </label>
              <input
                type="file"
                id="image"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
              <p className="mt-1 text-xs text-gray-500">
                Supported formats: JPG, PNG, GIF (recommended size: 1200x1200px)
              </p>
            </div>

            {/* 图像预览 */}
            {previewUrl && (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Preview</p>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="max-h-80 mx-auto rounded"
                />
              </div>
            )}

            {/* 按钮组 */}
            <div className="flex gap-3 pt-6 border-t">
              <Button
                type="submit"
                onClick={(e) => handleSubmit(e, false)}
                disabled={loading}
                variant="outline"
                className="flex-1"
              >
                {loading ? 'Saving...' : 'Save as Draft'}
              </Button>
              <Button
                type="submit"
                onClick={(e) => handleSubmit(e, true)}
                disabled={loading}
                className="flex-1"
              >
                {loading ? 'Publishing...' : 'Publish Now'}
              </Button>
            </div>
          </form>

          {/* 信息提示 */}
          <Card className="mt-8 bg-blue-50 border-blue-200">
            <CardContent className="pt-6">
              <h4 className="font-semibold text-sm text-blue-900 mb-2">💡 Tips for Success</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>✓ Create original designs to stand out</li>
                <li>✓ Write detailed descriptions to attract buyers</li>
                <li>✓ High-quality images increase sales chances</li>
                <li>✓ Publish immediately or save as draft to polish later</li>
              </ul>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}
