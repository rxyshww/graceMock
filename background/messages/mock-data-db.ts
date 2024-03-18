
import type { PlasmoMessaging } from "@plasmohq/messaging";
import { mockDataDb } from '../utils';

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  const { type, payload } = req.body;

  const data = await mockDataDb[type]?.(payload);
  res.send(data);
}

export default handler