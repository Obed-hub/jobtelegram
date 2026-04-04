export const ADMIN_IDS = [
  'SQMxS2tLumdrpGRcEYM32iR4QMk1',
];

export const isUserAdmin = (uid: string | undefined) => {
  if (!uid) return false;
  return ADMIN_IDS.includes(uid);
};
