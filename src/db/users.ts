import { db } from './index.ts';
import { users, patients, providers } from './schema.ts';
import { eq } from 'drizzle-orm';
import { isDbAvailable, memoryUsers, memoryPatients, handleDbFailure } from './queries.ts';

export async function getOrCreateUser(uid: string, email: string, name?: string, role?: string) {
  if (isDbAvailable) {
    try {
      const existing = await db.select().from(users).where(eq(users.uid, uid));
      let userObj;
      if (existing.length === 0) {
        await db.insert(users).values({
          uid,
          email,
          name: name || email.split('@')[0],
          role: role || 'patient',
        });
        const created = await db.select().from(users).where(eq(users.uid, uid));
        userObj = created[0];
      } else {
        await db.update(users).set({
          email,
          ...(name ? { name } : {}),
          ...(role ? { role } : {}),
        }).where(eq(users.uid, uid));
        const updated = await db.select().from(users).where(eq(users.uid, uid));
        userObj = updated[0];
      }

      if (userObj) {
        // Ensure patient profile exists in patients table if role is 'patient'
        if (userObj.role === 'patient') {
          try {
            const exPat = await db.select().from(patients).where(eq(patients.userId, userObj.uid));
            if (exPat.length === 0) {
              await db.insert(patients).values({
                id: `pat-${userObj.uid}`,
                userId: userObj.uid,
                name: userObj.name || 'Patient User',
                phone: userObj.phone || (userObj.uid.includes('usr-') ? userObj.uid.replace('usr-', '') : userObj.uid),
              });
            } else {
              await db.update(patients).set({
                ...(userObj.name ? { name: userObj.name } : {}),
                ...(userObj.phone ? { phone: userObj.phone } : {}),
              }).where(eq(patients.userId, userObj.uid));
            }
          } catch (pe) {
            console.warn('Auto patient record sync warning:', pe);
          }
        } else if (userObj.role === 'provider') {
          try {
            const provCheck = await db.select().from(providers).where(eq(providers.userId, userObj.uid));
            if (provCheck.length === 0) {
              await db.insert(providers).values({
                id: `prov-${userObj.uid.replace('usr-', '')}`,
                userId: userObj.uid,
                name: userObj.name || 'Healthcare Provider',
                title: 'Licensed Healthcare Specialist',
                rating: '5.0',
                reviewCount: 0,
                experienceYears: 3,
                distanceKm: '2.0',
                etaMinutes: 20,
                isAvailable: true,
                currentLocationName: userObj.address || 'Central District',
                badges: ['Board Certified', 'Verified Map2Medic Specialist'],
                hourlyRate: 60,
                completedVisits: 0,
                phone: userObj.phone || null,
                email: userObj.email || null,
                bio: 'Licensed provider specializing in sterile home clinical care and bedside procedures.',
                pendingPayout: 0,
                totalEarningsMonth: 0,
              });
            }
          } catch (pe) {
            console.warn('Auto provider record sync warning:', pe);
          }
        }
        return userObj;
      }
    } catch (error) {
      handleDbFailure(error);
    }
  }

  // Fallback to in-memory user registry
  let user = memoryUsers.find(u => u.uid === uid || u.email === email);
  if (!user) {
    user = {
      uid,
      email,
      name: name || email.split('@')[0],
      role: role || 'patient',
      createdAt: new Date(),
    };
    memoryUsers.push(user);
  } else {
    if (name) user.name = name;
    if (role) user.role = role;
    if (email) user.email = email;
  }

  if (user.role === 'patient') {
    let p = memoryPatients.find((p: any) => p.userId === user.uid);
    if (!p) {
      p = {
        id: `pat-${user.uid}`,
        userId: user.uid,
        name: user.name || 'Patient User',
        phone: user.phone || user.uid,
      };
      memoryPatients.push(p);
    }
  }

  return user;
}
