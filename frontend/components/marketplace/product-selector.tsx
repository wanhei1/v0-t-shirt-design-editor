'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { apiClient } from '@/lib/api-client';

interface Product {
  id: string;
  name: string;
  description: string;
  base_price: number;
  category: string;
  image_url: string | null;
  colors: string[];
}

interface ProductVariant {
  id: string;
  product_id: string;
  color: string;
  gender: string;
  size: string;
  price: number;
  stock: number;
}

const COLORS = ['Black', 'White', 'Red', 'Blue', 'Green', 'Gray'];
const GENDERS = ['Male', 'Female', 'Unisex'];
const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

export function ProductSelector() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedColor, setSelectedColor] = useState<string>('Black');
  const [selectedGender, setSelectedGender] = useState<string>('Unisex');
  const [selectedSize, setSelectedSize] = useState<string>('M');
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 获取所有产品
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await apiClient.getProducts() as { data?: Product[] } | Product[];
        const productList = Array.isArray(response) ? response : (response?.data || []);
        setProducts(productList);
        if (productList.length > 0) {
          setSelectedProduct(productList[0]);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load products');
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // 获取产品变种
  useEffect(() => {
    if (!selectedProduct) return;

    const fetchVariants = async () => {
      try {
        const response = await apiClient.getProductVariants(
          selectedProduct.id,
          selectedColor,
          selectedGender
        ) as { data?: ProductVariant[] } | ProductVariant[];
        const variantList = Array.isArray(response) ? response : (response?.data || []);
        setVariants(variantList);
      } catch (err) {
        console.error('Error fetching variants:', err);
        setVariants([]);
      }
    };

    fetchVariants();
  }, [selectedProduct, selectedColor, selectedGender]);

  const getCurrentVariant = () => {
    return variants.find(
      (v) => v.color === selectedColor && v.gender === selectedGender && v.size === selectedSize
    );
  };

  const variant = getCurrentVariant();

  if (loading) {
    return <div className="text-center py-8">Loading products...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-600">Error: {error}</div>;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* 产品列表 */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Select Product</h2>
        <div className="grid grid-cols-1 gap-4">
          {products.map((product) => (
            <Card
              key={product.id}
              className={`cursor-pointer transition ${
                selectedProduct?.id === product.id
                  ? 'ring-2 ring-blue-500'
                  : 'hover:shadow-lg'
              }`}
              onClick={() => setSelectedProduct(product)}
            >
              <CardHeader>
                <CardTitle>{product.name}</CardTitle>
                <CardDescription>{product.category}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-2">{product.description}</p>
                <p className="font-semibold">¥{product.base_price.toFixed(2)}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* 配置选项 */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Customize</h2>
        <Card>
          <CardContent className="pt-6 space-y-6">
            {/* 颜色选择 */}
            <div>
              <label className="block text-sm font-medium mb-2">Color</label>
              <div className="grid grid-cols-3 gap-2">
                {COLORS.map((color) => (
                  <Button
                    key={color}
                    variant={selectedColor === color ? 'default' : 'outline'}
                    onClick={() => setSelectedColor(color)}
                    className="w-full"
                  >
                    {color}
                  </Button>
                ))}
              </div>
            </div>

            {/* 性别选择 */}
            <div>
              <label className="block text-sm font-medium mb-2">Gender</label>
              <div className="grid grid-cols-3 gap-2">
                {GENDERS.map((gender) => (
                  <Button
                    key={gender}
                    variant={selectedGender === gender ? 'default' : 'outline'}
                    onClick={() => setSelectedGender(gender)}
                    className="w-full"
                  >
                    {gender}
                  </Button>
                ))}
              </div>
            </div>

            {/* 尺码选择 */}
            <div>
              <label className="block text-sm font-medium mb-2">Size</label>
              <div className="grid grid-cols-3 gap-2">
                {SIZES.map((size) => (
                  <Button
                    key={size}
                    variant={selectedSize === size ? 'default' : 'outline'}
                    onClick={() => setSelectedSize(size)}
                    className="w-full"
                  >
                    {size}
                  </Button>
                ))}
              </div>
            </div>

            {/* 价格和库存 */}
            {variant && (
              <div className="bg-blue-50 p-4 rounded">
                <p className="text-sm text-gray-600">Price</p>
                <p className="text-3xl font-bold text-blue-600">¥{variant.price.toFixed(2)}</p>
                <p className="text-sm text-gray-600 mt-2">
                  Stock: {variant.stock > 0 ? variant.stock : 'Out of stock'}
                </p>
              </div>
            )}

            {/* 添加到购物车 */}
            <Button
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 h-auto"
              disabled={!variant || variant.stock === 0}
              onClick={() => {
                if (variant) {
                  console.log('Added to cart:', {
                    product: selectedProduct?.name,
                    color: selectedColor,
                    gender: selectedGender,
                    size: selectedSize,
                    price: variant.price,
                  });
                  // TODO: 集成购物车功能
                }
              }}
            >
              Add to Cart - ¥{variant?.price.toFixed(2)}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
