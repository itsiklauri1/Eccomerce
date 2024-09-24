import Joi from "joi";
import { UserRole } from "../db/entity/User";
import { Comment } from "../db/entity/Comment";

export const userSchema = Joi.object({
  fullname: Joi.string()
    .pattern(new RegExp("^[A-Za-z]+(?: [A-Za-z]+)+$"))
    .required(),
  email: Joi.string().required().pattern(new RegExp("^[^@]+@[^@]+.[^@]+$")),
  password: Joi.string().required().min(8),
}).options({ abortEarly: false });

export const productSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().required(),
  price: Joi.number().required(),
  salePrice: Joi.number().required(),
  category: Joi.string().required(),
  pinned: Joi.boolean(),
}).options({ abortEarly: false });

export const updateProductSchema = Joi.object({
  title: Joi.string(),
  description: Joi.string(),
  price: Joi.number(),
  salePrice: Joi.number(),
  category: Joi.string(),
  pinned: Joi.boolean(),
}).options({ abortEarly: false });

export const createCategorySchema = Joi.object({
  title: Joi.string().required(),
  link: Joi.string().required(),
  pinned: Joi.boolean(),
}).options({ abortEarly: false });

export const createCommentSchema = Joi.object({
  content: Joi.string().required(),
});

export class productType {
  id: number;
  title: string;
  description: string;
  price: number;
  image: string;
  filepath: string;
  createdAt: string;
  pinned: boolean;
  comments: Comment[];
}

export class userType {
  fullname: string;
  email: string;
  password: string;
  role: UserRole;
}

export class categoryType {
  id: number;
  title: string;
  image: string;
}

export function ErrorRes(status: number, message: string | string[]) {
  this.status = status;
  this.error = {
    message,
  };
}

export function SuccessRes(status: number, message: string, token?: string) {
  this.status = status;
  this.success = {
    message,
    ...(token && { token }),
  };
}
