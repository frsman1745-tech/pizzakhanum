// pages/api/auth/[...nextauth].js
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Admin Login",
      credentials: {
        username: { label: "اسم المستخدم", type: "text" },
        password: { label: "كلمة المرور",  type: "password" },
      },

      async authorize(credentials) {
        // ── التحقق من بيانات الدخول ──
        // القيم مخزنة في متغيرات البيئة فقط — لا hardcode هنا
        const validUser = credentials?.username === process.env.ADMIN_USERNAME;
        const validPass = credentials?.password === process.env.ADMIN_PASSWORD;

        if (validUser && validPass) {
          return {
            id:   "admin",
            name: "مدير بيتزا خانم",
            role: "admin",
          };
        }

        // فشل المصادقة
        return null;
      },
    }),
  ],

  callbacks: {
    // أضف role للـ token
    async jwt({ token, user }) {
      if (user) token.role = user.role;
      return token;
    },
    // أضف role للـ session
    async session({ session, token }) {
      if (session?.user) session.user.role = token.role;
      return session;
    },
  },

  pages: {
    signIn: "/admin/login",    // صفحة تسجيل الدخول المخصصة
    error:  "/admin/login",    // إعادة توجيه عند خطأ
  },

  secret: process.env.NEXTAUTH_SECRET,

  session: {
    strategy: "jwt",
    maxAge:   60 * 60 * 8,   // 8 ساعات
  },
};

export default NextAuth(authOptions);
