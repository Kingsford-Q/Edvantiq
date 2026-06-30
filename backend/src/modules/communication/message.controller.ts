// src/modules/communication/message.controller.js

import type { Request, Response } from "express";
import { sendMessage } from "./message.service.js";
import { prisma } from "../../prisma.js";

export async function sendMessageController(req: Request, res: Response) {
  try {
    const schoolId = (req as any).user.schoolId;
    const senderId = (req as any).user.id;

    const message = await sendMessage({
      senderId,
      ...req.body,
      schoolId,
    });

    res.status(201).json(message);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
}

export async function getMessagesController(req: Request, res: Response) {
  try {
    const userId = (req as any).user.id;
    const schoolId = (req as any).schoolId;

    const messages = await prisma.message.findMany({
      where: {
        schoolId,
        OR: [
          { senderId: userId },
          { receiverId: userId },
        ],
      },
      include: {
        sender: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        receiver: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json(messages);
  } catch (error: any) {
    return res.status(400).json({ message: error.message });
  }
}

export async function getMessageController(req: Request, res: Response) {
  try {
    const messageId = Array.isArray(req.params.messageId)
      ? req.params.messageId[0]
      : req.params.messageId;
    const userId = (req as any).user.id;
    const schoolId = (req as any).schoolId;

    const message = await prisma.message.findFirst({
      where: {
        id: messageId,
        schoolId,
        OR: [
          { senderId: userId },
          { receiverId: userId },
        ],
      },
      include: {
        sender: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        receiver: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
    });

    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    return res.status(200).json(message);
  } catch (error: any) {
    return res.status(400).json({ message: error.message });
  }
}