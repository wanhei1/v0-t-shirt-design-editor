'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { apiClient } from '@/lib/api-client';
import { useAuth } from '@/contexts/auth-context';

interface Design {
  id: string;
  user_id: string;
  title: string;
  description: string;
  image_url: string;
  is_published: boolean;
  created_at: string;
  views: number;
  author?: {
    id: string;
    username: string;
    avatar_url?: string;
  };
}

export function DesignGallery() {
  const { user } = useAuth();
  const [designs, setDesigns] = useState<Design[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDesign, setSelectedDesign] = useState<Design | null>(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const LIMIT = 12;

  // 获取设计库
  useEffect(() => {
    const fetchGallery = async () => {
      try {
        setLoading(true);
        const response = await apiClient.getDesignGallery(LIMIT, page * LIMIT) as unknown as { data?: Design[] } | Design[];
        const galleryData = (response as { data?: Design[] })?.data || (response as Design[]);
        
        if (page === 0) {
          setDesigns(galleryData);
        } else {
          setDesigns((prev) => [...prev, ...galleryData]);
        }
        
        setHasMore(galleryData.length === LIMIT);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load designs');
        console.error('Error fetching gallery:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchGallery();
  }, [page]);

  const handleViewAuthor = async (authorId: string) => {
    try {
      const response = await apiClient.getAuthorDesigns(authorId) as unknown as { data?: Design[] } | Design[];
      const authorDesigns = (response as { data?: Design[] })?.data || (response as Design[]);
      setDesigns(authorDesigns);
      setPage(0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load author designs');
    }
  };

  if (loading && page === 0) {
    return <div className="text-center py-12">Loading designs...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {error && (
        <Card className="mb-6 bg-red-50 border-red-200">
          <CardContent className="pt-6">
            <p className="text-red-800">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* 设计网格 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {designs.map((design) => (
          <Card
            key={design.id}
            className="cursor-pointer overflow-hidden transition hover:shadow-lg hover:scale-105"
            onClick={() => setSelectedDesign(design)}
          >
            <div className="relative bg-gray-100 h-48 overflow-hidden">
              {design.image_url ? (
                <img
                  src={design.image_url}
                  alt={design.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  No image
                </div>
              )}
              {design.is_published && (
                <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded text-xs font-semibold">
                  Published
                </div>
              )}
            </div>
            <CardContent className="p-4">
              <h3 className="font-semibold text-sm truncate">{design.title}</h3>
              <p className="text-xs text-gray-500 mt-1 line-clamp-2">{design.description}</p>
              <div className="flex items-center justify-between mt-3 text-xs text-gray-600">
                <span>👁 {design.views}</span>
                <span>{new Date(design.created_at).toLocaleDateString()}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 加载更多 */}
      {hasMore && (
        <div className="text-center mt-8">
          <Button
            onClick={() => setPage((prev) => prev + 1)}
            disabled={loading}
            variant="outline"
            className="px-8"
          >
            {loading ? 'Loading...' : 'Load More'}
          </Button>
        </div>
      )}

      {/* 设计详情弹窗 */}
      {selectedDesign && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedDesign(null)}
        >
          <Card className="max-w-2xl w-full" onClick={(e) => e.stopPropagation()}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{selectedDesign.title}</CardTitle>
                  <CardDescription>{selectedDesign.description}</CardDescription>
                </div>
                <button
                  onClick={() => setSelectedDesign(null)}
                  className="text-2xl font-bold text-gray-500 hover:text-gray-700"
                >
                  ×
                </button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedDesign.image_url && (
                <img
                  src={selectedDesign.image_url}
                  alt={selectedDesign.title}
                  className="w-full max-h-96 object-contain rounded"
                />
              )}

              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <p className="text-xs text-gray-600">Author</p>
                  <Button
                    variant="link"
                    className="p-0 h-auto text-sm font-semibold"
                    onClick={() => {
                      if (selectedDesign.author) {
                        handleViewAuthor(selectedDesign.author.id);
                        setSelectedDesign(null);
                      }
                    }}
                  >
                    {selectedDesign.author?.username || 'Unknown'}
                  </Button>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Views</p>
                  <p className="text-sm font-semibold">{selectedDesign.views}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Created</p>
                  <p className="text-sm font-semibold">
                    {new Date(selectedDesign.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Status</p>
                  <p className={`text-sm font-semibold ${selectedDesign.is_published ? 'text-green-600' : 'text-yellow-600'}`}>
                    {selectedDesign.is_published ? 'Published' : 'Draft'}
                  </p>
                </div>
              </div>

              {/* 操作按钮 */}
              <div className="flex gap-2 pt-4">
                {user?.id === selectedDesign.user_id && !selectedDesign.is_published && (
                  <Button
                    onClick={async () => {
                      try {
                        await apiClient.publishDesign(selectedDesign.id);
                        setSelectedDesign({
                          ...selectedDesign,
                          is_published: true,
                        });
                      } catch (err) {
                        console.error('Error publishing design:', err);
                      }
                    }}
                    className="flex-1"
                  >
                    Publish Design
                  </Button>
                )}
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setSelectedDesign(null)}
                >
                  Close
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 空状态 */}
      {!loading && designs.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">No designs found</p>
          {user && (
            <Button onClick={() => {}}>Create Your First Design</Button>
          )}
        </div>
      )}
    </div>
  );
}
