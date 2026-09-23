"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { UserProfile, BalanceTransaction, ProfileAlertMessage } from "../types";

interface UseProfileWalletProps {
  user: any;
  profile: UserProfile | null;
  setProfile: React.Dispatch<React.SetStateAction<UserProfile | null>>;
  refreshProfile: () => Promise<void>;
}

export const useProfileWallet = ({
  user,
  profile,
  setProfile,
  refreshProfile,
}: UseProfileWalletProps) => {
  // Points Modal States
  const [showPointsModal, setShowPointsModal] = useState(false);
  const [showConvertSection, setShowConvertSection] = useState(false);
  const [convertPointsAmount, setConvertPointsAmount] = useState<string>("");
  const [convertingPoints, setConvertingPoints] = useState(false);
  const [convertStatus, setConvertStatus] = useState<ProfileAlertMessage | null>(null);

  // Convert Balance to Points States
  const [showConvertBalanceSection, setShowConvertBalanceSection] = useState(false);
  const [convertBalanceAmount, setConvertBalanceAmount] = useState<string>("");
  const [convertingBalance, setConvertingBalance] = useState(false);
  const [convertBalanceStatus, setConvertBalanceStatus] = useState<ProfileAlertMessage | null>(null);

  // Wallet Modal States
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [walletTab, setWalletTab] = useState<"main" | "deposit" | "withdraw" | "history">("main");

  // Deposit States
  const [depositMethod, setDepositMethod] = useState<string>("instapay");
  const [depositAmount, setDepositAmount] = useState<string>("");
  const [depositSender, setDepositSender] = useState<string>("");
  const [depositTxId, setDepositTxId] = useState<string>("");
  const [depositImageFile, setDepositImageFile] = useState<File | null>(null);
  const [depositImageUrl, setDepositImageUrl] = useState<string>("");
  const [isSubmittingDeposit, setIsSubmittingDeposit] = useState(false);
  const [depositStatus, setDepositStatus] = useState<ProfileAlertMessage | null>(null);

  // Withdraw States
  const [withdrawMethod, setWithdrawMethod] = useState<string>("instapay");
  const [withdrawAmount, setWithdrawAmount] = useState<string>("");
  const [withdrawRecipient, setWithdrawRecipient] = useState<string>("");
  const [withdrawName, setWithdrawName] = useState<string>("");
  const [isSubmittingWithdraw, setIsSubmittingWithdraw] = useState(false);
  const [withdrawStatus, setWithdrawStatus] = useState<ProfileAlertMessage | null>(null);

  // Transactions History States
  const [userTransactions, setUserTransactions] = useState<BalanceTransaction[]>([]);
  const [loadingTransactions, setLoadingTransactions] = useState(false);
  const pendingTransactionsCount = userTransactions.filter((tx) => tx.status === "pending").length;

  const fetchUserTransactions = async () => {
    if (!supabase || !user) return;
    setLoadingTransactions(true);
    try {
      const { data, error } = await supabase
        .from("balance_transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setUserTransactions(data || []);
    } catch (err: any) {
      console.error("Error fetching transactions:", err);
    } finally {
      setLoadingTransactions(false);
    }
  };

  const handleOpenWalletModal = () => {
    setShowWalletModal(true);
    setWalletTab("main");
    setShowConvertBalanceSection(false);
    setConvertBalanceStatus(null);
    setDepositAmount("");
    setDepositSender("");
    setDepositTxId("");
    setDepositImageFile(null);
    setDepositImageUrl("");
    setDepositStatus(null);
    setWithdrawAmount("");
    setWithdrawRecipient("");
    setWithdrawName("");
    setWithdrawStatus(null);
    fetchUserTransactions();
  };

  const handleConvertPoints = async () => {
    if (!supabase || !user || !profile) return;
    setConvertingPoints(true);
    setConvertStatus(null);

    const pointsToConvert = parseInt(convertPointsAmount);
    if (isNaN(pointsToConvert) || pointsToConvert < 1000) {
      setConvertStatus({ type: "error", text: "عفواً، الحد الأدنى لتحويل النقاط هو 1000 نقطة." });
      setConvertingPoints(false);
      return;
    }

    if (pointsToConvert > (profile.points || 0)) {
      setConvertStatus({ type: "error", text: "عفواً، رصيد النقاط لديك غير كافٍ لإجراء هذه العملية." });
      setConvertingPoints(false);
      return;
    }

    try {
      const { data, error } = await supabase.rpc("convert_user_points", {
        points_to_convert: pointsToConvert,
      });

      if (error) throw error;

      if (data && data.success) {
        setConvertStatus({ type: "success", text: data.message });
        setConvertPointsAmount("");

        setProfile((prev) =>
          prev
            ? {
                ...prev,
                points: data.new_points,
                balance: data.new_balance,
              }
            : null
        );

        try {
          const convertedCash = Math.round((pointsToConvert / 100) * 100) / 100;
          await supabase.from("balance_transactions").insert({
            user_id: user.id,
            type: "deposit",
            method: "points_conversion",
            amount: convertedCash,
            provider_number: "system_points",
            recipient_name: profile?.full_name || "مستخدم",
            transaction_id: "PTS_CONV_" + Date.now(),
            status: "approved",
            admin_notes: `تحويل ${pointsToConvert} نقطة إلى ${convertedCash} ج.م رصيد`,
          });
        } catch (ptsErr) {
          console.warn("Points conversion balance_transactions log note:", ptsErr);
        }

        if (refreshProfile) {
          await refreshProfile();
        }
      } else {
        setConvertStatus({ type: "error", text: data?.message || "فشلت عملية التحويل." });
      }
    } catch (err: any) {
      console.error(err);
      setConvertStatus({
        type: "error",
        text: "حدث خطأ غير متوقع: " + (err.message || "فشلت العملية"),
      });
    } finally {
      setConvertingPoints(false);
    }
  };

  const handleConvertBalanceToPoints = async () => {
    if (!supabase || !user || !profile) return;
    setConvertingBalance(true);
    setConvertBalanceStatus(null);

    const balanceToConvert = parseFloat(convertBalanceAmount);
    if (isNaN(balanceToConvert) || balanceToConvert < 10) {
      setConvertBalanceStatus({
        type: "error",
        text: "عفواً، الحد الأدنى لتحويل الرصيد هو 10 جنيهات مصري.",
      });
      setConvertingBalance(false);
      return;
    }

    if (balanceToConvert > (profile.balance || 0)) {
      setConvertBalanceStatus({
        type: "error",
        text: "عفواً، رصيد المحفظة لديك غير كافٍ لإجراء هذه العملية.",
      });
      setConvertingBalance(false);
      return;
    }

    try {
      const { data, error } = await supabase.rpc("convert_user_balance", {
        balance_to_convert: balanceToConvert,
      });

      if (error) throw error;

      if (data && data.success) {
        setConvertBalanceStatus({ type: "success", text: data.message });
        setConvertBalanceAmount("");

        setProfile((prev) =>
          prev
            ? {
                ...prev,
                points: data.new_points,
                balance: data.new_balance,
              }
            : null
        );

        if (refreshProfile) {
          await refreshProfile();
        }
      } else {
        setConvertBalanceStatus({ type: "error", text: data?.message || "فشلت عملية التحويل." });
      }
    } catch (err: any) {
      console.error(err);
      setConvertBalanceStatus({
        type: "error",
        text: "حدث خطأ غير متوقع: " + (err.message || "فشلت العملية"),
      });
    } finally {
      setConvertingBalance(false);
    }
  };

  const handleTransactionReceiptUpload = async (file: File): Promise<string> => {
    if (!supabase) return "";
    const fileExt = file.name.split(".").pop();
    const fileName = `${user?.id}_${Date.now()}.${fileExt}`;
    const filePath = `receipts/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      throw new Error("فشل رفع صورة الإيصال: " + uploadError.message);
    }

    const { data: pub } = supabase.storage.from("avatars").getPublicUrl(filePath);
    return pub.publicUrl;
  };

  const handleDepositImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setDepositImageFile(file);
      setDepositImageUrl(URL.createObjectURL(file));
    }
  };

  const handleDepositSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase || !user) return;
    setIsSubmittingDeposit(true);
    setDepositStatus(null);

    // Spam check
    try {
      const { count, error: countError } = await supabase
        .from("balance_transactions")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("status", "pending");

      if (countError) throw countError;

      if (count !== null && count >= 2) {
        setDepositStatus({
          type: "error",
          text: "عفواً، لا يمكنك تقديم طلب إيداع جديد لوجود طلبين معلقين بالفعل قيد المراجعة. يرجى الانتظار حتى يتم البت فيهما.",
        });
        setIsSubmittingDeposit(false);
        return;
      }
    } catch (errCount: any) {
      console.error("Error checking pending count:", errCount);
      setDepositStatus({ type: "error", text: "فشل التحقق من الطلبات المعلقة." });
      setIsSubmittingDeposit(false);
      return;
    }

    const amount = parseFloat(depositAmount);
    if (isNaN(amount) || amount <= 0) {
      setDepositStatus({ type: "error", text: "يرجى إدخال مبلغ صحيح أكبر من الصفر." });
      setIsSubmittingDeposit(false);
      return;
    }

    if (!depositSender.trim()) {
      setDepositStatus({ type: "error", text: "يرجى إدخال الرقم أو الحساب المحول منه." });
      setIsSubmittingDeposit(false);
      return;
    }

    try {
      let uploadedUrl = "";
      if (depositImageFile) {
        uploadedUrl = await handleTransactionReceiptUpload(depositImageFile);
      }

      const { error } = await supabase.from("balance_transactions").insert({
        user_id: user.id,
        type: "deposit",
        amount: amount,
        method: depositMethod,
        provider_number: depositSender,
        transaction_id: depositTxId,
        image_url: uploadedUrl || null,
        status: "pending",
      });

      if (error) throw error;

      setDepositStatus({
        type: "success",
        text: "تم إرسال طلب الإيداع بنجاح، وهو قيد المراجعة الآن.",
      });
      setDepositAmount("");
      setDepositSender("");
      setDepositTxId("");
      setDepositImageFile(null);
      setDepositImageUrl("");

      fetchUserTransactions();

      setTimeout(() => {
        setWalletTab("main");
      }, 2000);
    } catch (err: any) {
      console.error(err);
      setDepositStatus({ type: "error", text: err.message || "حدث خطأ أثناء إرسال الطلب." });
    } finally {
      setIsSubmittingDeposit(false);
    }
  };

  const handleWithdrawSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase || !user) return;
    setIsSubmittingWithdraw(true);
    setWithdrawStatus(null);

    try {
      const { count, error: countError } = await supabase
        .from("balance_transactions")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("status", "pending");

      if (countError) throw countError;

      if (count !== null && count >= 2) {
        setWithdrawStatus({
          type: "error",
          text: "عفواً، لا يمكنك تقديم طلب سحب جديد لوجود طلبين معلقين بالفعل قيد المراجعة. يرجى الانتظار حتى يتم البت فيهما.",
        });
        setIsSubmittingWithdraw(false);
        return;
      }
    } catch (errCount: any) {
      console.error("Error checking pending count:", errCount);
      setWithdrawStatus({ type: "error", text: "فشل التحقق من الطلبات المعلقة." });
      setIsSubmittingWithdraw(false);
      return;
    }

    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount < 100) {
      setWithdrawStatus({ type: "error", text: "عفواً، الحد الأدنى للسحب هو 100 ج.م." });
      setIsSubmittingWithdraw(false);
      return;
    }

    if (amount > (profile?.balance ?? 0)) {
      setWithdrawStatus({
        type: "error",
        text: "رصيد المحفظة لديك غير كافٍ لإجراء هذه العملية.",
      });
      setIsSubmittingWithdraw(false);
      return;
    }

    if (!withdrawRecipient.trim()) {
      setWithdrawStatus({
        type: "error",
        text: "يرجى إدخال الحساب أو الرقم المراد التحويل إليه.",
      });
      setIsSubmittingWithdraw(false);
      return;
    }

    if (withdrawMethod !== "vodafone_cash" && !withdrawName.trim()) {
      setWithdrawStatus({ type: "error", text: "يرجى إدخال اسم المستلم بالكامل." });
      setIsSubmittingWithdraw(false);
      return;
    }

    try {
      const { error } = await supabase.from("balance_transactions").insert({
        user_id: user.id,
        type: "withdrawal",
        amount: amount,
        method: withdrawMethod,
        provider_number: withdrawRecipient,
        recipient_name: withdrawName || null,
        status: "pending",
      });

      if (error) throw error;

      setWithdrawStatus({
        type: "success",
        text: "تم تقديم طلب السحب بنجاح وخصم المبلغ مؤقتاً.",
      });
      setWithdrawAmount("");
      setWithdrawRecipient("");
      setWithdrawName("");

      if (refreshProfile) {
        await refreshProfile();
      }

      fetchUserTransactions();

      setTimeout(() => {
        setWalletTab("main");
      }, 2000);
    } catch (err: any) {
      console.error(err);
      setWithdrawStatus({ type: "error", text: err.message || "حدث خطأ أثناء إرسال الطلب." });
    } finally {
      setIsSubmittingWithdraw(false);
    }
  };

  return {
    showPointsModal,
    setShowPointsModal,
    showConvertSection,
    setShowConvertSection,
    convertPointsAmount,
    setConvertPointsAmount,
    convertingPoints,
    convertStatus,
    showConvertBalanceSection,
    setShowConvertBalanceSection,
    convertBalanceAmount,
    setConvertBalanceAmount,
    convertingBalance,
    convertBalanceStatus,
    showWalletModal,
    setShowWalletModal,
    walletTab,
    setWalletTab,
    depositMethod,
    setDepositMethod,
    depositAmount,
    setDepositAmount,
    depositSender,
    setDepositSender,
    depositTxId,
    setDepositTxId,
    depositImageFile,
    depositImageUrl,
    isSubmittingDeposit,
    depositStatus,
    withdrawMethod,
    setWithdrawMethod,
    withdrawAmount,
    setWithdrawAmount,
    withdrawRecipient,
    setWithdrawRecipient,
    withdrawName,
    setWithdrawName,
    isSubmittingWithdraw,
    withdrawStatus,
    userTransactions,
    loadingTransactions,
    pendingTransactionsCount,
    handleOpenWalletModal,
    handleConvertPoints,
    handleConvertBalanceToPoints,
    handleDepositImageChange,
    handleDepositSubmit,
    handleWithdrawSubmit,
    fetchUserTransactions,
  };
};
