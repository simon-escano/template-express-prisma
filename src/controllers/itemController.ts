import { Request, Response, NextFunction } from 'express';
import * as itemService from '../services/itemService';

// Create an item
export const createItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name } = req.body;
    const result = await itemService.createItem(name);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

// Read all items
export const getItems = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const items = itemService.getItems();
    res.json(items);
  } catch (error) {
    next(error);
  }
};

// Read single item
export const getItemById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const item = await itemService.getItemById(id);

    if (!item) {
      res.status(404).json({ message: 'Item not found' });
    }

    res.json(item);
  } catch (error) {
    next(error);
  }
};

// Update an item
export const updateItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    const { name } = req.body;

    const updatedItem = await itemService.updateItem(id, name);
    res.json(updatedItem);
  } catch (error: any) {
    if (error.message === 'ITEM_NOT_FOUND') {
      res.status(404).json({ message: 'Item not found' });
    } else {
      next(error);
    }
  }
};

// Delete an item
export const deleteItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    await itemService.deleteItem(id);
    
    res.status(204).send(); 
  } catch (error: any) {
    if (error.message === 'ITEM_NOT_FOUND') {
      res.status(404).json({ message: 'Item not found' });
    } else {
      next(error);
    }
  }
};