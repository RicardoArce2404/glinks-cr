import { type Response, type NextFunction } from "express";
import type { AuthRequest } from "../types/index.js";
import {
  createProductSchema,
  updateProductSchema,
  productIdSchema,
} from "../validators/productos.js";
import * as productService from "../services/productoService.js";
import { parsePagination, paramStr, toStr } from "../lib/utils.js";


export async function list(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { skip: _skip, ...pagination } = parsePagination(req.query as { page?: string; limit?: string });
    const { products, total } = await productService.listProducts(pagination.page, pagination.limit);

    res.json({
      success: true,
      data: products,
      pagination: {
        ...pagination,
        total,
        totalPages: Math.ceil(total / pagination.limit),
      },
    });
  } catch (err) {
    next(err);
  }
}


export async function search(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const searchTerm = toStr(req.query.q);
    const { skip: _skip, ...pagination } = parsePagination(req.query as { page?: string; limit?: string });
    const { products, total } = await productService.searchProducts(searchTerm, pagination.page, pagination.limit);

    res.json({
      success: true,
      data: products,
      pagination: {
        ...pagination,
        total,
        totalPages: Math.ceil(total / pagination.limit),
      },
    });
  } catch (err) {
    next(err);
  }
}


export async function getById(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { id } = productIdSchema.parse({ id: req.params.id });
    const product = await productService.getProductById(id);
    res.json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
}


export async function create(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const data = createProductSchema.parse(req.body);
    const product = await productService.createProduct(data);
    res.status(201).json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
}


export async function update(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { id } = productIdSchema.parse({ id: req.params.id });
    const data = updateProductSchema.parse(req.body);
    const product = await productService.updateProduct(id, data);
    res.json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
}


export async function remove(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { id } = productIdSchema.parse({ id: req.params.id });
    await productService.deleteProduct(id);
    res.json({ success: true, message: "Producto eliminado correctamente" });
  } catch (err) {
    next(err);
  }
}


export async function summary(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const summary = await productService.getInventorySummary();
    res.json({ success: true, data: summary });
  } catch (err) {
    next(err);
  }
}