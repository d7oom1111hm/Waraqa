import {firebaseConfig} from './firebase-config.js';
let cached;
export async function backend({admin=false,anonymous=true}={}){
 if(!cached)cached=Promise.all([import('https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js'),import('https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js'),import('https://www.gstatic.com/firebasejs/12.4.0/firebase-database.js')]).catch(e=>{cached=null;throw e;});
 const [apps,auth,rt]=await cached,name=admin?'waraqa-admin':'[DEFAULT]';
 const app=apps.getApps().find(a=>a.name===name)||apps.initializeApp(firebaseConfig,name),a=auth.getAuth(app),db=rt.getDatabase(app);
 await a.authStateReady();if(anonymous&&!a.currentUser)await auth.signInAnonymously(a);
 return {auth,a,rt,db,uid:a.currentUser?.uid};
}
export function cloudError(e){console.error(e);if(/permission|denied/i.test(e.code||e.message))return 'لا توجد صلاحية لهذه العملية. تأكد من نشر قواعد المشروع وإعداد حساب الإدارة.';if(/invalid-credential|wrong-password|user-not-found/.test(e.code))return 'البريد أو كلمة المرور غير صحيحة.';if(/operation-not-allowed/.test(e.code))return 'طريقة تسجيل الدخول لم تُفعّل بعد في المشروع.';if(/too-many-requests/.test(e.code))return 'محاولات كثيرة. انتظر قليلًا ثم جرّب مجددًا.';return 'تعذر الاتصال الآن. تأكد من اتصالك وحاول مرة أخرى.';}
