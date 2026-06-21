import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  comparePassword,
  hashPassword,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  authenticate,
  saveTokenInCookies
} from '@/lib/auth';
import { logAction } from '@/lib/audit';
import { cookies } from 'next/headers';
import { sendResetPasswordEmail } from '@/lib/mailer';
import crypto from 'crypto'

const RESET_SECRET =process.env.JWT_SECRET! ;

export class AuthController {
  static async login(req: NextRequest) {
    try {
      const body = await req.json();
      const { email, password } = body;

      if (!email || !password) {
        return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
      }

      const user = await prisma.user.findFirst({
        // notice it's importnant to chekct it's not deleted
        where: { email, deletedAt: null }
      });

      if (!user || !user.isActive) {
        return NextResponse.json({ error: 'Invalid credentials or inactive account' }, { status: 401 });
      }

      const isMatch = comparePassword(password, user.passwordHash);
      if (!isMatch) {
        return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
      }

      const access_token = await signAccessToken({
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name
      });

      const refresh_token = await signRefreshToken({ id: user.id });

      // Log audit
      await logAction({
        tableName: 'users',
        recordId: user.id,
        action: 'update',
        oldValue: { status: 'logged_out' },
        newValue: { status: 'logged_in' },
        performedBy: user.id
      });
      // set the cookies
      await saveTokenInCookies(access_token)
      await saveTokenInCookies(refresh_token , "refresh_token")
      return NextResponse.json({
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      });
    } catch (e) {
      if (e instanceof Error) {
        return NextResponse.json({ error: e.message || 'Server error during login' }, { status: 500 });
      }
      return NextResponse.json({ error: 'Server error during login' }, { status: 500 });
    }
  }
  static async register(req: NextRequest) {
    try {
      const body = await req.json();
      const { email, password, name } = body;

      if (!email || !password || !name) {
        return NextResponse.json({ error: 'Email, password and name are required' }, { status: 400 });
      }

      const user = await prisma.user.findFirst({
        // notice it's importnant to chekct it's not deleted
        where: { email, deletedAt: null }
      });

      if (user) {
        return NextResponse.json({ error: 'Email already exists' }, { status: 400 });
      }

      const hash = hashPassword(password);
      const newUser = await prisma.user.create({
        data: {
          email,
          passwordHash: hash,
          name,
          role: 'patient',
          isActive: true
        }
      });
      // login in after registration 
      const access_token =  signAccessToken({
        id: newUser.id,
        email: newUser.email,
        role: newUser.role,
        name: newUser.name
      });

      const refresh_token =  signRefreshToken({ id: newUser.id });

      // Log audit
      await logAction({
        tableName: 'users',
        recordId: newUser.id,
        action: 'create',
        oldValue: null,
        newValue: {
          id: newUser.id,
          email: newUser.email,
          role: newUser.role,
          name: newUser.name
        },
        performedBy: newUser.id
      });
      // set the cookies
      await saveTokenInCookies(access_token)
      await saveTokenInCookies(refresh_token , "refresh_token")
      return NextResponse.json({
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role
        }
      });
    } catch (e) {
      if (e instanceof Error) {
        return NextResponse.json({ error: e.message || 'Server error during registration' }, { status: 500 });
      }
      return NextResponse.json({ error: 'Server error during registration' }, { status: 500 });
    }
  }
  static async logout(req: NextRequest) {
    try {
      const auth = await authenticate(req);
      if (auth instanceof NextResponse) {
        // Even if not logged in, return success on logout
        return NextResponse.json({ success: true, message: 'Logged out successfully' });
      }

      await logAction({
        tableName: 'users',
        recordId: auth.user.id,
        action: 'update',
        oldValue: { status: 'logged_in' },
        newValue: { status: 'logged_out' },
        performedBy: auth.user.id
      });

      return NextResponse.json({ success: true, message: 'Logged out successfully' });
    } catch (e) {
      if (e instanceof Error) {
        return NextResponse.json({ error: e.message || 'Server error during logout' }, { status: 500 });
      }
      return NextResponse.json({ error: 'Server error during logout' }, { status: 500 });
    }
  }

  static async refreshToken() {
    try {
      const cookiesStore = await cookies()
      const refresh_token =cookiesStore.get("refresh_token")?.value
      if (!refresh_token) {
        return NextResponse.json({ error: 'Refresh token is required' }, { status: 400 });
      }

      const payload = await verifyRefreshToken(refresh_token);
      if (!payload) {
        return NextResponse.json({ error: 'Invalid or expired refresh token' }, { status: 401 });
      }

      const user = await prisma.user.findFirst({
        where: { id: payload.id, deletedAt: null }
      });

      if (!user || !user.isActive) {
        return NextResponse.json({ error: 'User is inactive or no longer exists' }, { status: 401 });
      }

      const access_token = await signAccessToken({
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name
      });
      await saveTokenInCookies(access_token)
      return NextResponse.json({ message:"access token have been updated successfully" });
    } catch (e) {
      if (e instanceof Error) {
        return NextResponse.json({ error: e.message || 'Server error during refresh token' }, { status: 500 });
      }
      return NextResponse.json({ error: 'Server error during refresh token' }, { status: 500 });
    }
  }
  // user know the password but woant to change it 
  static async changePassword(req: NextRequest) {
    try {
      // get user data from access token 
      const auth = await authenticate(req);
      if (auth instanceof NextResponse) return auth;

      const body = await req.json();
      const { oldPassword, newPassword } = body;

      if (!oldPassword || !newPassword) {
        return NextResponse.json({ error: 'Old password and new password are required' }, { status: 400 });
      }

      const user = await prisma.user.findUnique({
        where: { id: auth.user.id }
      });

      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      const isMatch = comparePassword(oldPassword, user.passwordHash);
      if (!isMatch) {
        return NextResponse.json({ error: 'Incorrect old password' }, { status: 400 });
      }

      const newHash = hashPassword(newPassword);
      await prisma.user.update({
        where: { id: user.id },
        data: { passwordHash: newHash }
      });

      await logAction({
        tableName: 'users',
        recordId: user.id,
        action: 'update',
        oldValue: { password_changed: false },
        newValue: { password_changed: true },
        performedBy: user.id
      });

      return NextResponse.json({ success: true, message: 'Password changed successfully' });
    } catch (e) {
      if (e instanceof Error) {
        return NextResponse.json({ error: e.message || 'Server error during password change' }, { status: 500 });
      }
      return NextResponse.json({ error: 'Server error during password change' }, { status: 500 });
    }
  }
  // user forget the pw so will receive token in email to reset password
  static async forgotPassword(req: NextRequest) {
    try {
      const { email } = await req.json()

  // 1. ابحث عن المستخدم
  const user = await prisma.user.findUnique({
    where: { email }
  })

  // 2. لو مش موجود — رد بنفس الرسالة (أمان)
  if (!user) {
    return NextResponse.json({
      message: 'لو الإيميل موجود هيوصلك رسالة'
    })
  }

  // 3. اعمل token فريد
  const token = crypto.randomBytes(32).toString('hex')
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // ساعة

  // 4. احفظ الـ token في الداتابيس
  await prisma.passwordResetToken.create({
    data: {
      userId:    user.id,
      token:     token,
      expiresAt: expiresAt,
    }
  })

  // 5. ابعت الإيميل
  await sendResetPasswordEmail(user.email, token, user.name)

  return NextResponse.json({
    success:true, message: 'تم إرسال رابط إعادة تعيين كلمة المرور'
  })
    } catch (e) {
      if (e instanceof Error) {
        return NextResponse.json({ error: e.message || 'Server error during forgot password' }, { status: 500 });
      }
      return NextResponse.json({ error: 'Server error during forgot password' }, { status: 500 });
    }
  }

  static async resetPassword(req: NextRequest,token:string) {
  try {

    const body = await req.json();
    const { newPassword } = body;
    const resetToken = await prisma.passwordResetToken.findUnique({
    where: { token },
    include: { user: true }
  })

  if (!resetToken || resetToken.expiresAt < new Date() || resetToken.usedAt) {
    return NextResponse.json(
      { message: 'الرابط منتهي أو مستخدم من قبل' },
      { status: 400 }
    )
  }
    await prisma.user.update({
    where: { id: resetToken.userId },
    data: { passwordHash: hashPassword(newPassword,10) }
  })
    // التحقق من وجود المفتاح السري
    
    await prisma.passwordResetToken.update({
    where: { id: resetToken.id },
    data: { usedAt: new Date() }
  })
  
  
  
  await logAction({
    tableName: 'users',
      recordId: resetToken.userId,
      action: 'update',
      oldValue: { password_reset: false },
      newValue: { password_reset: true },
      performedBy: resetToken.userId
    });
    
    return NextResponse.json({ message: 'تم تغيير كلمة المرور بنجاح' })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Server error' }, { status: 500 });
  }
}
  static async me(req: NextRequest) {
    try {
      const auth = await authenticate(req);
      if (auth instanceof NextResponse) return auth;
      return NextResponse.json({ user: auth.user });
    } catch (e) {
      if (e instanceof Error) {
        return NextResponse.json({ error: e.message || 'Server error during get me' }, { status: 500 });
      }
      return NextResponse.json({ error: 'Server error during get me' }, { status: 500 });
    }
  }
}
