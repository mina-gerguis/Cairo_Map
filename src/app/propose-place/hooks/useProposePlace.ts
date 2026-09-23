import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { isFeedbackLimitReached } from "@/lib/feedbackLimit";
import { DEFAULT_CATEGORIES, CATEGORIES_STRUCTURE, formatBoxIcon } from "@/data/places";
import { PlaceProposalFormData, PlaceProposal, CategoryItem } from "../types";

const INITIAL_FORM_DATA: PlaceProposalFormData = {
  name: "",
  category: "",
  category_label: "",
  sub_categories: [],
  place_type: "",
  place_type_icon: "",
  governorate: "",
  city: "",
  address: "",
  phone: "",
  description: "",
  image_url: "",
  images: [],
  working_hours: "",
  price_range: "متوسط",
  location_url: "",
  facebook: "",
  instagram: "",
  website_url: "",
  services: [],
  features: [],
};

export function useProposePlace(user: User | null, authLoading: boolean) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");

  const [categories, setCategories] = useState<CategoryItem[]>(DEFAULT_CATEGORIES);
  const [formData, setFormData] = useState<PlaceProposalFormData>(INITIAL_FORM_DATA);
  const [loading, setLoading] = useState(false);
  const [initialFetching, setInitialFetching] = useState(Boolean(editId));
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [rejectionReason, setRejectionReason] = useState<string | null>(null);

  const [limitChecking, setLimitChecking] = useState(true);
  const [limitReached, setLimitReached] = useState(false);
  const [userProposals, setUserProposals] = useState<PlaceProposal[]>([]);
  const [proposalsLoading, setProposalsLoading] = useState(false);

  const [newImgInput, setNewImgInput] = useState("");
  const [isUploadingImg, setIsUploadingImg] = useState(false);

  // 1. Fetch categories from DB or fallback
  useEffect(() => {
    async function loadCategories() {
      if (!supabase) return;
      try {
        const { data } = await supabase.from("categories").select("*");
        if (data && data.length > 0) {
          setCategories(
            data.map((c: any) => ({
              name: c.name,
              label: c.label || c.name,
              icon: c.icon || "bx bx-category",
              color: c.color || "#007aff",
            }))
          );
        }
      } catch (err) {
        console.error("Failed to load categories:", err);
      }
    }
    loadCategories();
  }, []);

  // 2. Fetch user's previous proposals
  const fetchUserProposals = useCallback(async () => {
    if (!user || !supabase) return;
    setProposalsLoading(true);
    try {
      const { data, error } = await supabase
        .from("place_proposals")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (!error && data) {
        setUserProposals(data as PlaceProposal[]);
      }
    } catch (err) {
      console.error("Failed to fetch user proposals:", err);
    } finally {
      setProposalsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user && !authLoading) {
      fetchUserProposals();
    }
  }, [user, authLoading, fetchUserProposals]);

  // 3. Check pending feedback limit (max 5)
  const checkLimit = useCallback(async () => {
    if (!user) {
      setLimitChecking(false);
      return;
    }
    setLimitChecking(true);
    try {
      const reached = await isFeedbackLimitReached(user.id);
      setLimitReached(reached);
    } catch (err) {
      console.error("Failed to check pending limit:", err);
    } finally {
      setLimitChecking(false);
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading) {
      checkLimit();
    }
  }, [authLoading, checkLimit]);

  // 4. Fetch existing proposal if in edit mode
  useEffect(() => {
    async function loadProposal() {
      if (!editId || !supabase || !user) return;
      setInitialFetching(true);
      setErrorMsg("");
      try {
        const { data, error } = await supabase
          .from("place_proposals")
          .select("*")
          .eq("id", editId)
          .eq("user_id", user.id)
          .single();

        if (error) {
          setErrorMsg("لم يتم العثور على المكان المقترح أو ليس لديك صلاحية لتعديله.");
        } else if (data) {
          setRejectionReason(data.rejection_reason || null);
          const links = data.social_links || {};
          setFormData({
            name: data.name || "",
            category: data.category || "",
            category_label: data.category_label || "",
            sub_categories: Array.isArray(data.sub_categories) ? data.sub_categories : [],
            place_type: data.place_type || "",
            place_type_icon: data.place_type_icon || "",
            governorate: data.governorate || "",
            city: data.city || "",
            address: data.address || "",
            phone: data.phone || "",
            description: data.description || "",
            image_url: data.image_url || "",
            images: Array.isArray(data.images) ? data.images : [],
            working_hours: data.working_hours || "",
            price_range: data.price_range || "متوسط",
            location_url: data.location_url || "",
            facebook: links.facebook || "",
            instagram: links.instagram || "",
            website_url: data.website_url || "",
            services: Array.isArray(data.services) ? data.services : [],
            features: Array.isArray(data.features) ? data.features : [],
          });
        }
      } catch (err) {
        setErrorMsg("حدث خطأ أثناء تحميل بيانات المكان.");
      } finally {
        setInitialFetching(false);
      }
    }

    if (!authLoading) {
      if (!user) {
        router.push("/login?redirect=/propose-place");
      } else if (editId) {
        loadProposal();
      }
    }
  }, [editId, user, authLoading, router]);

  // 5. Category Selection
  const handleCategoryChange = (catName: string) => {
    const mainCat = CATEGORIES_STRUCTURE.find((c) => c.name === catName);
    const subCats = mainCat?.subCategories || [];
    setFormData((prev) => ({
      ...prev,
      category: catName,
      category_label: mainCat ? mainCat.label : catName,
      sub_categories: subCats.length > 0 ? [subCats[0].name] : [],
      place_type: "",
      place_type_icon: "",
    }));
  };

  // 6. Image Management
  const handleAddImage = (e?: React.FormEvent | React.MouseEvent) => {
    if (e) e.preventDefault();
    if (!newImgInput.trim()) return;
    const url = newImgInput.trim();
    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, url],
      image_url: prev.image_url || url,
    }));
    setNewImgInput("");
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImg(true);
    try {
      if (supabase) {
        const fileExt = file.name.split(".").pop() || "jpg";
        const fileName = `proposals_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
        const filePath = `proposals/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(filePath, file, { upsert: true });

        if (!uploadError) {
          const {
            data: { publicUrl },
          } = supabase.storage.from("avatars").getPublicUrl(filePath);
          if (publicUrl) {
            setFormData((prev) => ({
              ...prev,
              images: [...prev.images, publicUrl],
              image_url: prev.image_url || publicUrl,
            }));
            setIsUploadingImg(false);
            return;
          }
        }
      }

      // Fallback: Read file as Data URL locally if storage bucket error
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result) {
          setFormData((prev) => ({
            ...prev,
            images: [...prev.images, result],
            image_url: prev.image_url || result,
          }));
        }
        setIsUploadingImg(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error("Image upload failed:", err);
      setIsUploadingImg(false);
    }
  };

  const handleRemoveImage = (index: number) => {
    setFormData((prev) => {
      const updated = prev.images.filter((_, i) => i !== index);
      return {
        ...prev,
        images: updated,
        image_url: updated.length > 0 ? updated[0] : "",
      };
    });
  };

  // 7. Reset Form
  const resetForm = () => {
    setFormData(INITIAL_FORM_DATA);
    setSuccess(false);
    setErrorMsg("");
    setRejectionReason(null);
  };

  // 8. Cancel Edit Mode
  const cancelEdit = () => {
    resetForm();
    router.push("/propose-place");
  };

  // 9. Submit Form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !supabase) {
      setErrorMsg("يرجى تسجيل الدخول أولاً لإرسال المقترح.");
      return;
    }

    if (!formData.name.trim() || !formData.category || !formData.governorate || !formData.city) {
      setErrorMsg("يرجى ملء جميع الحقول الإلزامية (اسم المكان، التصنيف، المحافظة، والمدينة).");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    const payload = {
      user_id: user.id,
      name: formData.name.trim(),
      category: formData.category,
      category_label: formData.category_label || formData.category,
      sub_categories: formData.sub_categories || [],
      place_type: formData.place_type.trim() || null,
      place_type_icon: formData.place_type.trim()
        ? formatBoxIcon(formData.place_type_icon).trim() || "bx bx-tag"
        : null,
      governorate: formData.governorate,
      city: formData.city,
      address: formData.address.trim(),
      phone: formData.phone.trim(),
      description: formData.description.trim(),
      image_url: formData.image_url || (formData.images.length > 0 ? formData.images[0] : ""),
      images: formData.images,
      working_hours: formData.working_hours.trim(),
      price_range: formData.price_range,
      location_url: formData.location_url.trim(),
      social_links: {
        facebook: formData.facebook.trim(),
        instagram: formData.instagram.trim(),
      },
      website_url: formData.website_url.trim(),
      services: formData.services || [],
      features: formData.features || [],
      status: "pending",
      rejection_reason: null,
      updated_at: new Date().toISOString(),
    };

    try {
      if (editId) {
        let { error } = await supabase
          .from("place_proposals")
          .update(payload)
          .eq("id", editId)
          .eq("user_id", user.id);

        if (error) {
          console.warn("Update failed with website_url, trying fallback...");
          const fallbackPayload = { ...payload };
          // @ts-ignore
          delete fallbackPayload.website_url;
          let retry = await supabase
            .from("place_proposals")
            .update(fallbackPayload)
            .eq("id", editId)
            .eq("user_id", user.id);

          if (retry.error) {
            // @ts-ignore
            delete fallbackPayload.sub_categories;
            retry = await supabase
              .from("place_proposals")
              .update(fallbackPayload)
              .eq("id", editId)
              .eq("user_id", user.id);
          }
          error = retry.error;
        }
        if (error) throw error;
      } else {
        let { error } = await supabase.from("place_proposals").insert([payload]);
        if (error) {
          console.warn("Insert failed with website_url, trying fallback...");
          const fallbackPayload = { ...payload };
          // @ts-ignore
          delete fallbackPayload.website_url;
          let retry = await supabase.from("place_proposals").insert([fallbackPayload]);
          if (retry.error) {
            // @ts-ignore
            delete fallbackPayload.sub_categories;
            retry = await supabase.from("place_proposals").insert([fallbackPayload]);
          }
          error = retry.error;
        }
        if (error) throw error;
      }
      setSuccess(true);
      fetchUserProposals();
      checkLimit();
    } catch (err: any) {
      setErrorMsg("حدث خطأ أثناء حفظ المكان المقترح: " + (err.message || "حاول مرة أخرى"));
    } finally {
      setLoading(false);
    }
  };

  return {
    formData,
    setFormData,
    categories,
    loading,
    initialFetching,
    success,
    setSuccess,
    errorMsg,
    setErrorMsg,
    rejectionReason,
    limitChecking,
    limitReached,
    userProposals,
    proposalsLoading,
    editId,
    newImgInput,
    setNewImgInput,
    isUploadingImg,
    handleCategoryChange,
    handleAddImage,
    handleFileUpload,
    handleRemoveImage,
    resetForm,
    cancelEdit,
    fetchUserProposals,
    handleSubmit,
  };
}
