const { poolPromise, sql } = require('../db/db');
const { logErrorToDB } = require('./errorLog');

async function getCart(clientID) {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('ClientID', sql.Int, clientID)
            .execute('getCartClient');
        return result.recordset;
    } catch (err) {
        await logErrorToDB('CartService', 'getCart', err.message, err.stack);
    }
}

async function insertItem(product) {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('ClientId', sql.Int, product.ClientId)
            .input('ProductId', sql.Int, product.ProductId)
            .input('Quantity', sql.Int, product.Quantity)
            .execute('AddItemToCart');
        return result.recordset[0];
    } catch (err) {
        await logErrorToDB('CartService', 'insertItem', err.message, err.stack);
    }
}
async function updateProducto(producto) {
    console.log('Updating product in cart:', producto);
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('CartId', sql.Int, producto.cartID)
            .input('ProductId', sql.Int, producto.productId)
            .input('Quantity', sql.Int, producto.quantity)
            .execute('UpdateCartItemQuantity');
            console.log('Update result:', result);
        return result.recordset?.[0];
    } catch (err) {
        await logErrorToDB('CartService', 'updateProducto', err.message, err.stack);
    }
}
async function cartToOrder(cartID) {
    try {
        const pool = await poolPromise;
        console.log('Converting cart to order for Cart ID:', cartID);
        const result = await pool.request()
            .input('CartId', sql.Int, cartID)
            .execute('ConvertCartToOrder');
        return result.recordset?.[0];
    } catch (err) {
        await logErrorToDB('CartService', 'cartToOrder', err.message, err.stack);
    }
}
async function deleteItem(cartID, productID) {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('CartId', sql.Int, cartID)
            .input('ProductId', sql.Int, productID)
            .execute('DeleteCartItem');
        return result.recordset?.[0];
    } catch (err) {
        await logErrorToDB('CartService', 'deleteItem', err.message, err.stack);
    }
}
module.exports = {
    getCart,
    insertItem,
    updateProducto,
    cartToOrder,
    deleteItem
};
