import { Request, Response, NextFunction } from 'express';
import * as itemService from '../services/itemService';
import { AppError } from '../utils/errors';

export const createItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name } = req.body;
    const result = await itemService.createItem(name);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}

export const getItems = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const items = await itemService.getItems();
    res.json(items);
  } catch (error) {
    next(error);
  }
};

export const getItemById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const item = await itemService.getItemById(id);

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    res.json(item);
  } catch (error) {
    next(error);
  }
};

export const updateItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const { name } = req.body;

    const updatedItem = await itemService.updateItem(id, name);
    res.json(updatedItem);
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.status).json({ message: error.message });
    }
    next(error);
  }
};

export const deleteItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    await itemService.deleteItem(id);

    res.status(204).send();
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.status).json({ message: error.message });
    }
    next(error);
  }
};