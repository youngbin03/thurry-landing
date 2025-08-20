import { getDatabase, ref, set } from "firebase/database";
import { app } from '../firebase';
import { generateUUID } from './uuid';

const database = getDatabase(app);

export const createThurryPass = async () => {
  const passId = generateUUID();
  const now = new Date();
  const startDate = new Date('2025-09-01T00:00:00+09:00');
  const endDate = new Date('2025-09-08T00:00:00+09:00');

  const passData = {
    createdAt: now.toISOString(),
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
    isEventPass: true,
    passType: 'weekly',
    status: 'active',
    migratedAt: now.toISOString(),
  };

  try {
    await set(ref(database, `thurry-pass/${passId}`), passData);
    return {
      passId,
      startDate,
      endDate,
      success: true
    };
  } catch (error) {
    console.error('패스 생성 실패:', error);
    return {
      success: false,
      error
    };
  }
};
