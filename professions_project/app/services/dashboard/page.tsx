"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { egyptLocations, governoratesList } from "@/data/egypt_locations";
import { playNotificationSound, requestNotificationPermission } from "@/lib/notificationSound";

interface WorkerProfile {
  id: string;
  specialty: string;
  experience_years: number;
  age: number;
  bio: string;
  is_verified: boolean;
  is_available: boolean;
  is_emergency_available?: boolean;
  rating_avg: number;
}

interface PortfolioItem {
  id: string;
  image_url: string;
  title: string;
  created_at: string;
}

interface BeforeAfterItem {
  id: string;
  title: string;
  before_image_url: string;
  after_image_url: string;
  created_at: string;
}

interface OpenJobItem {
  id: string;
  client_id: string;
  title: string;
  specialty: string;
  governorate: string;
  city: string;
  budget: number;
  description: string;
  status: "open" | "assigned" | "completed" | "cancelled";
  created_at: string;
}

interface ServiceRequest {
  id: string;
  client_id: string;
  worker_id: string;
  description: string;
  scheduled_date?: string;
  scheduled_time?: string;
  status: "pending" | "accepted" | "completed" | "cancelled";
  created_at: string;
  client_profile?: {
    full_name: string;
    phone: string;
    governorate: string;
    city: string;
  };
  worker_profile?: {
    full_name: string;
    phone: string;
    specialty?: string;
  };
}

const SPECIALTIES_LIST = [
  "سباك",
  "كهربائي",
  "ميكانيكي",
  "طبيب",
  "نجار",
  "نقاش",
  "بناء",
  "فني تكييف",
  "فني دش",
  "خياط"
];

