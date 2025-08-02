import { CART_ENDPOINTS } from "../endpoints/Cart";

export async function getCat(id: number) {
    const res = await fetch(`${CART_ENDPOINTS.Cart}/${id}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
    });
    const data = await res.json();
    if (!res.ok) {
        throw new Error('Failed to fetch categories');
    }
    return await data;
}
export async function insertItem(clientId:Number, ProductId:Number, QUANTITY:Number) {
    const res = await fetch(`${CART_ENDPOINTS.Cart}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body:JSON.stringify({ClientId:clientId, ProductId:ProductId, Quantity:QUANTITY})
    });
    if (!res.ok) {
        throw new Error('Failed to fetch categories');
    }

    return await res.json();
}
export async function convertCartToOrder(cartID: number) {
    const res = await fetch(`${CART_ENDPOINTS.Cart}/convert`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cartID }),
    });
    if (!res.ok) {
        throw new Error('Failed to convert cart to order');
    }
    return await res.json();
}
export async function deleteItem(cartID: number, ProductId: number) {
    const res = await fetch(`${CART_ENDPOINTS.Cart}/${cartID}/${ProductId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) {
        throw new Error('Failed to delete cart item');
    }
    return await res.json();
}
export async function updateQuantityCart(clientId: number, ProductId: number, QUANTITY: number) {
    const res = await fetch(`${CART_ENDPOINTS.Cart}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cartID: clientId, productId: ProductId, quantity: QUANTITY }),
    });
    if (!res.ok) {
        return false;
    }

    return true;
}