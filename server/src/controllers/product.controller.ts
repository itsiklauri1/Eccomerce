import { Request, Response } from "express";
import { ProductService } from "../services/product.service";
import {
  ErrorRes,
  productSchema,
  SuccessRes,
  updateProductSchema,
} from "../utils/validation";
import { categoryService } from "../services/category.service";
import { Product } from "../db/entities/Product";

const productsService = new ProductService();
const categorysService = new categoryService();

export const getAllProducts = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const pinned = req.query.pinned === "true";
    const skip = limit * (page - 1);
    const category = parseInt(req.query.category as string);
    const minPrice = parseInt(req.query.minPrice as string);
    const maxPrice = parseInt(req.query.maxPrice as string);
    const sort = req.query.sort as string;
    const promotion = req.query.promotion === "true";

    const [products, total] = await productsService.getAllProducts(
      skip,
      limit,
      category,
      pinned,
      minPrice,
      maxPrice,
      sort,
      promotion
    );
    if (!products) {
      return res
        .status(400)
        .json(new ErrorRes(400, "error while fetching products"));
    }
    res.status(200).json({ products, total });
  } catch (er) {
    console.log(er);
  }
};

export const getProductById = async (req: Request, res: Response) => {
  const product = await productsService.getProductById(req.params.id);
  if (!product) {
    return res.status(404).json(new ErrorRes(404, "Product not found"));
  }
  res.json(product);
};

export const searchProduct = async (req: Request, res: Response) => {
  const search = req.query.keyword.toString().toLocaleLowerCase();
  const products = await productsService.searchProductBySearch(search);
  if (!products) {
    return res
      .status(400)
      .json(new ErrorRes(400, "Error while searching for product"));
  }
  return res.json(products);
};

// create product

export const createProduct = async (req: Request, res: Response) => {
  const image = req.files?.["image"] || [];
  const pinnedImage = req.files?.["pinnedImage"] || [];

  if (!image) {
    return res.status(400).json(new ErrorRes(400, "image is required"));
  }
  if (!pinnedImage) {
    return res.status(400).json(new ErrorRes(400, "pinnedImage is required"));
  }
  const { error } = productSchema.validate(req.body);
  if (error) {
    return res.status(400).json(
      new ErrorRes(
        400,
        error.details.map((detail) =>
          detail.message.replace(/\n/g, " ").replace(/"/g, "")
        )
      )
    );
  }

  const category = await categorysService.getById(req.body.category);

  if (!category)
    return res.status(404).json(new ErrorRes(404, "Invalid category"));

  const createdProduct: Product = await productsService.createProduct({
    ...req.body,
    image,
    pinnedImage,
  });

  if (!createdProduct)
    return res
      .status(401)
      .json(new ErrorRes(401, "error while creating product"));
  return res.status(201).json(createdProduct);
};

export const updateProduct = async (req: Request, res: Response) => {
  const updateFilesDto = {
    image: req.files?.["image"] || null,
    pinnedImage: req.files?.["pinnedImage"] || null,
  };

  const { error } = updateProductSchema.validate(req.body);
  if (error) {
    return res.status(400).json(
      new ErrorRes(
        400,
        error.details.map((detail) =>
          detail.message.replace(/\n/g, " ").replace(/"/g, "")
        )
      )
    );
  }

  if (req.body.category) {
    const category = await categorysService.getById(req.body.category);

    if (!category)
      return res.status(404).json(new ErrorRes(404, "Invalid category"));
  }

  const target = await productsService.getProductById(req.params.id);
  if (!target)
    return res.status(404).json(new ErrorRes(404, "Product Not Found"));

  const updated = await productsService.updateProduct(
    req.body,
    updateFilesDto,
    req.params.id
  );

  if (!updated) return res.status(400).json(new ErrorRes(400, "Bad request"));

  if (req.body.image && updateFilesDto.image)
    return res
      .status(400)
      .json(new ErrorRes(400, "Choose one property for image"));

  if (req.body.pinned && updateFilesDto.pinnedImage)
    return res
      .status(400)
      .json(new ErrorRes(400, "Choose one property for pinned image"));

  return res
    .status(200)
    .json(new SuccessRes(200, "Product updated successfully"));
};

export const deleteProduct = async (req: Request, res: Response) => {
  const target = await productsService.getProductById(req.params.id);

  const deletedProduct = await productsService.deletePost(req.params.id);

  if (!target) {
    return res.status(404).json(new ErrorRes(404, "Product not found"));
  }
  if (!deletedProduct) {
    return res
      .status(404)
      .json(new ErrorRes(404, "Error while deleting product"));
  }
  return res
    .status(201)
    .json(new SuccessRes(204, "Product deleted Successfully"));
};
