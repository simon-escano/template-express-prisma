import { prisma } from "../config/prisma";
import { NotFoundError } from "../utils/errors";

export const createItem = async (name: string) => {
  return await prisma.item.create({
    data: {
      name
    }
  });
}

export const getItems = async () => {
  return await prisma.item.findMany();
}

export const getItemById = async (id: number) => {
  return await prisma.item.findUnique({
    where: { id }
  });
};

export const updateItem = async (id: number, name: string) => {
  const item = await prisma.item.findUnique({ where: { id } });

  if (!item) {
    throw new NotFoundError("Item");
  }

  return await prisma.item.update({
    where: { id },
    data: { name }
  });
};

export const deleteItem = async (id: number) => {
  const item = await prisma.item.findUnique({ where: { id } });

  if (!item) {
    throw new NotFoundError("Item");
  }

  return await prisma.item.delete({
    where: { id }
  });
};