"use client"

import { useState } from "react"
import type { Product } from "../../types/Product"
import { Loader2, ImageOff, Folder, ShoppingCart, Plus } from 'lucide-react'
import "./ProductCard.css"
import { useAuth } from "../../auth/AuthContext"
import { insertItem } from "../../api/services/CartService"
import { Alert } from "../UI/Alert"

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)
  const [isAdding, setIsAdding] = useState(false)
  const [alerts, setAlerts] = useState<
    Array<{ id: number; type: "success" | "error" | "info" | "warning"; message: string }>
  >([])
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="product-card-skeleton">
        <div className="skeleton-image"></div>
        <div className="skeleton-content">
          <div className="skeleton-title"></div>
          <div className="skeleton-description"></div>
          <div className="skeleton-price"></div>
          <div className="skeleton-button"></div>
        </div>
      </div>
    )
  }

  const showAlert = (type: "success" | "error" | "info" | "warning", message: string) => {
    const id = Date.now()
    setAlerts((prev) => [...prev, { id, type, message }])
  }

  const removeAlert = (id: number) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== id))
  }

  const handleImageLoad = () => {
    setImageLoaded(true)
  }

  const handdleAdd = async () => {
    if (isAdding) return
    
    setIsAdding(true)
    try {
      const response = await insertItem(user?.clientId || 0, product.id, 1)
      console.log(response)
      
      if (response) {
        showAlert("success", `${product.name} agregado al carrito`)
      }
    } catch (error) {
      showAlert("error", "Error al agregar el producto al carrito")
      console.error("Error adding to cart:", error)
    } finally {
      setIsAdding(false)
    }
  }

  const handleImageError = () => {
    setImageError(true)
    setImageLoaded(true)
  }

  const getStockStatus = () => {
    if (product.stock === undefined) return null
    if (product.stock === 0) return "out-of-stock"
    if (product.stock <= 5) return "low-stock"
    return "in-stock"
  }

  const getStockMessage = () => {
    if (product.stock === undefined) return null
    if (product.stock === 0) return "Sin stock"
    if (product.stock <= 5) return `${product.stock} disponibles`
    return `${product.stock} disponibles`
  }

  const isOutOfStock = product.stock === 0

  return (
    <>
      <article className="product-card">
        <div className="product-image-container">
          {!imageLoaded && !imageError && (
            <div className="image-loading">
              <Loader2 className="loading-icon" />
            </div>
          )}
          {imageError ? (
            <div className="image-error">
              <ImageOff size={32} />
              <span>Imagen no disponible</span>
            </div>
          ) : (
            <img
              src={product.image || "/placeholder.svg?height=200&width=280"}
              alt={product.name}
              className={`product-image ${imageLoaded ? "loaded" : ""}`}
              onLoad={handleImageLoad}
              onError={handleImageError}
              loading="lazy"
            />
          )}
          {product.stock !== undefined && (
            <div className={`stock-badge ${getStockStatus()}`}>{getStockMessage()}</div>
          )}
          {isOutOfStock && <div className="out-of-stock-overlay">Sin Stock</div>}
        </div>

        <div className="product-content">
          <header className="product-header">
            <h3 className="product-name" title={product.name}>
              {product.name}
            </h3>
            {product.category && (
              <span className="product-category">
                <Folder size={14} />
                {product.category}
              </span>
            )}
          </header>

          <p className="product-description" title={product.description}>
            {product.description}
          </p>

          <footer className="product-footer">
            <div className="price-container">
              <span className="product-price">
                $
                {product.price.toLocaleString("es-ES", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>

            {product.stock !== undefined && (
              <div className="stock-info">
                <div className={`stock-indicator ${getStockStatus()}`}>
                  <span className="stock-dot"></span>
                  <span className="stock-text">{getStockMessage()}</span>
                </div>
              </div>
            )}

            <button
              className={`add-to-cart-btn ${isAdding ? "loading" : ""} ${isOutOfStock ? "disabled" : ""}`}
              onClick={handdleAdd}
              disabled={isAdding || isOutOfStock}
            >
              {isAdding ? (
                <>
                  <Loader2 size={16} className="btn-loading-icon" />
                  Agregando...
                </>
              ) : isOutOfStock ? (
                <>
                  <ShoppingCart size={16} />
                  Sin Stock
                </>
              ) : (
                <>
                  <Plus size={16} />
                  Agregar al Carrito
                </>
              )}
            </button>
          </footer>
        </div>
      </article>

      {/* Alerts */}
      <div className="product-alerts-container">
        {alerts.map((alert) => (
          <Alert key={alert.id} type={alert.type} message={alert.message} onClose={() => removeAlert(alert.id)} />
        ))}
      </div>
    </>
  )
}
