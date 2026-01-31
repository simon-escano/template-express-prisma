import { prisma } from "../config/prisma";

// Create an item
export const createItem = async (name: string) => {
  return await prisma.item.create({
    data: {
      name
    }
  });
}

// Read all items
export const getItems = async () => {
  return await prisma.item.findMany();
}

// Read single item
export const getItemById = async (id: number) => {
  return await prisma.item.findUnique({
    where: { id }
  });
};

// Update an item
export const updateItem = async (id: number, name: string) => {
  const item = await prisma.item.findUnique({ where: { id } });

  if (!item) {
    throw new Error("ITEM_NOT_FOUND");
  }

  return await prisma.item.update({
    where: { id },
    data: { name }
  });
};

// Delete an item
export const deleteItem = async (id: number) => {
  const item = await prisma.item.findUnique({ where: { id } });

  if (!item) {
    throw new Error("ITEM_NOT_FOUND");
  }

  return await prisma.item.delete({
    where: { id }
  });
};