import React, { useMemo, useCallback } from 'react';
import { FixedSizeGrid as Grid } from 'react-window';
import { Product } from '@/core/domain/entities/Product';
import ProductCard from './ProductCard';


interface VirtualizedProductGridProps {
  products: Product[];
  width: number;
  height: number;
  itemWidth?: number;
  itemHeight?: number;
  onProductClick?: (product: Product) => void;
}

const VirtualizedProductGrid: React.FC<VirtualizedProductGridProps> = ({
  products,
  width,
  height,
  itemWidth = 280,
  itemHeight = 400,
  onProductClick
}) => {
  const columnCount = Math.floor(width / itemWidth);
  const rowCount = Math.ceil(products.length / columnCount);

  const Cell = useCallback(({ columnIndex, rowIndex, style }: any) => {
    const productIndex = rowIndex * columnCount + columnIndex;
    const product = products[productIndex];

    if (!product) return null;

    return (
      <div style={style}>
        <ProductCard
          product={product}
          onClick={() => onProductClick?.(product)}
          className="h-full"
        />
      </div>
    );
  }, [products, columnCount, onProductClick]);

  return (
    <Grid
      columnCount={columnCount}
      columnWidth={itemWidth}
      height={height}
      rowCount={rowCount}
      rowHeight={itemHeight}
      width={width}
    >
      {Cell}
    </Grid>
  );
};

export default VirtualizedProductGrid; 