import { useState } from "react"
import { useAuth } from "../../auth/AuthContext"
import { Home, Package, History, LogOut, Menu, X, ShoppingCart, Plus, Minus, Trash2 } from "lucide-react"
import { getCat, convertCartToOrder, updateQuantityCart, deleteItem } from "../../api/services/CartService"
import { ConfirmDialog } from "../UI/ConfirmDialog"
import { Alert } from "../UI/Alert"

interface CartItem {
  Name: string
  ImageUrl: string
  CartItemId: number
  CartId: number
  ProductId: number
  Quantity: number
  UnitPrice: number
  SubTotal: number
}

export function NavbarClient() {
  const { user, logout } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [cartLoading, setCartLoading] = useState(false)
  const [cartCount, setCartCount] = useState(0)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<{ cartId: number; productId: number; name: string } | null>(null)
  const [alerts, setAlerts] = useState<
    Array<{ id: number; type: "success" | "error" | "info" | "warning"; message: string }>
  >([])
  const [cartId, setCartId] = useState<number | null>(null)

  const toggleMenu = () => {
    setIsOpen(!isOpen)
  }

  const toggleCart = () => {
    setIsCartOpen(!isCartOpen)
    if (!isCartOpen) {
      fetchCartItems()
    }
  }

  const closeCart = () => {
    setIsCartOpen(false)
  }

  const fetchCartItems = async () => {
    if (!user?.id) return

    setCartLoading(true)
    try {
      const response = await getCat(user.clientId as number)
      if (response) {
        const items = response
        console.log(items)
        setCartItems(items)
        setCartCount(items.reduce((total: number, item: CartItem) => total + item.Quantity, 0))
        setCartId(items[0]?.CartId || null)
      }
    } catch (error) {
      console.error("Error fetching cart:", error)
    } finally {
      setCartLoading(false)
    }
  }

  const showAlert = (type: "success" | "error" | "info" | "warning", message: string) => {
    const id = Date.now()
    setAlerts((prev) => [...prev, { id, type, message }])
  }

  const removeAlert = (id: number) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== id))
  }

  const handleCheckout = async () => {
    try {
      const response = await convertCartToOrder(cartId as number)
      if (response) {
        showAlert("success", "Pagado exitosamente")
        fetchCartItems() // Refresh cart after checkout
      }
    } catch (error) {
      showAlert("error", "Error al procesar la orden")
      console.error("Error in checkout:", error)
    }
  }

  const updateQuantity = async (productid: number, newQuantity: number) => {
    if (newQuantity < 1) return

    try {
      const response = await updateQuantityCart(cartId as number, productid, newQuantity)
      if (response) {
        showAlert("success", "Cantidad actualizada")
        fetchCartItems()
      }
    } catch (error) {
      showAlert("error", "Error al actualizar la cantidad")
      console.error("Error updating quantity:", error)
    }
  }

  const removeItem = async (cartId: number, productId: number) => {
    try {
      const response = await deleteItem(cartId, productId)
      if (response.Message) {
        showAlert("success", response.Message)
      }
      if (response) {
        fetchCartItems()
      }
      setShowConfirmDialog(false)
      setItemToDelete(null)
    } catch (error) {
      showAlert("error", "Error al eliminar el producto")
      console.error("Error removing item:", error)
    }
  }

  const handleRemoveClick = (cartId: number, productId: number, itemName: string) => {
    setItemToDelete({ cartId, productId, name: itemName })
    setShowConfirmDialog(true)
  }

  const confirmRemove = () => {
    if (itemToDelete) {
      removeItem(itemToDelete.cartId, itemToDelete.productId)
    }
  }

  const cancelRemove = () => {
    setShowConfirmDialog(false)
    setItemToDelete(null)
  }

  const closeMenu = () => {
    setIsOpen(false)
  }

  const totalAmount = cartItems.reduce((total, item) => total + item.SubTotal, 0)

  return (
    <>
      <nav className="modern-navbar">
        <div className="navbar-container">
          {/* Logo/Brand */}
          <div className="navbar-brand">
            <span className="brand-text">Bienvenido {user?.nombre}</span>
          </div>

          {/* Desktop Navigation */}
          <div className="navbar-center">
            <ul className="nav-links-desktop">
              <li>
                <a href="/client/home" className="nav-link">
                  <Home size={18} />
                  <span>Home</span>
                </a>
              </li>
              <li>
                <a href="/client/products" className="nav-link">
                  <Package size={18} />
                  <span>Products</span>
                </a>
              </li>
              <li>
                <a href="/client/history" className="nav-link">
                  <History size={18} />
                  <span>History</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Right side - Cart + Desktop logout + Mobile menu */}
          <div className="navbar-right">
            <button className="cart-button" onClick={toggleCart}>
              <ShoppingCart size={18} />
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </button>

            <button className="logout-button-desktop" onClick={logout}>
              <LogOut size={18} />
              <span>Cerrar Sesión</span>
            </button>

            <button className="menu-toggle" onClick={toggleMenu}>
              <Menu size={20} />
            </button>
          </div>
        </div>
      </nav>

      {/* Cart Overlay */}
      <div className={`cart-overlay ${isCartOpen ? "cart-overlay-open" : ""}`}>
        <div className="cart-panel">
          <div className="cart-header">
            <h3>Mi Carrito</h3>
            <button className="cart-close-button" onClick={closeCart}>
              <X size={20} />
            </button>
          </div>

          <div className="cart-content">
            {cartLoading ? (
              <div className="cart-loading">
                <div className="loading-spinner"></div>
                <p>Cargando carrito...</p>
              </div>
            ) : cartItems.length === 0 ? (
              <div className="cart-empty">
                <ShoppingCart size={48} />
                <p>Tu carrito está vacío</p>
                <a href="/client/products" className="shop-now-button">
                  Ir a comprar
                </a>
              </div>
            ) : (
              <>
                <div className="cart-items">
                  {cartItems.map((item) => (
                    <div key={item.CartItemId} className="cart-item">
                      <div className="cart-item-image">
                        <img
                          src={item.ImageUrl || "/placeholder.svg"}
                          alt={item.Name}
                          onError={(e) => {
                            e.currentTarget.src = "/placeholder.svg?height=60&width=60"
                          }}
                        />
                      </div>
                      <div className="cart-item-details">
                        <h4>{item.Name}</h4>
                        <p className="cart-item-price">${item.UnitPrice.toFixed(2)}</p>
                        <div className="cart-item-controls">
                          <button
                            className="quantity-button"
                            onClick={() => updateQuantity(item.ProductId, item.Quantity - 1)}
                            disabled={item.Quantity <= 1}
                          >
                            <Minus size={14} />
                          </button>
                          <span className="quantity">{item.Quantity}</span>
                          <button
                            className="quantity-button"
                            onClick={() => updateQuantity(item.ProductId, item.Quantity + 1)}
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                      </div>
                      <div className="cart-item-actions">
                        <p className="cart-item-subtotal">${item.SubTotal.toFixed(2)}</p>
                        <button
                          className="remove-button"
                          onClick={() => handleRemoveClick(item.CartId, item.ProductId, item.Name)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="cart-footer">
                  <div className="cart-total">
                    <strong>Total: ${totalAmount.toFixed(2)}</strong>
                  </div>
                  <button className="checkout-button" onClick={handleCheckout}>
                    Proceder al Pago
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu Sliding from Left */}
      <div className={`mobile-menu ${isOpen ? "mobile-menu-open" : ""}`}>
        <div className="mobile-menu-header">
          <span className="mobile-brand-text">Client Portal</span>
          <button className="mobile-close-button" onClick={closeMenu}>
            <X size={20} />
          </button>
        </div>

        <ul className="mobile-nav-links">
          <li>
            <a href="/client/home" className="mobile-nav-link" onClick={closeMenu}>
              <Home size={18} />
              <span>Home</span>
            </a>
          </li>
          <li>
            <a href="/client/products" className="mobile-nav-link" onClick={closeMenu}>
              <Package size={18} />
              <span>Products</span>
            </a>
          </li>
          <li>
            <a href="/client/history" className="mobile-nav-link" onClick={closeMenu}>
              <History size={18} />
              <span>History</span>
            </a>
          </li>
          <li>
            <button
              className="mobile-nav-link"
              onClick={() => {
                closeMenu()
                toggleCart()
              }}
            >
              <ShoppingCart size={18} />
              <span>Carrito ({cartCount})</span>
            </button>
          </li>
          <li>
            <button
              className="mobile-logout-button"
              onClick={() => {
                closeMenu()
                logout()
              }}
            >
              <LogOut size={18} />
              <span>Cerrar Sesión</span>
            </button>
          </li>
        </ul>
      </div>

      {/* Mobile Menu Overlay */}
      {isOpen && <div className={`navbar-overlay ${isOpen ? "show" : ""}`} onClick={closeMenu} />}

      {/* Cart Overlay Background */}
      {isCartOpen && <div className="cart-backdrop" onClick={closeCart} />}

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={showConfirmDialog}
        title="Eliminar producto"
        message={`¿Estás seguro de que deseas eliminar "${itemToDelete?.name}" del carrito?`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        type="danger"
        onConfirm={confirmRemove}
        onCancel={cancelRemove}
      />


      <div className="alerts-container">
        {alerts.map((alert) => (
          <Alert key={alert.id} type={alert.type} message={alert.message} onClose={() => removeAlert(alert.id)} />
        ))}
      </div>
    </>
  )
}
