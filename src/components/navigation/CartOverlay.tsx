import { useState, useEffect } from "react"
import { X } from "lucide-react"
import { CartItem } from "./CartItem"

interface CartItemData {
  Name: string
  ImageUrl: string
  CartItemId: number
  CartId: number
  ProductId: number
  Quantity: number
  UnitPrice: number
  SubTotal: number
}

interface CartOverlayProps {
  isOpen: boolean
  onClose: () => void
  userId?: number
}

export function CartOverlay({ isOpen, onClose, userId }: CartOverlayProps) {
  const [cartItems, setCartItems] = useState<CartItemData[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch cart items
  const fetchCartItems = async () => {
    if (!userId) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`http://localhost:3000/api/carts/${userId}`)
      if (!response.ok) {
        throw new Error("Error al cargar el carrito")
      }
      const data = await response.json()
      setCartItems(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido")
    } finally {
      setLoading(false)
    }
  }

  // Update item quantity
  const updateQuantity = async (cartItemId: number, newQuantity: number) => {
    if (newQuantity < 1) return

    try {
      const response = await fetch(`http://localhost:3000/api/cart-items/${cartItemId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ quantity: newQuantity }),
      })

      if (!response.ok) {
        throw new Error("Error al actualizar la cantidad")
      }

      // Update local state
      setCartItems((prevItems) =>
        prevItems.map((item) =>
          item.CartItemId === cartItemId
            ? { ...item, Quantity: newQuantity, SubTotal: item.UnitPrice * newQuantity }
            : item,
        ),
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al actualizar")
    }
  }

  // Remove item from cart
  const removeItem = async (cartItemId: number) => {
    try {
      const response = await fetch(`http://localhost:3000/api/cart-items/${cartItemId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Error al eliminar el producto")
      }

      // Update local state
      setCartItems((prevItems) => prevItems.filter((item) => item.CartItemId !== cartItemId))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al eliminar")
    }
  }

  // Calculate total
  const total = cartItems.reduce((sum, item) => sum + item.SubTotal, 0)

  // Fetch cart when overlay opens
  useEffect(() => {
    if (isOpen && userId) {
      fetchCartItems()
    }
  }, [isOpen, userId])

  return (
    <div className={`cart-overlay ${isOpen ? "cart-overlay-open" : ""}`}>
      <div className="cart-content">
        {/* Header */}
        <div className="cart-header">
          <h2 className="cart-title">Mi Carrito</h2>
          <button className="cart-close-button" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="cart-body">
          {loading && (
            <div className="cart-loading">
              <p>Cargando carrito...</p>
            </div>
          )}

          {error && (
            <div className="cart-error">
              <p>{error}</p>
              <button onClick={fetchCartItems} className="retry-button">
                Reintentar
              </button>
            </div>
          )}

          {!loading && !error && cartItems.length === 0 && (
            <div className="cart-empty">
              <p>Tu carrito está vacío</p>
            </div>
          )}

          {!loading && !error && cartItems.length > 0 && (
            <>
              <div className="cart-items">
                {cartItems.map((item) => (
                  <CartItem key={item.CartItemId} item={item} />
                ))}
              </div>

              {/* Footer */}
              <div className="cart-footer">
                <div className="cart-total">
                  <span className="total-label">Total: </span>
                  <span className="total-amount">${total.toFixed(2)}</span>
                </div>
                <button className="checkout-button">Proceder al Pago</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
