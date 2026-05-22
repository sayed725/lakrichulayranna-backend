import { prisma } from '../../server';

const getSettings = async () => {
  const settings = await prisma.setting.findFirst();
  return settings;
};

const updateSettings = async (payload: any) => {
  const result = await prisma.setting.upsert({
    where: { id: 1 },
    update: payload,
    create: {
      ...payload,
      id: 1,
    },
  });
  return result;
};

export const SettingService = {
  getSettings,
  updateSettings,
};
