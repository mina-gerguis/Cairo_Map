-- SQL Schema for Balance Deposit & Withdrawal Transactions

-- 1. Create balance_transactions table
CREATE TABLE IF NOT EXISTS public.balance_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('deposit', 'withdrawal')),
    amount NUMERIC(10,2) NOT NULL CHECK (amount > 0),
    method TEXT NOT NULL, -- 'instapay', 'vodafone_cash', 'orange_cash', 'etisalat_cash', 'bank_transfer', etc.
    provider_number TEXT NOT NULL, -- الهاتف أو الحساب المحول منه/إليه
    recipient_name TEXT, -- الاسم ثلاثي (مطلوب للسحب البنكي/انستا باي للتأكد)
    transaction_id TEXT, -- رقم العملية (مهم جداً للإيداع لربط الحوالة)
    image_url TEXT, -- رابط صورة إيصال التحويل (مطلوب للإيداع كإثبات)
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    admin_notes TEXT, -- ملاحظات المسؤول (مثل سبب الرفض)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.balance_transactions ENABLE ROW LEVEL SECURITY;

-- 3. Create Security Policies
DROP POLICY IF EXISTS "Users can insert their own transactions" ON public.balance_transactions;
CREATE POLICY "Users can insert their own transactions" ON public.balance_transactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their own transactions" ON public.balance_transactions;
CREATE POLICY "Users can view their own transactions" ON public.balance_transactions
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all transactions" ON public.balance_transactions;
CREATE POLICY "Admins can view all transactions" ON public.balance_transactions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND is_admin = true
        )
    );

DROP POLICY IF EXISTS "Admins can update transactions" ON public.balance_transactions;
CREATE POLICY "Admins can update transactions" ON public.balance_transactions
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND is_admin = true
        )
    );

DROP POLICY IF EXISTS "Admins can delete transactions" ON public.balance_transactions;
CREATE POLICY "Admins can delete transactions" ON public.balance_transactions
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND is_admin = true
        )
    );

-- 4. Trigger Function: Check and deduct balance BEFORE INSERT for withdrawals (Balance Reservation)
CREATE OR REPLACE FUNCTION public.check_and_reserve_withdrawal_balance()
RETURNS TRIGGER AS $$
DECLARE
  v_current_balance NUMERIC(10,2);
BEGIN
  IF NEW.type = 'withdrawal' THEN
    -- جلب الرصيد الحالي للمستخدم
    SELECT balance INTO v_current_balance
    FROM public.profiles
    WHERE id = NEW.user_id;

    IF v_current_balance IS NULL THEN
      RAISE EXCEPTION 'لم يتم العثور على ملف المستخدم الشخصي.';
    END IF;

    -- التحقق من توفر الرصيد
    IF v_current_balance < NEW.amount THEN
      RAISE EXCEPTION 'رصيد المحفظة غير كافٍ لإجراء عملية السحب (الرصيد الحالي: % ج.م).', v_current_balance;
    END IF;

    -- حجز الرصيد بخصمه فوراً
    UPDATE public.profiles
    SET balance = balance - NEW.amount
    WHERE id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS ensure_withdrawal_balance_reservation ON public.balance_transactions;
CREATE TRIGGER ensure_withdrawal_balance_reservation
  BEFORE INSERT ON public.balance_transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.check_and_reserve_withdrawal_balance();

-- 5. Trigger Function: Handle status updates (Approval / Rejection)
CREATE OR REPLACE FUNCTION public.process_balance_transaction_status_change()
RETURNS TRIGGER AS $$
BEGIN
  -- التحقق من الانتقال من pending إلى approved
  IF OLD.status = 'pending' AND NEW.status = 'approved' THEN
    IF NEW.type = 'deposit' THEN
      -- في حالة الإيداع: نضيف الرصيد الآن بعد موافقة المشرف
      UPDATE public.profiles
      SET balance = balance + NEW.amount
      WHERE id = NEW.user_id;
    END IF;
    -- في حالة السحب: المبلغ مخصوم ومحجوز بالفعل، فلا نفعل شيئاً للرصيد
  
  -- التحقق من الانتقال من pending إلى rejected
  ELSIF OLD.status = 'pending' AND NEW.status = 'rejected' THEN
    IF NEW.type = 'withdrawal' THEN
      -- في حالة رفض السحب: نرد المبلغ المحجوز بالكامل للمستخدم
      UPDATE public.profiles
      SET balance = balance + NEW.amount
      WHERE id = NEW.user_id;
    END IF;
    -- في حالة رفض الإيداع: لا نفعل شيئاً لأن الرصيد لم يُضف من الأساس
  END IF;
  
  NEW.updated_at := timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_transaction_status_changed ON public.balance_transactions;
CREATE TRIGGER on_transaction_status_changed
  BEFORE UPDATE ON public.balance_transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.process_balance_transaction_status_change();

-- 6. Trigger Function: Handle deletion of pending transactions (Safety Refund)
CREATE OR REPLACE FUNCTION public.handle_transaction_deletion_refund()
RETURNS TRIGGER AS $$
BEGIN
  -- إذا تم حذف عملية سحب معلقة، يجب إعادة المبلغ للمستخدم
  IF OLD.status = 'pending' AND OLD.type = 'withdrawal' THEN
    UPDATE public.profiles
    SET balance = balance + OLD.amount
    WHERE id = OLD.user_id;
  END IF;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_transaction_deleted_refund ON public.balance_transactions;
CREATE TRIGGER on_transaction_deleted_refund
  AFTER DELETE ON public.balance_transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_transaction_deletion_refund();