export default function ServicesDashboard() {
  const router = useRouter();
  const { user, profile } = useAuth();

  const [loading, setLoading] = useState(true);
  const [isWorker, setIsWorker] = useState(false);
  const [workerProfile, setWorkerProfile] = useState<WorkerProfile | null>(null);
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [beforeAfterItems, setBeforeAfterItems] = useState<BeforeAfterItem[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<ServiceRequest[]>([]); // sent to Worker
  const [myRequests, setMyRequests] = useState<ServiceRequest[]>([]); // placed by Client
  const [openJobs, setOpenJobs] = useState<OpenJobItem[]>([]); // Open task board

  // Notification sound permission state
  const [notifPermStatus, setNotifPermStatus] = useState<string>("default");

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setNotifPermStatus(Notification.permission);
    }
  }, []);

  const handleEnableNotifSound = async () => {
    const perm = await requestNotificationPermission();
    setNotifPermStatus(perm);
    if (perm === "granted") {
      playNotificationSound();
      alert("تم تفعيل إشعارات الصوت وإشعارات الجهاز بنجاح! تم تشغيل نغمة تجريبية.");
    } else {
      alert("لم يتم منح الإذن. يرجى تفعيل الإشعارات من إعدادات المتصفح لضمان وصول التنبيهات بالصوت.");
    }
  };

  const handleTestSound = () => {
    playNotificationSound();
  };

  // Worker edit state
  const [editSpecialty, setEditSpecialty] = useState("");
  const [editExp, setEditExp] = useState("0");
  const [editAge, setEditAge] = useState("");
  const [editBio, setEditBio] = useState("");
  const [editAvailable, setEditAvailable] = useState(true);
  const [editEmergency, setEditEmergency] = useState(false);
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [deletingWorkerProfile, setDeletingWorkerProfile] = useState(false);

  // New portfolio upload state
  const [uploadingImage, setUploadingImage] = useState(false);
  const [portfolioTitle, setPortfolioTitle] = useState("");

  // Before / After Upload State
  const [uploadingBA, setUploadingBA] = useState(false);
  const [baTitle, setBaTitle] = useState("");
  const [beforeFile, setBeforeFile] = useState<File | null>(null);
  const [afterFile, setAfterFile] = useState<File | null>(null);

  // Post Open Task Modal
  const [showPostJobModal, setShowPostJobModal] = useState(false);
  const [jobTitle, setJobTitle] = useState("");
  const [jobSpecialty, setJobSpecialty] = useState(SPECIALTIES_LIST[0]);
  const [jobGov, setJobGov] = useState(governoratesList[0] || "القاهرة");
  const [jobCity, setJobCity] = useState("");
  const [jobBudget, setJobBudget] = useState("");
  const [jobDesc, setJobDesc] = useState("");
  const [postingJob, setPostingJob] = useState(false);

  // Review Modals State
  const [activeReviewRequest, setActiveReviewRequest] = useState<ServiceRequest | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewType, setReviewType] = useState<"client_review" | "worker_review">("worker_review");
  
  // Review rating fields
  const [rating1, setRating1] = useState(5);
  const [rating2, setRating2] = useState(5);
  const [rating3, setRating3] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  // Upgrade user to Worker fields
  const [showUpgradeForm, setShowUpgradeForm] = useState(false);
  const [upgradeSpecialty, setUpgradeSpecialty] = useState(SPECIALTIES_LIST[0]);
  const [upgradeCustomSpecialty, setUpgradeCustomSpecialty] = useState("");
  const [upgradeExp, setUpgradeExp] = useState("0");
  const [upgradeAge, setUpgradeAge] = useState("");
  const [upgradeBio, setUpgradeBio] = useState("");
  const [upgrading, setUpgrading] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const active = localStorage.getItem("services_auth_active");
      if (active === "false" || !user) {
        router.push("/services/auth/login");
        return;
      }
    } else if (!user) {
      router.push("/services/auth/login");
      return;
    }

    async function loadDashboardData() {
      if (!supabase || !user) return;
      try {
        // 1. Check if user is worker
        const { data: wProfile } = await supabase
          .from("service_workers")
          .select("*")
          .eq("id", user.id)
          .maybeSingle();

        if (wProfile) {
          setIsWorker(true);
          setWorkerProfile(wProfile);
          setEditSpecialty(wProfile.specialty);
          setEditExp(String(wProfile.experience_years));
          setEditAge(String(wProfile.age || ""));
          setEditBio(wProfile.bio || "");
          setEditAvailable(wProfile.is_available);
          setEditEmergency(!!wProfile.is_emergency_available);

          // Fetch worker portfolio
          const { data: portData } = await supabase
            .from("worker_portfolio")
            .select("*")
            .eq("worker_id", user.id)
            .order("created_at", { ascending: false });
          if (portData) setPortfolio(portData);

          // Fetch Before & After portfolio
          const { data: baData } = await supabase
            .from("before_after_portfolio")
            .select("*")
            .eq("worker_id", user.id)
            .order("created_at", { ascending: false });
          if (baData) setBeforeAfterItems(baData);

          // Fetch incoming requests sent to worker
          const { data: incData } = await supabase
            .from("service_requests")
            .select("*")
            .eq("worker_id", user.id)
            .order("created_at", { ascending: false });

          if (incData && incData.length > 0) {
            const clientIds = Array.from(new Set(incData.map(r => r.client_id)));
            const { data: clientProfiles } = await supabase
              .from("profiles")
              .select("id, full_name, phone, governorate, city")
              .in("id", clientIds);

            const profMap = new Map((clientProfiles || []).map(p => [p.id, p]));
            const mappedInc = incData.map(item => ({
              ...item,
              client_profile: profMap.get(item.client_id) || { full_name: "عميل", phone: "", governorate: "", city: "" }
            }));
            setIncomingRequests(mappedInc as any[]);
          } else {
            setIncomingRequests([]);
          }
        }

        // 2. Fetch reviews submitted by this client
        const { data: myReviews } = await supabase
          .from("worker_reviews")
          .select("worker_id, request_id")
          .eq("client_id", user.id);

        const reviewedWorkerIds = new Set((myReviews || []).map(r => r.worker_id));
        const reviewedReqIds = new Set((myReviews || []).map(r => r.request_id).filter(Boolean));

        // Fetch requests placed by user as a Client
        const { data: clientData } = await supabase
          .from("service_requests")
          .select("*")
          .eq("client_id", user.id)
          .order("created_at", { ascending: false });

        if (clientData && clientData.length > 0) {
          const workerIds = Array.from(new Set(clientData.map(r => r.worker_id)));
          const { data: workerProfiles } = await supabase
            .from("profiles")
            .select("id, full_name, phone")
            .in("id", workerIds);

          const { data: workerSpecs } = await supabase
            .from("service_workers")
            .select("id, specialty")
            .in("id", workerIds);

          const profMap = new Map((workerProfiles || []).map(p => [p.id, p]));
          const specMap = new Map((workerSpecs || []).map(w => [w.id, w.specialty]));

          const mapped = clientData.map(item => {
            const prof = profMap.get(item.worker_id);
            const spec = specMap.get(item.worker_id);
            return {
              ...item,
              hasRated: reviewedReqIds.has(item.id) || reviewedWorkerIds.has(item.worker_id),
              worker_profile: {
                full_name: prof?.full_name || "فني",
                phone: prof?.phone || "",
                specialty: spec || ""
              }
            };
          });
          setMyRequests(mapped as any[]);
        } else {
          setMyRequests([]);
        }

        // 3. Fetch Open Job Board items
        const { data: jobsData } = await supabase
          .from("open_job_board")
          .select("*")
          .eq("status", "open")
          .order("created_at", { ascending: false });
        if (jobsData) setOpenJobs(jobsData);

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, [user, router]);

  const handleUpdateWorkerProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase || !user) return;

    setUpdatingProfile(true);
    try {
      // First attempt with is_emergency_available
      let { error } = await supabase
        .from("service_workers")
        .update({
          specialty: editSpecialty.trim(),
          experience_years: parseInt(editExp) || 0,
          age: parseInt(editAge) || null,
          bio: editBio.trim(),
          is_available: editAvailable,
          is_emergency_available: editEmergency
        })
        .eq("id", user.id);

      // If is_emergency_available column is missing in Supabase schema, retry with base fields
      if (error && error.message.includes("is_emergency_available")) {
        const { error: fallbackErr } = await supabase
          .from("service_workers")
          .update({
            specialty: editSpecialty.trim(),
            experience_years: parseInt(editExp) || 0,
            age: parseInt(editAge) || null,
            bio: editBio.trim(),
            is_available: editAvailable
          })
          .eq("id", user.id);
        
        error = fallbackErr;
      }

      if (error) {
        alert("فشل تحديث البيانات: " + error.message);
      } else {
        alert("تم تحديث الملف المهني بنجاح!");
        setWorkerProfile(prev => prev ? {
          ...prev,
          specialty: editSpecialty,
          experience_years: parseInt(editExp) || 0,
          age: parseInt(editAge) || 0,
          bio: editBio,
          is_available: editAvailable,
          is_emergency_available: editEmergency
        } : null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleAddBeforeAfterItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!beforeFile || !afterFile || !supabase || !user) {
      alert("يرجى اختيار صورتين (قبل وبعد الصيانة)");
      return;
    }

    setUploadingBA(true);
    try {
      // 1. Upload before image
      const beforeExt = beforeFile.name.split('.').pop();
      const beforeName = `${user.id}_before_${Date.now()}.${beforeExt}`;
      const { error: bErr } = await supabase.storage.from("portfolio").upload(`${user.id}/${beforeName}`, beforeFile);
      if (bErr) throw bErr;
      const { data: bUrl } = supabase.storage.from("portfolio").getPublicUrl(`${user.id}/${beforeName}`);

      // 2. Upload after image
      const afterExt = afterFile.name.split('.').pop();
      const afterName = `${user.id}_after_${Date.now()}.${afterExt}`;
      const { error: aErr } = await supabase.storage.from("portfolio").upload(`${user.id}/${afterName}`, afterFile);
      if (aErr) throw aErr;
      const { data: aUrl } = supabase.storage.from("portfolio").getPublicUrl(`${user.id}/${afterName}`);

      if (bUrl?.publicUrl && aUrl?.publicUrl) {
        const { data: inserted, error: dbErr } = await supabase
          .from("before_after_portfolio")
          .insert({
            worker_id: user.id,
            title: baTitle.trim() || "عملية صيانة وإصلاح",
            before_image_url: bUrl.publicUrl,
            after_image_url: aUrl.publicUrl
          })
          .select()
          .single();

        if (dbErr) throw dbErr;
        if (inserted) {
          setBeforeAfterItems(prev => [inserted, ...prev]);
          setBaTitle("");
          setBeforeFile(null);
          setAfterFile(null);
          alert("تمت إضافة نموذج (قبل وبعد) بنجاح للمعرض!");
        }
      }
    } catch (err: any) {
      alert("حدث خطأ أثناء رفع صور المقارنة: " + err.message);
    } finally {
      setUploadingBA(false);
    }
  };

  const handlePostOpenJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase || !user) return;

    setPostingJob(true);
    try {
      const { data: newJob, error } = await supabase
        .from("open_job_board")
        .insert({
          client_id: user.id,
          title: jobTitle.trim(),
          specialty: jobSpecialty,
          governorate: jobGov,
          city: jobCity.trim() || "غير محدد",
          budget: parseFloat(jobBudget) || 0,
          description: jobDesc.trim(),
          status: "open"
        })
        .select()
        .single();

      if (error) {
        if (error.message.includes("open_job_board") || error.message.includes("schema cache")) {
          alert("فشل نشر الطلب المفتوح: جدول 'open_job_board' غير موجود في قاعدة البيانات. يرجى تشغيل ملف supabase_service_features.sql في محرر SQL في Supabase.");
        } else {
          alert("فشل نشر الطلب المفتوح: " + error.message);
        }
      } else if (newJob) {
        setOpenJobs(prev => [newJob, ...prev]);
        setShowPostJobModal(false);
        setJobTitle("");
        setJobDesc("");
        setJobBudget("");
        alert("🎉 تم نشر الطلب المفتوح في سوق المهام بنجاح! وسوف يتلقى الفنيون تنبيهاً صوتياً بالطلب.");
      }
    } catch (err: any) {
      alert("حدث خطأ: " + err.message);
    } finally {
      setPostingJob(false);
    }
  };

  const handleApplyToOpenJob = async (job: OpenJobItem) => {
    if (!supabase || !user || !isWorker) return;

    const confirmApply = window.confirm(`هل تريد التقدم لإنجاز المهمة (${job.title}) وإرسال طلب للعميل؟`);
    if (!confirmApply) return;

    try {
      // Insert service request to client
      const { error } = await supabase
        .from("service_requests")
        .insert({
          client_id: job.client_id,
          worker_id: user.id,
          description: `أنا جاهز لإنجاز المهمة المفتوحة (${job.title}): "${job.description.slice(0, 60)}..."`,
          status: "pending"
        });

      if (error) {
        alert("فشل التقدم للمهمة: " + error.message);
      } else {
        // Send notification to client
        await supabase.from("notifications").insert({
          user_id: job.client_id,
          title: "🛠️ تقدم فني لمهمتك المفتوحة!",
          message: `تقدم الفني ${profile?.full_name || ''} لإنجاز مهمتك (${job.title}).`,
          type: "info",
          link: "/services/dashboard"
        });
        alert("تم إرسال موافقتك والتقدم للعميل بنجاح!");
      }
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleUpdateRequestStatus = async (requestId: string, newStatus: "accepted" | "completed" | "cancelled", isIncoming: boolean) => {
    if (!supabase) return;

    try {
      const { error } = await supabase
        .from("service_requests")
        .update({ status: newStatus })
        .eq("id", requestId);

      if (error) {
        alert("فشل تحديث حالة الطلب: " + error.message);
      } else {
        // Send notification to recipient
        const req = (isIncoming ? incomingRequests : myRequests).find(r => r.id === requestId);
        if (req) {
          const recipientId = isIncoming ? req.client_id : req.worker_id;
          const statusMessages = {
            accepted: "✅ تم قبول طلب الخدمة الخاص بك من قبل مقدم الخدمة!",
            completed: "🎉 تم إكمال وتأكيد طلب الخدمة بنجاح!",
            cancelled: "❌ تم إلغاء طلب الخدمة."
          };
          await supabase.from("notifications").insert({
            user_id: recipientId,
            title: "تحديث طلب الخدمة 🛠️",
            message: statusMessages[newStatus] || `تغيرت حالة الطلب إلى ${newStatus}`,
            type: newStatus === "accepted" || newStatus === "completed" ? "success" : "warning",
            link: "/services/dashboard"
          });

          // If completed, record transaction log for audit
          if (newStatus === "completed" && isWorker) {
            try {
              await (supabase.from("balance_transactions").insert({
                user_id: user?.id,
                type: "withdrawal",
                amount: 15.00, // standard small service commission fee
                method: "wallet",
                provider_number: "system_commission",
                recipient_name: "Cairo Map Commission",
                transaction_id: "FEE_" + Date.now(),
                status: "approved",
                admin_notes: `عمولة إنجاز طلب خدمة رقم ${requestId}`
              }) as any);
            } catch {
              // Ignore commission log error
            }
          }
        }

        // Update local state
        const updateList = (list: ServiceRequest[]) =>
          list.map(req => req.id === requestId ? { ...req, status: newStatus } : req);

        if (isIncoming) {
          setIncomingRequests(updateList(incomingRequests));
        } else {
          setMyRequests(updateList(myRequests));
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendDashboardReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase || !user || !activeReviewRequest) return;

    // Verify request is completed
    if (activeReviewRequest.status !== "completed") {
      alert("عفواً، يمكنك تقييم الفني فقط بعد إنجاز الخدمة وتغير حالتها إلى مكتملة.");
      return;
    }

    // Double check database directly to ensure user hasn't already rated
    const { data: existingCheck } = await supabase
      .from("worker_reviews")
      .select("id")
      .eq("client_id", user.id)
      .eq("worker_id", activeReviewRequest.worker_id)
      .limit(1);

    if (existingCheck && existingCheck.length > 0) {
      alert("عفواً، لقد قمت بتقييم هذا المهني سابقاً. يُسمح بالتقييم مرة واحدة فقط.");
      setShowReviewModal(false);
      setActiveReviewRequest(null);
      setMyRequests(prev => prev.map(req =>
        req.worker_id === activeReviewRequest.worker_id ? ({ ...req, hasRated: true } as any) : req
      ));
      return;
    }

    setSubmittingReview(true);
    try {
      const { error } = await supabase
        .from("worker_reviews")
        .insert({
          worker_id: activeReviewRequest.worker_id,
          client_id: user.id,
          request_id: activeReviewRequest.id,
          rating_quality: rating1,
          rating_time: rating2,
          rating_price: rating3,
          comment: reviewComment.trim()
        });

      if (error) {
        alert("فشل تقديم التقييم: " + error.message);
      } else {
        alert("تم إرسال تقييمك بنجاح! شكراً لك.");
        setShowReviewModal(false);
        setActiveReviewRequest(null);
        setReviewComment("");
        setRating1(5);
        setRating2(5);
        setRating3(5);

        // Update local state to show 'hasRated'
        setMyRequests(prev => prev.map(req =>
          req.id === activeReviewRequest.id || req.worker_id === activeReviewRequest.worker_id
            ? ({ ...req, hasRated: true } as any)
            : req
        ));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleDeleteWorkerProfile = async () => {
    if (!supabase || !user) return;
    const confirmed = window.confirm("هل أنت متأكد من رغبتك في حذف حسابك من سجلات مقدمي الخدمات؟");
    if (!confirmed) return;

    setDeletingWorkerProfile(true);
    try {
      await supabase.from("worker_portfolio").delete().eq("worker_id", user.id);
      const { error } = await supabase.from("service_workers").delete().eq("id", user.id);

      if (error) {
        alert("فشل حذف الحساب: " + error.message);
      } else {
        alert("تم حذف حسابك من سجلات مقدمي الخدمات بنجاح.");
        setIsWorker(false);
        setWorkerProfile(null);
        window.location.reload();
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setDeletingWorkerProfile(false);
    }
  };

  const handleServicesLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("services_auth_active", "false");
    }
    router.push("/services/auth/login?logged_out=true");
  };

  const handleAddPortfolioImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !supabase || !user) return;

    setUploadingImage(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}_port_${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage.from("portfolio").upload(filePath, file);
      if (uploadError) {
        alert("فشل رفع الصورة: " + uploadError.message);
        setUploadingImage(false);
        return;
      }

      const { data: pubUrl } = supabase.storage.from("portfolio").getPublicUrl(filePath);

      if (pubUrl && pubUrl.publicUrl) {
        const titleToUse = portfolioTitle.trim() || file.name.split('.')[0] || "عمل منجز";
        const { data: insertData, error: dbErr } = await supabase
          .from("worker_portfolio")
          .insert({
            worker_id: user.id,
            image_url: pubUrl.publicUrl,
            title: titleToUse
          })
          .select()
          .single();

        if (dbErr) {
          alert("فشل حفظ العمل: " + dbErr.message);
        } else if (insertData) {
          setPortfolio(prev => [insertData, ...prev]);
          setPortfolioTitle("");
          alert("تمت إضافة العمل إلى معرض أعمالك بنجاح!");
        }
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleUpgradeToWorker = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase || !user) return;

    setUpgrading(true);
    const finalSpecialty = upgradeSpecialty === "أخرى (كتابة تخصص جديد)" ? upgradeCustomSpecialty : upgradeSpecialty;

    if (!finalSpecialty.trim()) {
      alert("يرجى إدخال التخصص الخاص بك.");
      setUpgrading(false);
      return;
    }

    try {
      // Ensure profile exists for user.id to prevent FK constraint violations
      const { data: profileCheck } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", user.id)
        .limit(1);

      if (!profileCheck || profileCheck.length === 0) {
        const fallbackName = profile?.full_name || user.user_metadata?.full_name || user.email?.split("@")[0] || "عميل";
        const fallbackUsername = profile?.username || user.email?.split("@")[0]?.toLowerCase().replace(/[^a-z0-9_]/g, "") || `user_${user.id.slice(0, 6)}`;
        
        await supabase.from("profiles").upsert({
          id: user.id,
          full_name: fallbackName,
          username: fallbackUsername,
          email: user.email || ""
        }, { onConflict: "id" });
      }

      const { error } = await supabase
        .from("service_workers")
        .insert({
          id: user.id,
          specialty: finalSpecialty.trim(),
          experience_years: parseInt(upgradeExp) || 0,
          age: parseInt(upgradeAge) || null,
          bio: upgradeBio.trim(),
          is_available: true
        });

      if (error) {
        alert("فشل تفعيل حساب العامل: " + error.message);
      } else {
        alert("🎉 مبروك! تم تفعيل حساب مقدم الخدمة بنجاح.");
        setIsWorker(true);
        window.location.reload();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpgrading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "var(--bg-primary)" }}>
        <div style={{ textAlign: "center", color: "var(--text-secondary)" }}>
          <span style={{ display: "inline-block", width: "32px", height: "32px", border: "3px solid var(--border-glass)", borderTopColor: "var(--accent-ios, #3b82f6)", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
          <p style={{ marginTop: "12px" }}>جاري تحميل لوحة التحكم...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="metro-animate-fade" style={{ minHeight: "100vh", padding: "40px 20px", backgroundColor: "var(--bg-primary)", direction: "rtl" }}>
      <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
        
        {/* Header Dashboard */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "14px",
          marginBottom: "24px",
          borderBottom: "1px solid var(--border-glass)",
          paddingBottom: "20px"
        }}>
          <div>
            <h1 style={{ fontFamily: "var(--font-almarai)", fontSize: "1.8rem", fontWeight: "800", color: "var(--text-primary)" }}>
              لوحة تحكم الخدمات
            </h1>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", margin: "4px 0 0" }}>
              مرحباً بك، {profile?.full_name || "مستخدم ماب"} | حساب {isWorker ? "مقدم خدمة (فني)" : "عميل"}
            </p>
          </div>
          <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
            <button
              onClick={() => setShowPostJobModal(true)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                background: "var(--accent-ios, #3b82f6)",
                color: "#ffffff",
                padding: "8px 16px",
                borderRadius: "20px",
                fontSize: "0.85rem",
                fontWeight: "700",
                border: "none",
                cursor: "pointer"
              }}
            >
              📝 نشر طلب عمل مفتوح
            </button>

            <Link href="/services" style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              background: "var(--bg-secondary)",
              border: "1px solid var(--border-glass)",
              color: "var(--text-primary)",
              padding: "8px 16px",
              borderRadius: "20px",
              fontSize: "0.85rem",
              textDecoration: "none",
              fontWeight: "700"
            }}>
              🔍 تصفح دليل الخدمات
            </Link>

            <button
              onClick={handleServicesLogout}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                background: "rgba(239, 68, 68, 0.1)",
                border: "1px solid rgba(239, 68, 68, 0.25)",
                color: "var(--accent-danger, #ef4444)",
                padding: "8px 16px",
                borderRadius: "20px",
                fontSize: "0.85rem",
                cursor: "pointer",
                fontWeight: "700"
              }}
            >
              🚪 تسجيل الخروج
            </button>
          </div>
        </div>

        {/* Sound & Push Notification Settings Banner */}
        <div style={{
          background: notifPermStatus === "granted" 
            ? "linear-gradient(135deg, rgba(16,185,129,0.08), rgba(59,130,246,0.08))"
            : "linear-gradient(135deg, rgba(245,158,11,0.1), rgba(239,68,68,0.08))",
          border: `1px solid ${notifPermStatus === "granted" ? "rgba(16,185,129,0.3)" : "rgba(245,158,11,0.3)"}`,
          borderRadius: "14px",
          padding: "16px 20px",
          marginBottom: "24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "12px"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{ fontSize: "1.6rem" }}>
              {notifPermStatus === "granted" ? "🔔" : "⚠️"}
            </span>
            <div>
              <h4 style={{ margin: 0, fontSize: "0.95rem", fontWeight: "800", color: "var(--text-primary)" }}>
                {notifPermStatus === "granted" 
                  ? "إشعارات الصوت والخلفية مفعّلة" 
                  : "فعّل إشعارات الصوت لتلقي تنبيهات الطلبات الجديدة برة الموقع!"}
              </h4>
              <p style={{ margin: "2px 0 0", fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                {notifPermStatus === "granted"
                  ? "سيتم تشغيل صوت إشعار مسموع وتنبيه للجهاز فور وصول أي طلب خدمة جديد حتى لو كان المتصفح مصغّراً."
                  : "احصل على تنبيه صوتي فوري وإشعار هاتف/كمبيوتر فور إرسال عميل لطلب عمل جديد لك."}
              </p>
            </div>
          </div>

          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            {notifPermStatus !== "granted" ? (
              <button
                onClick={handleEnableNotifSound}
                style={{
                  background: "var(--accent-ios, #3b82f6)",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "10px",
                  padding: "8px 16px",
                  fontWeight: "700",
                  fontSize: "0.85rem",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px"
                }}
              >
                🔔 تفعيل إشعارات الصوت
              </button>
            ) : (
              <button
                onClick={handleTestSound}
                style={{
                  background: "var(--bg-secondary)",
                  border: "1px solid var(--border-glass)",
                  color: "var(--text-primary)",
                  borderRadius: "10px",
                  padding: "8px 16px",
                  fontWeight: "700",
                  fontSize: "0.85rem",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px"
                }}
              >
                🔊 تجربة صوت الإشعار
              </button>
            )}
          </div>
        </div>

        {/* WORKER DASHBOARD */}
        {isWorker && workerProfile && (
          <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
            
            {/* Split layout: Profile edit & portfolio */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", alignItems: "start" }}>
              
              {/* Column 1: Manage Profile */}
              <div style={{
                background: "var(--bg-primary)",
                border: "1px solid var(--border-glass)",
                borderRadius: "16px",
                padding: "24px",
                boxShadow: "var(--shadow-card)"
              }}>
                <h2 style={{ fontSize: "1.1rem", fontWeight: "800", marginBottom: "16px", color: "var(--accent-ios, #3b82f6)" }}>
                  📝 إدارة بياناتك المهنية وإعدادات الطوارئ
                </h2>
                
                <form onSubmit={handleUpdateWorkerProfile} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <label style={{ fontSize: "0.82rem", fontWeight: "700" }}>التخصص الحالي</label>
                    <input
                      type="text"
                      required
                      value={editSpecialty}
                      onChange={(e) => setEditSpecialty(e.target.value)}
                      className="ios-input"
                      style={{ height: "38px", padding: "0 10px", fontSize: "0.85rem" }}
                    />
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <label style={{ fontSize: "0.82rem", fontWeight: "700" }}>سنوات الخبرة</label>
                      <input
                        type="number"
                        min="0"
                        value={editExp}
                        onChange={(e) => setEditExp(e.target.value)}
                        className="ios-input"
                        style={{ height: "38px", padding: "0 10px", fontSize: "0.85rem" }}
                      />
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <label style={{ fontSize: "0.82rem", fontWeight: "700" }}>العمر</label>
                      <input
                        type="number"
                        value={editAge}
                        onChange={(e) => setEditAge(e.target.value)}
                        className="ios-input"
                        style={{ height: "38px", padding: "0 10px", fontSize: "0.85rem" }}
                      />
                    </div>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <label style={{ fontSize: "0.82rem", fontWeight: "700" }}>نبذة تعريفية ومجالات عملك</label>
                    <textarea
                      value={editBio}
                      onChange={(e) => setEditBio(e.target.value)}
                      style={{
                        height: "80px",
                        padding: "8px 10px",
                        fontSize: "0.85rem",
                        background: "var(--bg-secondary)",
                        border: "1px solid var(--border-glass)",
                        borderRadius: "8px",
                        color: "var(--text-primary)",
                        resize: "none"
                      }}
                    />
                  </div>

                  {/* Availability and Emergency Toggles */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px", background: "var(--bg-secondary)", padding: "12px", borderRadius: "10px" }}>
                    <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "0.85rem", fontWeight: "700" }}>
                      <input
                        type="checkbox"
                        checked={editAvailable}
                        onChange={(e) => setEditAvailable(e.target.checked)}
                      />
                      <span>متاح للعمل وتلقي طلبات عامة</span>
                    </label>

                    <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "0.85rem", fontWeight: "800", color: "var(--accent-danger, #ef4444)" }}>
                      <input
                        type="checkbox"
                        checked={editEmergency}
                        onChange={(e) => setEditEmergency(e.target.checked)}
                      />
                      <span>🚨 أنا متاح لطلبات الطوارئ 24/7 (التحرك الفوري)</span>
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={updatingProfile}
                    style={{
                      height: "38px",
                      borderRadius: "8px",
                      background: "var(--accent-ios, #3b82f6)",
                      color: "#ffffff",
                      border: "none",
                      fontWeight: "700",
                      fontSize: "0.88rem",
                      cursor: "pointer"
                    }}
                  >
                    {updatingProfile ? "جاري التحديث..." : "حفظ التعديلات"}
                  </button>
                </form>
              </div>

              {/* Column 2: Manage Portfolio & Before/After Images */}
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                
                {/* Upload Before/After Pair */}
                <div style={{
                  background: "var(--bg-primary)",
                  border: "1px solid var(--border-glass)",
                  borderRadius: "16px",
                  padding: "20px",
                  boxShadow: "var(--shadow-card)"
                }}>
                  <h3 style={{ fontSize: "1rem", fontWeight: "800", marginBottom: "12px", color: "var(--accent-success, #10b981)" }}>
                    ✨ إضافة عمل (قبل وبعد الصيانة)
                  </h3>
                  <form onSubmit={handleAddBeforeAfterItem} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    <input
                      type="text"
                      placeholder="عنوان العمل (مثال: صيانة سباكة مطبخ)"
                      value={baTitle}
                      onChange={(e) => setBaTitle(e.target.value)}
                      style={{ height: "36px", padding: "0 10px", fontSize: "0.82rem", background: "var(--bg-secondary)", border: "1px solid var(--border-glass)", borderRadius: "6px", color: "var(--text-primary)" }}
                    />
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                      <div>
                        <label style={{ fontSize: "0.75rem", fontWeight: "700" }}>صورة قبل الصيانة</label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => setBeforeFile(e.target.files?.[0] || null)}
                          style={{ fontSize: "0.72rem", width: "100%", marginTop: "2px" }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: "0.75rem", fontWeight: "700" }}>صورة بعد الصيانة</label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => setAfterFile(e.target.files?.[0] || null)}
                          style={{ fontSize: "0.72rem", width: "100%", marginTop: "2px" }}
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      disabled={uploadingBA || !beforeFile || !afterFile}
                      style={{ height: "36px", background: "var(--accent-success, #10b981)", color: "#fff", border: "none", borderRadius: "6px", fontWeight: "700", fontSize: "0.82rem", cursor: "pointer", marginTop: "4px" }}
                    >
                      {uploadingBA ? "جاري الرفع..." : "رفع نتيجتي قبل وبعد"}
                    </button>
                  </form>
                </div>

                {/* Standard Portfolio */}
                <div style={{
                  background: "var(--bg-primary)",
                  border: "1px solid var(--border-glass)",
                  borderRadius: "16px",
                  padding: "20px",
                  boxShadow: "var(--shadow-card)"
                }}>
                  <h3 style={{ fontSize: "1rem", fontWeight: "800", marginBottom: "12px" }}>📸 إضافة عمل لمعرض الصور</h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    <input
                      type="text"
                      placeholder="عنوان الصورة..."
                      value={portfolioTitle}
                      onChange={(e) => setPortfolioTitle(e.target.value)}
                      style={{ height: "36px", padding: "0 10px", fontSize: "0.82rem", background: "var(--bg-secondary)", border: "1px solid var(--border-glass)", borderRadius: "6px", color: "var(--text-primary)" }}
                    />
                    <label style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      height: "36px",
                      background: "var(--bg-secondary)",
                      border: "1px dashed var(--border-glass)",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontSize: "0.82rem",
                      fontWeight: "700"
                    }}>
                      📁 اختر صورة للرفع
                      <input type="file" accept="image/*" onChange={handleAddPortfolioImage} style={{ display: "none" }} />
                    </label>
                  </div>
                </div>
              </div>

            </div>

            {/* Open Job Board Section for Workers */}
            <div style={{
              background: "var(--bg-primary)",
              border: "1px solid var(--border-glass)",
              borderRadius: "16px",
              padding: "24px",
              boxShadow: "var(--shadow-card)"
            }}>
              <h2 style={{ fontSize: "1.2rem", fontWeight: "800", marginBottom: "16px", color: "var(--accent-warning, #f59e0b)", display: "flex", alignItems: "center", gap: "8px" }}>
                📝 سوق الطلبات والمهام المفتوحة بالمنطقة ({openJobs.length})
              </h2>

              {openJobs.length === 0 ? (
                <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem", margin: 0 }}>لا تتوفر طلبات مفتوحة حالياً.</p>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "14px" }}>
                  {openJobs.map(job => (
                    <div key={job.id} style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-glass)", borderRadius: "12px", padding: "16px", display: "flex", flexDirection: "column", gap: "8px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: "0.78rem", fontWeight: "800", color: "var(--accent-ios, #3b82f6)" }}>💼 {job.specialty}</span>
                        <span style={{ fontSize: "0.85rem", fontWeight: "800", color: "var(--accent-success, #10b981)" }}>{job.budget > 0 ? `${job.budget} ج.م` : "حسب الاتفاق"}</span>
                      </div>
                      <h4 style={{ margin: 0, fontSize: "0.95rem", fontWeight: "800", color: "var(--text-primary)" }}>{job.title}</h4>
                      <p style={{ margin: 0, fontSize: "0.82rem", color: "var(--text-secondary)", lineHeight: "1.4" }}>{job.description}</p>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "4px" }}>📍 {job.governorate}، {job.city}</div>
                      
                      <button
                        onClick={() => handleApplyToOpenJob(job)}
                        style={{ height: "34px", background: "var(--accent-ios, #3b82f6)", color: "#fff", border: "none", borderRadius: "6px", fontWeight: "700", fontSize: "0.8rem", cursor: "pointer", marginTop: "6px" }}
                      >
                        ⚡ إنجاز المهمة والتواصل
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Incoming Requests Section */}
            <div style={{
              background: "var(--bg-primary)",
              border: "1px solid var(--border-glass)",
              borderRadius: "16px",
              padding: "24px",
              boxShadow: "var(--shadow-card)"
            }}>
              <h2 style={{ fontSize: "1.2rem", fontWeight: "800", marginBottom: "16px", color: "var(--text-primary)" }}>
                📩 طلبات العمل الواردة إليك ({incomingRequests.length})
              </h2>

              {incomingRequests.length === 0 ? (
                <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", margin: 0 }}>لا توجد طلبات واردة حتى الآن.</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  {incomingRequests.map(req => (
                    <div key={req.id} style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-glass)", borderRadius: "12px", padding: "16px", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
                      <div>
                        <h4 style={{ margin: "0 0 4px", fontSize: "0.95rem", fontWeight: "800", color: "var(--text-primary)" }}>
                          العميل: {req.client_profile?.full_name || "عميل"}
                        </h4>
                        <p style={{ margin: "0 0 6px", fontSize: "0.85rem", color: "var(--text-secondary)" }}>"{req.description}"</p>
                        {req.scheduled_date && (
                          <div style={{ fontSize: "0.78rem", color: "var(--accent-ios, #3b82f6)", fontWeight: "700" }}>
                            📅 الموعد المحدد: {req.scheduled_date} {req.scheduled_time || ''}
                          </div>
                        )}
                        <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: "4px" }}>
                          📍 {req.client_profile?.governorate}، {req.client_profile?.city} | 📞 {req.client_profile?.phone || "سيظهر عند القبول"}
                        </div>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        {req.status === "pending" && (
                          <>
                            <button onClick={() => handleUpdateRequestStatus(req.id, "accepted", true)} style={{ padding: "6px 14px", borderRadius: "6px", background: "var(--accent-success, #10b981)", color: "#fff", border: "none", fontWeight: "700", cursor: "pointer", fontSize: "0.82rem" }}>
                              قبول الطلب ✅
                            </button>
                            <button onClick={() => handleUpdateRequestStatus(req.id, "cancelled", true)} style={{ padding: "6px 14px", borderRadius: "6px", background: "rgba(239, 68, 68, 0.15)", color: "#ef4444", border: "none", fontWeight: "700", cursor: "pointer", fontSize: "0.82rem" }}>
                              إلغاء ❌
                            </button>
                          </>
                        )}
                        {req.status === "accepted" && (
                          <button onClick={() => handleUpdateRequestStatus(req.id, "completed", true)} style={{ padding: "6px 14px", borderRadius: "6px", background: "var(--accent-ios, #3b82f6)", color: "#fff", border: "none", fontWeight: "700", cursor: "pointer", fontSize: "0.82rem" }}>
                            تأكيد الإكمال 🎉
                          </button>
                        )}
                        {req.status === "completed" && <span style={{ color: "var(--accent-success, #10b981)", fontWeight: "700", fontSize: "0.85rem" }}>مكتمل بنجاح ✨</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

        {/* CLIENT DASHBOARD: My Placed Requests */}
        <div style={{
          background: "var(--bg-primary)",
          border: "1px solid var(--border-glass)",
          borderRadius: "16px",
          padding: "24px",
          boxShadow: "var(--shadow-card)",
          marginTop: "28px"
        }}>
          <h2 style={{ fontSize: "1.2rem", fontWeight: "800", marginBottom: "16px", color: "var(--text-primary)" }}>
            📋 طلباتي المرسلة لفنيين ({myRequests.length})
          </h2>

          {myRequests.length === 0 ? (
            <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", margin: 0 }}>لم تطلب خدمات بعد.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {myRequests.map(req => (
                <div key={req.id} style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-glass)", borderRadius: "12px", padding: "16px", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
                  <div>
                    <h4 style={{ margin: "0 0 4px", fontSize: "0.95rem", fontWeight: "800", color: "var(--text-primary)" }}>
                      الفني: {req.worker_profile?.full_name || "فني"} ({req.worker_profile?.specialty})
                    </h4>
                    <p style={{ margin: "0 0 6px", fontSize: "0.85rem", color: "var(--text-secondary)" }}>"{req.description}"</p>
                    <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                      📞 هاتف الفني: {req.worker_profile?.phone || "غير متوفر"}
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{
                      padding: "4px 10px",
                      borderRadius: "12px",
                      fontSize: "0.78rem",
                      fontWeight: "700",
                      background: req.status === "completed" ? "rgba(16,185,129,0.15)" : req.status === "accepted" ? "rgba(59,130,246,0.15)" : "var(--bg-primary)",
                      color: req.status === "completed" ? "#10b981" : req.status === "accepted" ? "#3b82f6" : "var(--text-secondary)"
                    }}>
                      {req.status === "completed" ? "مكتمل ✨" : req.status === "accepted" ? "مقبول ⚡" : "قيد الانتظار ⌛"}
                    </span>

                    {req.status === "completed" && (
                      (req as any).hasRated ? (
                        <span style={{
                          fontSize: "0.78rem",
                          fontWeight: "700",
                          color: "var(--accent-success, #10b981)",
                          background: "rgba(16,185,129,0.1)",
                          padding: "4px 10px",
                          borderRadius: "8px",
                          border: "1px solid rgba(16,185,129,0.25)"
                        }}>
                          ✅ تم التقييم
                        </span>
                      ) : (
                        <button
                          onClick={() => {
                            setActiveReviewRequest(req);
                            setShowReviewModal(true);
                          }}
                          style={{
                            padding: "5px 12px",
                            borderRadius: "8px",
                            background: "var(--accent-ios, #3b82f6)",
                            color: "#fff",
                            border: "none",
                            fontWeight: "700",
                            fontSize: "0.78rem",
                            cursor: "pointer"
                          }}
                        >
                          ⭐ تقييم الفني
                        </button>
                      )
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Post Open Task Modal */}
      {showPostJobModal && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.6)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
          padding: "20px"
        }}>
          <div style={{
            background: "var(--bg-primary)",
            border: "1px solid var(--border-glass)",
            borderRadius: "16px",
            width: "100%",
            maxWidth: "500px",
            padding: "24px",
            position: "relative"
          }}>
            <button onClick={() => setShowPostJobModal(false)} style={{ position: "absolute", top: "16px", left: "16px", background: "none", border: "none", fontSize: "1.2rem", cursor: "pointer", color: "var(--text-secondary)" }}>✖️</button>
            <h3 style={{ fontSize: "1.1rem", fontWeight: "800", marginBottom: "16px", color: "var(--text-primary)" }}>📝 نشر طلب عمل مفتوح في سوق المهام</h3>

            <form onSubmit={handlePostOpenJob} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div>
                <label style={{ fontSize: "0.82rem", fontWeight: "700" }}>عنوان المهمة</label>
                <input required type="text" placeholder="مثال: مطلوب سباك لتغيير وصلات مياه شقة" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} style={{ width: "100%", height: "38px", padding: "0 10px", fontSize: "0.85rem", background: "var(--bg-secondary)", border: "1px solid var(--border-glass)", borderRadius: "8px", color: "var(--text-primary)" }} />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div>
                  <label style={{ fontSize: "0.82rem", fontWeight: "700" }}>التخصص المطلوبة</label>
                  <select value={jobSpecialty} onChange={(e) => setJobSpecialty(e.target.value)} style={{ width: "100%", height: "38px", padding: "0 10px", fontSize: "0.85rem", background: "var(--bg-secondary)", border: "1px solid var(--border-glass)", borderRadius: "8px", color: "var(--text-primary)" }}>
                    {SPECIALTIES_LIST.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: "0.82rem", fontWeight: "700" }}>الميزانية التقديرية (ج.م)</label>
                  <input type="number" placeholder="مثال: 200" value={jobBudget} onChange={(e) => setJobBudget(e.target.value)} style={{ width: "100%", height: "38px", padding: "0 10px", fontSize: "0.85rem", background: "var(--bg-secondary)", border: "1px solid var(--border-glass)", borderRadius: "8px", color: "var(--text-primary)" }} />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div>
                  <label style={{ fontSize: "0.82rem", fontWeight: "700" }}>المحافظة</label>
                  <select value={jobGov} onChange={(e) => setJobGov(e.target.value)} style={{ width: "100%", height: "38px", padding: "0 10px", fontSize: "0.85rem", background: "var(--bg-secondary)", border: "1px solid var(--border-glass)", borderRadius: "8px", color: "var(--text-primary)" }}>
                    {governoratesList.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: "0.82rem", fontWeight: "700" }}>المدينة / الحي</label>
                  <input required type="text" placeholder="مثال: المعادي" value={jobCity} onChange={(e) => setJobCity(e.target.value)} style={{ width: "100%", height: "38px", padding: "0 10px", fontSize: "0.85rem", background: "var(--bg-secondary)", border: "1px solid var(--border-glass)", borderRadius: "8px", color: "var(--text-primary)" }} />
                </div>
              </div>

              <div>
                <label style={{ fontSize: "0.82rem", fontWeight: "700" }}>التفاصيل والشروط</label>
                <textarea required placeholder="اكتب التفاصيل الدقيقة..." value={jobDesc} onChange={(e) => setJobDesc(e.target.value)} style={{ width: "100%", height: "80px", padding: "8px 10px", fontSize: "0.85rem", background: "var(--bg-secondary)", border: "1px solid var(--border-glass)", borderRadius: "8px", color: "var(--text-primary)", resize: "none" }} />
              </div>

              <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "10px" }}>
                <button type="button" onClick={() => setShowPostJobModal(false)} style={{ height: "36px", padding: "0 14px", borderRadius: "6px", background: "var(--bg-secondary)", border: "1px solid var(--border-glass)", color: "var(--text-primary)", fontWeight: "700", cursor: "pointer" }}>إلغاء</button>
                <button type="submit" disabled={postingJob} style={{ height: "36px", padding: "0 18px", borderRadius: "6px", background: "var(--accent-ios, #3b82f6)", color: "#fff", border: "none", fontWeight: "700", cursor: "pointer" }}>{postingJob ? "جاري النشر..." : "نشر الطلب"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Review Modal for Completed Requests */}
      {showReviewModal && activeReviewRequest && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
          padding: "20px"
        }}>
          <div style={{
            background: "var(--bg-primary)",
            border: "1px solid var(--border-glass)",
            borderRadius: "16px",
            width: "100%",
            maxWidth: "480px",
            padding: "24px",
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.15)",
            position: "relative"
          }}>
            <button
              onClick={() => {
                setShowReviewModal(false);
                setActiveReviewRequest(null);
              }}
              style={{ position: "absolute", top: "16px", left: "16px", background: "none", border: "none", fontSize: "1.2rem", cursor: "pointer", color: "var(--text-secondary)" }}
            >
              ✖️
            </button>

            <h3 style={{ fontSize: "1.1rem", fontWeight: "800", marginBottom: "16px", color: "var(--text-primary)" }}>
              ⭐ تقييم الفني ({activeReviewRequest.worker_profile?.full_name || "الفني"})
            </h3>

            <form onSubmit={handleSendDashboardReview} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "0.85rem", fontWeight: "700" }}>جودة العمل:</span>
                  <select value={rating1} onChange={(e) => setRating1(Number(e.target.value))} style={{ padding: "4px 8px", borderRadius: "6px", background: "var(--bg-secondary)", border: "1px solid var(--border-glass)", color: "var(--text-primary)" }}>
                    {[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{n} نجوم</option>)}
                  </select>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "0.85rem", fontWeight: "700" }}>الالتزام بالمواعيد:</span>
                  <select value={rating2} onChange={(e) => setRating2(Number(e.target.value))} style={{ padding: "4px 8px", borderRadius: "6px", background: "var(--bg-secondary)", border: "1px solid var(--border-glass)", color: "var(--text-primary)" }}>
                    {[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{n} نجوم</option>)}
                  </select>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "0.85rem", fontWeight: "700" }}>مناسبة السعر:</span>
                  <select value={rating3} onChange={(e) => setRating3(Number(e.target.value))} style={{ padding: "4px 8px", borderRadius: "6px", background: "var(--bg-secondary)", border: "1px solid var(--border-glass)", color: "var(--text-primary)" }}>
                    {[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{n} نجوم</option>)}
                  </select>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "0.85rem", fontWeight: "700" }}>ملاحظاتك أو تعليقك (اختياري)</label>
                <textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="اكتب انطباعك عن الخدمة المنجزة المعاملة والعمل..."
                  style={{
                    height: "80px",
                    padding: "8px 10px",
                    fontSize: "0.85rem",
                    background: "var(--bg-secondary)",
                    border: "1px solid var(--border-glass)",
                    borderRadius: "8px",
                    color: "var(--text-primary)",
                    resize: "none"
                  }}
                />
              </div>

              <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowReviewModal(false);
                    setActiveReviewRequest(null);
                  }}
                  style={{ height: "36px", padding: "0 14px", borderRadius: "6px", background: "var(--bg-secondary)", border: "1px solid var(--border-glass)", color: "var(--text-primary)", fontWeight: "700", cursor: "pointer" }}
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={submittingReview}
                  style={{ height: "36px", padding: "0 18px", borderRadius: "6px", background: "var(--accent-ios, #3b82f6)", color: "#fff", border: "none", fontWeight: "700", cursor: "pointer" }}
                >
                  {submittingReview ? "جاري الحفظ..." : "إرسال التقييم"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
