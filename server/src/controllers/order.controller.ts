import { Request, Response } from "express";
import { OrderService } from "../services/order.service";
import { ProductService } from "../services/product.service";
import { ErrorRes, SuccessRes } from "../utils/validation";
import { UserService } from "../services/user.service";
import { CartItem } from "../db/entities/CartItem";
import { CartItemService } from "../services/cartItem.service";
import { orderStatus } from "../db/entities/Order";
import { AppDataSource } from "../db/database-connect";

const ordersService = new OrderService();
const productsService = new ProductService();
const usersService = new UserService();
const CartItemsService = new CartItemService();
const cartItemRepository = AppDataSource.getRepository(CartItem);

export const getAllOrders = async (req: Request, res: Response) => {
  const status = req.query.status
    ? (req.query.status as orderStatus)
    : undefined;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const skip = limit * (page - 1);

  const [products, total] = await ordersService.getAllOrders(
    skip,
    limit,
    status
  );
  res.json({ products, total });
};

export const getUserOrders = async (req: Request, res: Response) => {
  const UserOrders = await ordersService.getUserOrders(req.user.id);
  res.json(UserOrders);
};

/// ADD ORDER BY CART

export const addOrderByCart = async (req: Request, res: Response) => {
  const user = await usersService.getUserById(req.user.id);

  if (!user.Address)
    return res
      .status(400)
      .json(new ErrorRes(400, "User does not have address property"));

  if (user.cartItems.length === 0)
    return res.status(400).json(new ErrorRes(400, "Your cart is empty"));

  await ordersService.addOrderBycart(user.cartItems, user);

  user.cartItems.forEach(async (cartItem: CartItem) => {
    await productsService.updateProductInStock(
      cartItem.product.id,
      cartItem.quantity
    );

    await CartItemsService.removeCartItem(cartItem.id);
  });

  res.status(200).json(new SuccessRes(200, "Order placed successfully"));
};

//ADD ORDER BY ID

export const addOrderById = async (req: Request, res: Response) => {
  const producId = req.body.productId;
  const quantity = req.body.quantity;

  if (!producId || !quantity)
    return res
      .status(400)
      .json(new ErrorRes(400, "quntity and product Id are required"));

  const user = await usersService.getRawUserById(req.user.id);
  if (!user.Address)
    return res
      .status(400)
      .json(new ErrorRes(400, "User does not have address property"));

  const product = await productsService.getProductById(producId);

  if (!product) {
    return res
      .status(400)
      .json(new ErrorRes(400, `Product not found with the id`));
  }

  const cartItemObj = new CartItem();

  cartItemObj.quantity = quantity;
  cartItemObj.user = user;
  cartItemObj.product = product;

  const cartItem = await cartItemRepository.save(cartItemObj);

  await productsService.updateProductInStock(product.id, quantity);

  const order = await ordersService.addOrder(cartItem, user, quantity);

  await CartItemsService.removeCartItem(cartItem.id);

  if (!order)
    return res.status(400).json(new ErrorRes(400, "Could not add an Order"));

  return res.json(order);
};

export const updateOrderStatus = async (req: Request, res: Response) => {
  const options = ["pending", "fullfiled", "failed"];
  const orderId = req.params.id;
  const orderStatus = req.body.orderStatus;

  if (!options.includes(orderStatus))
    return res.status(400).json(new ErrorRes(400, "Invalid orderStatus"));

  const updated = await ordersService.updateOrder(Number(orderId), orderStatus);

  if (!updated)
    return res.status(400).json(new ErrorRes(400, "Failed to update order"));

  return res
    .status(200)
    .json(new SuccessRes(200, "Order updated successfully"));
};

export const deleteOrder = async (req: Request, res: Response) => {
  const deletedOrder = await ordersService.deleteOrder(req.params.id);
  if (!deletedOrder)
    return res.status(400).json(new ErrorRes(400, "Could not find an Order"));

  return res
    .status(200)
    .json(new SuccessRes(200, "Order deleted successfully"));
};
